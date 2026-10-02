// E2E harness (auth service, phase 3) — no infra required.
// Exercises REAL code paths for the role & permission management feature:
//   1. authService.getRoles / getPermissionReferences / getRolePermissionsByRole
//   2. authService.syncRolePermissions — fail-closed validation, diff-only writes,
//      idempotency, event fan-out (create/delete) for the downstream mirrors
//   3. userService.syncUserPermissions — the user-grant twin: validation, diff-only
//      writes, idempotency, and (by design) NO RMQ fan-out
//   4. REAL authRoutes on a REAL fastify instance — the four role endpoints,
//      schema validation (role enum in params/body), guard matrix (401/403/200),
//      and permission-registry collection of the new action permissions
//   5. REAL userRoutes on a REAL fastify instance — listing/role/user-grant
//      endpoints incl. PUT /Users/:id/SyncUserPermissions end-to-end

process.env.NODE_ENV = "test";
process.env.HTTP_PORT = "3996";
process.env.HTTP_HOST = "127.0.0.1";
process.env.DATABASE_HOST = "127.0.0.1";
process.env.DATABASE_PORT = "3306";
process.env.DATABASE_USERNAME = "u";
process.env.DATABASE_PASSWORD = "p";
process.env.DATABASE_NAME = "auth_db";
process.env.DATABASE_URL = "mysql://u:p@127.0.0.1:3306/auth_db";
process.env.RABBITMQ_URL = "amqp://u:p@127.0.0.1:5672";
process.env.REDIS_HOST = "127.0.0.1";
process.env.REDIS_PORT = "6379";
process.env.REDIS_PASSWORD = "p";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

const AUTH = new URL("../src", import.meta.url).pathname;

// --- real modules ----------------------------------------------------------
const { authService } = await import(`${AUTH}/services/auth.service.ts`);
const { prisma } = await import(`${AUTH}/infrastructure/database/prisma-provider.ts`);
const { rmqPublisher } = await import(`${AUTH}/infrastructure/rabbitmq/rmq.provider.ts`);
const { authPlugin, collectedRoutePermissions } = await import(`${AUTH}/plugins/auth.plugin.ts`);
const { userContextPlugin } = await import(`${AUTH}/plugins/user-context.plugin.ts`);
const { authRoutes } = await import(`${AUTH}/routes/auth.route.ts`);
const { userService } = await import(`${AUTH}/services/user.service.ts`);
const { userRoutes } = await import(`${AUTH}/routes/user.route.ts`);
const {
  RMQ_P_RK_ROLE_PERMISSION_CREATE,
  RMQ_P_RK_ROLE_PERMISSION_DELETE,
} = await import(`${AUTH}/infrastructure/rabbitmq/config/rmq-config.ts`);
const fastify = (await import("fastify")).default;

let pass = 0, fail = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
};

// ---------------------------------------------------------------------------
// In-memory fakes installed onto the real singletons
// ---------------------------------------------------------------------------

// permissionReference (the global catalog) ------------------------------------
const catalog = [
  { name: "auth", type: "Service" },
  { name: "auth.AuthController", type: "Controller" },
  { name: "auth.AuthController.GetRoles", type: "Action" },
  { name: "auth.AuthController.SyncRolePermissions", type: "Action" },
  { name: "vehicle", type: "Service" },
  { name: "vehicle.VehicleController", type: "Controller" },
  { name: "vehicle.VehicleController.CreateVehicle", type: "Action" },
  { name: "vehicle.VehicleController.GetVehicle", type: "Action" },
];

// userPermission (personal grants) ------------------------------------------------
type UpRow = { id: number; userId: number; permissionName: string; createdAt: Date; updatedAt: Date };
const upRows = new Map<number, UpRow>();
let upSeq = 0;

// user rows ---------------------------------------------------------------------
const fakeUsers = new Map<number, { id: number; mobile: string; role: string }>([
  [1, { id: 1, mobile: "09120000001", role: "Customer" }],
  [2, { id: 2, mobile: "09120000002", role: "Operator" }],
]);

// rolePermission (grants) -----------------------------------------------------
type RpRow = { id: number; role: string; permissionName: string; createdAt: Date; updatedAt: Date };
const rpRows = new Map<number, RpRow>();
let rpSeq = 0;
const snapshot = () => [...rpRows.values()].map((r) => `${r.role}:${r.permissionName}`).sort();
const events: { key: string; payload: any }[] = [];

const matchesWhere = (r: RpRow, where: any) => {
  if (where?.role !== undefined && r.role !== where.role) return false;
  if (where?.permissionName?.in !== undefined && !where.permissionName.in.includes(r.permissionName)) return false;
  return true;
};

(prisma as any).permissionReference = {
  findMany: async ({ where, orderBy }: any = {}) => {
    let list = catalog.filter((row) => {
      if (where?.name?.in !== undefined) return where.name.in.includes(row.name);
      return true;
    });
    if (orderBy?.name === "asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  },
};
(prisma as any).rolePermission = {
  findMany: async ({ where, orderBy }: any = {}) => {
    let list = [...rpRows.values()].filter((r) => matchesWhere(r, where));
    if (orderBy?.permissionName === "asc") list = [...list].sort((a, b) => a.permissionName.localeCompare(b.permissionName));
    return list;
  },
};
(prisma as any).userPermission = {
  findMany: async ({ where, select, orderBy }: any = {}) => {
    let list = [...upRows.values()].filter((r) => where?.userId === undefined || r.userId === where.userId);
    if (orderBy?.permissionName === "asc") list = [...list].sort((a, b) => a.permissionName.localeCompare(b.permissionName));
    return list.map((r) => (select?.permissionName ? { permissionName: r.permissionName } : { ...r }));
  },
};
(prisma as any).user = {
  findFirst: async ({ where }: any = {}) => {
    const u = fakeUsers.get(where?.id);
    return u ? { ...u } : null;
  },
  findMany: async () => [...fakeUsers.values()].map((u) => ({ ...u })),
};
(prisma as any).$transaction = async (fn: any) =>
  fn({
    rolePermission: {
      createMany: async ({ data }: any) => {
        for (const d of data) {
          const id = ++rpSeq;
          rpRows.set(id, { id, createdAt: new Date(), updatedAt: new Date(), ...d });
        }
        return { count: data.length };
      },
      deleteMany: async ({ where }: any) => {
        let count = 0;
        for (const id of where.id.in) if (rpRows.delete(id)) count++;
        return { count };
      },
    },
    userPermission: {
      createMany: async ({ data }: any) => {
        for (const d of data) {
          const id = ++upSeq;
          upRows.set(id, { id, createdAt: new Date(), updatedAt: new Date(), ...d });
        }
        return { count: data.length };
      },
      deleteMany: async ({ where }: any) => {
        let count = 0;
        for (const id of where.id.in) if (upRows.delete(id)) count++;
        return { count };
      },
    },
  });
(rmqPublisher as any).publish = async (key: string, payload: any) => {
  events.push({ key, payload });
};

const creates = () => events.filter((e) => e.key === RMQ_P_RK_ROLE_PERMISSION_CREATE);
const deletes = () => events.filter((e) => e.key === RMQ_P_RK_ROLE_PERMISSION_DELETE);

// ---------------------------------------------------------------------------
console.log("\n━━━ 1. catalog & roles readers ━━━");

const roles = authService.getRoles();
check("getRoles: all four enum values", JSON.stringify(roles) === JSON.stringify(["Admin", "NewUser", "Customer", "Operator"]), `got ${JSON.stringify(roles)}`);

const refs = await authService.getPermissionReferences();
check("getPermissionReferences: full catalog, sorted", refs.length === catalog.length && refs[0].name === "auth" && refs[1].name === "auth.AuthController", `got ${refs.length}`);
check("getPermissionReferences: carries the type", refs.find((r) => r.name === "vehicle")?.type === "Service" && refs.find((r) => r.name === "vehicle.VehicleController")?.type === "Controller");

const none = await authService.getRolePermissionsByRole("Operator" as any);
check("getRolePermissionsByRole: empty for a fresh role", none.length === 0);

// ---------------------------------------------------------------------------
console.log("\n━━━ 2. syncRolePermissions: validation & diff semantics ━━━");

let err: any = null;
try { await authService.syncRolePermissions({ role: "Operator", permissionNames: ["nope.Nope"] }); }
catch (e) { err = e; }
check("unknown permission -> 400 BadRequest", err?.statusCode === 400 && /nope\.Nope/.test(err?.message ?? ""), `got ${err?.statusCode} ${err?.message}`);
check("failed validation wrote nothing", rpRows.size === 0 && events.length === 0);

const res1 = await authService.syncRolePermissions({
  role: "Operator",
  permissionNames: ["auth.AuthController.GetRoles", "vehicle", "vehicle"], // duplicate on purpose
});
check("initial sync: response lists the 2 grants", res1.length === 2 && res1.map((r) => r.permissionName).join() === "auth.AuthController.GetRoles,vehicle", `got ${res1.map((r) => r.permissionName).join()}`);
check("initial sync: 2 rows persisted", rpRows.size === 2);
check("initial sync: 2 create events (one per grant)", creates().length === 2);
check("create event shape matches downstream mirror contract", creates().every((e) => typeof e.payload.id === "number" && e.payload.role === "Operator" && typeof e.payload.permissionName === "string"));

const eventsBefore = events.length;
const rowsBefore = snapshot();
const res2 = await authService.syncRolePermissions({
  role: "Operator",
  permissionNames: ["auth.AuthController.GetRoles", "vehicle"],
});
check("idempotent sync: no new events", events.length === eventsBefore);
check("idempotent sync: rows untouched", JSON.stringify(snapshot()) === JSON.stringify(rowsBefore));
check("idempotent sync: response still complete", res2.length === 2);

const res3 = await authService.syncRolePermissions({
  role: "Operator",
  permissionNames: ["vehicle.VehicleController.CreateVehicle"],
});
check("diff sync: final state is exactly the submitted list", JSON.stringify(snapshot()) === JSON.stringify(["Operator:vehicle.VehicleController.CreateVehicle"]), `got ${snapshot()}`);
check("diff sync: +1 create / -2 delete events", creates().length === 3 && deletes().length === 2);
check("delete events carry the removed row ids", deletes().every((e) => typeof e.payload.id === "number"));
check("diff sync: response reflects the new state", res3.length === 1 && res3[0].permissionName === "vehicle.VehicleController.CreateVehicle");

const res4 = await authService.syncRolePermissions({ role: "Operator", permissionNames: [] });
check("empty sync: revokes everything", rpRows.size === 0 && res4.length === 0 && deletes().length === 3);

// ---------------------------------------------------------------------------
console.log("\n━━━ 3. syncUserPermissions: the user-grant twin ━━━");

const upSnapshot = () => [...upRows.values()].map((r) => `${r.userId}:${r.permissionName}`).sort();
const eventsBeforeUserSync = events.length;

err = null;
try { await userService.syncUserPermissions(1, { permissionNames: ["nope.Nope"] }); }
catch (e) { err = e; }
check("unknown permission -> 400 BadRequest", err?.statusCode === 400 && /nope\.Nope/.test(err?.message ?? ""), `got ${err?.statusCode} ${err?.message}`);
check("failed validation wrote nothing", upRows.size === 0);

err = null;
try { await userService.syncUserPermissions(999, { permissionNames: ["auth"] }); }
catch (e) { err = e; }
check("unknown user -> 404 NotFound", err?.statusCode === 404, `got ${err?.statusCode} ${err?.message}`);

const u1 = await userService.syncUserPermissions(1, {
  permissionNames: ["auth.AuthController.GetRoles", "vehicle", "vehicle"], // duplicate on purpose
});
check("initial user sync: response lists the 2 grants", u1.length === 2 && u1.map((x) => x.name).join() === "auth.AuthController.GetRoles,vehicle", `got ${u1.map((x) => x.name).join()}`);
check("initial user sync: 2 rows persisted", upRows.size === 2);
check("user sync emits NO rmq events (claims-only, nothing to mirror)", events.length === eventsBeforeUserSync, `got ${events.length - eventsBeforeUserSync} new`);

const uRowsBefore = upSnapshot();
const u2 = await userService.syncUserPermissions(1, {
  permissionNames: ["auth.AuthController.GetRoles", "vehicle"],
});
check("idempotent user sync: rows untouched", upSnapshot() === uRowsBefore || JSON.stringify(upSnapshot()) === JSON.stringify(uRowsBefore));
check("idempotent user sync: response still complete", u2.length === 2);

const u3 = await userService.syncUserPermissions(1, { permissionNames: ["vehicle.VehicleController.CreateVehicle"] });
check("diff user sync: state is exactly the submitted list", JSON.stringify(upSnapshot()) === JSON.stringify(["1:vehicle.VehicleController.CreateVehicle"]), `got ${upSnapshot()}`);
check("diff user sync: response reflects the new state", u3.length === 1 && u3[0].name === "vehicle.VehicleController.CreateVehicle");

const u4 = await userService.syncUserPermissions(1, { permissionNames: [] });
check("empty user sync: revokes everything", upRows.size === 0 && u4.length === 0);
check("user sync never emitted any rmq event across all calls", events.length === eventsBeforeUserSync);

// other users are isolated -----------------------------------------------
await userService.syncUserPermissions(2, { permissionNames: ["vehicle"] });
check("user 2 grants do not leak into user 1", (await userService.getUserPermissions(1)).length === 0);
check("user 2 sees exactly their own grant", (await userService.getUserPermissions(2)).length === 1);

// ---------------------------------------------------------------------------
console.log("\n━━━ 4. REAL routes on a REAL fastify instance ━━━");

const app = fastify();
await app.register(authPlugin);
await app.register(userContextPlugin);
await app.register(authRoutes, { prefix: "/Auth/" });
await app.ready(); // compiles schemas; fail-fast guard check must pass
await app.listen({ port: 3997, host: "127.0.0.1" });
const base = "http://127.0.0.1:3997";

const hit = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* raw */ }
  return { status: res.status, json, text };
};
const admin = { "x-user-id": "42", "x-user-role": "Admin" };

// Registry collection: the new action permissions must be part of the catalog
for (const name of [
  "auth.AuthController.GetRoles",
  "auth.AuthController.GetPermissionReferences",
  "auth.AuthController.GetRolePermissionsByRole",
  "auth.AuthController.SyncRolePermissions",
]) {
  check(`registry collects ${name}`, collectedRoutePermissions.has(name));
}

let r = await hit("GET", "/Auth/Roles");
check("GET /Auth/Roles: 401 without identity", r.status === 401);

r = await hit("GET", "/Auth/Roles", undefined, admin);
check("GET /Auth/Roles: Admin -> 200 with 4 roles", r.status === 200 && JSON.stringify(r.json) === JSON.stringify(["Admin", "NewUser", "Customer", "Operator"]), `got ${r.status} ${r.text.slice(0, 60)}`);

r = await hit("GET", "/Auth/Roles", undefined, { "x-user-id": "7", "x-user-role": "NewUser" });
check("GET /Auth/Roles: non-admin without grant -> 403", r.status === 403, `got ${r.status}`);

r = await hit("GET", "/Auth/Roles", undefined, {
  "x-user-id": "7",
  "x-user-role": "NewUser",
  "x-user-permissions": JSON.stringify(["auth.AuthController"]),
});
check("GET /Auth/Roles: controller-level claim covers the action -> 200", r.status === 200, `got ${r.status}`);

r = await hit("GET", "/Auth/PermissionReferences", undefined, admin);
check("GET /Auth/PermissionReferences: 200, catalog serialized with types", r.status === 200 && Array.isArray(r.json) && r.json.find((x: any) => x.name === "vehicle")?.type === "Service", `got ${r.status}`);

r = await hit("GET", "/Auth/RolePermissions/Role/Bogus", undefined, admin);
check("GET /Auth/RolePermissions/Role/Bogus: 400 (role enum validated)", r.status === 400, `got ${r.status}`);

r = await hit("GET", "/Auth/RolePermissions/Role/Customer", undefined, admin);
check("GET /Auth/RolePermissions/Role/Customer: 200, empty list", r.status === 200 && Array.isArray(r.json) && r.json.length === 0, `got ${r.status}`);

const createsBeforePut = creates().length;
r = await hit("PUT", "/Auth/RolePermissions", { role: "Customer", permissionNames: ["auth", "vehicle.VehicleController"] }, admin);
check("PUT /Auth/RolePermissions: 200 with the resulting grants", r.status === 200 && Array.isArray(r.json) && r.json.length === 2, `got ${r.status} ${r.text.slice(0, 80)}`);
check("PUT /Auth/RolePermissions: created rows fanned out as create events", creates().length === createsBeforePut + 2);
check("PUT /Auth/RolePermissions: grant visible via the by-role endpoint", (await hit("GET", "/Auth/RolePermissions/Role/Customer", undefined, admin)).json.length === 2);

r = await hit("PUT", "/Auth/RolePermissions", { role: "Customer", permissionNames: ["typo.Permission"] }, admin);
check("PUT with unknown permission: 400, nothing changed", r.status === 400 && (await hit("GET", "/Auth/RolePermissions/Role/Customer", undefined, admin)).json.length === 2, `got ${r.status}`);

r = await hit("PUT", "/Auth/RolePermissions", { role: "Wizard", permissionNames: ["auth"] }, admin);
check("PUT with invalid role enum: 400", r.status === 400, `got ${r.status}`);

await app.close();

// ---------------------------------------------------------------------------
console.log("\n━━━ 5. REAL userRoutes on a REAL fastify instance ━━━");

const app2 = fastify();
// Minimal stand-in for the production error handler (same statusCode mapping);
// importing the real one would pull in the whole server bootstrap.
app2.setErrorHandler((error: any, _request: any, reply: any) => {
  reply.status(error?.statusCode ?? 500).send({ message: error?.message ?? "Internal Server Error" });
});
await app2.register(authPlugin);
await app2.register(userContextPlugin);
await app2.register(userRoutes, { prefix: "/Users/" });
await app2.ready(); // fail-fast guard check must pass with the user routes too
await app2.listen({ port: 3998, host: "127.0.0.1" });
const base2 = "http://127.0.0.1:3998";

const hit2 = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
  const res = await fetch(`${base2}${path}`, {
    method,
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* raw */ }
  return { status: res.status, json, text };
};

for (const name of [
  "auth.UserController.GetManyUsers",
  "auth.UserController.SetUserRole",
  "auth.UserController.AddUserPermission",
  "auth.UserController.DeleteUserPermission",
  "auth.UserController.GetUserPermissions",
  "auth.UserController.SyncUserPermissions",
]) {
  check(`registry collects ${name}`, collectedRoutePermissions.has(name));
}

r = await hit2("GET", "/Users/Admin");
check("GET /Users/Admin: 401 without identity", r.status === 401);

r = await hit2("GET", "/Users/Admin", undefined, admin);
check("GET /Users/Admin: Admin -> 200, rows carry id/mobile/role", r.status === 200 && Array.isArray(r.json) && r.json.length === 2 && r.json[0].role !== undefined && r.json[0].mobile !== undefined, `got ${r.status} ${r.text.slice(0, 120)}`);

r = await hit2("GET", "/Users/Admin", undefined, { "x-user-id": "7", "x-user-role": "NewUser" });
check("GET /Users/Admin: non-admin without grant -> 403", r.status === 403, `got ${r.status}`);

r = await hit2("GET", "/Users/Admin", undefined, {
  "x-user-id": "7",
  "x-user-role": "NewUser",
  "x-user-permissions": JSON.stringify(["auth.UserController"]),
});
check("GET /Users/Admin: controller-level claim covers the action -> 200", r.status === 200, `got ${r.status}`);

r = await hit2("GET", "/Users/999/GetUserPermissions", undefined, admin);
check("GET /Users/999/GetUserPermissions: unknown user -> 404", r.status === 404, `got ${r.status}`);

r = await hit2("GET", "/Users/1/GetUserPermissions", undefined, admin);
check("GET /Users/1/GetUserPermissions: 200, list of {name}", r.status === 200 && Array.isArray(r.json), `got ${r.status} ${r.text.slice(0, 80)}`);

const eventsBeforePutUser = events.length;
r = await hit2("PUT", "/Users/1/SyncUserPermissions", { permissionNames: ["auth", "vehicle.VehicleController"] }, admin);
check("PUT /Users/1/SyncUserPermissions: 200 with the resulting grants", r.status === 200 && Array.isArray(r.json) && r.json.length === 2, `got ${r.status} ${r.text.slice(0, 100)}`);
check("PUT user sync: no rmq events", events.length === eventsBeforePutUser);
check("PUT user sync: grant visible via GetUserPermissions", (await hit2("GET", "/Users/1/GetUserPermissions", undefined, admin)).json.length === 2);

r = await hit2("PUT", "/Users/1/SyncUserPermissions", { permissionNames: ["typo.Permission"] }, admin);
check("PUT user sync with unknown permission: 400, nothing changed", r.status === 400 && (await hit2("GET", "/Users/1/GetUserPermissions", undefined, admin)).json.length === 2, `got ${r.status}`);

r = await hit2("PUT", "/Users/1/SyncUserPermissions", {}, admin);
check("PUT user sync without permissionNames: 400 (schema)", r.status === 400, `got ${r.status}`);

r = await hit2("PUT", "/Users/1/SyncUserPermissions", { permissionNames: ["auth"] }, { "x-user-id": "7", "x-user-role": "NewUser" });
check("PUT user sync: non-admin without grant -> 403", r.status === 403, `got ${r.status}`);

r = await hit2("PUT", "/Users/1/SyncUserPermissions", { permissionNames: ["auth"] }, {
  "x-user-id": "7",
  "x-user-role": "NewUser",
  "x-user-permissions": JSON.stringify(["auth.UserController.SyncUserPermissions"]),
});
check("PUT user sync: exact action claim -> 200", r.status === 200, `got ${r.status} ${r.text.slice(0, 80)}`);

await app2.close();

// ---------------------------------------------------------------------------
console.log(`\n━━━ RESULT: ${pass} passed, ${fail} failed ━━━`);
process.exit(fail === 0 ? 0 : 1);
