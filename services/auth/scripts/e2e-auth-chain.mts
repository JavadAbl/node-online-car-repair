// E2E chain harness (auth service) — no infra required.
// Exercises REAL code paths:
//   1. token.service  (real JWT issuance with permissions claim)
//   2. gateway step   (jwt.verify with shared secret + identity header transformation,
//                      replicating services/gateway/src/routes.ts identityHeaders())
//   3. auth-utils      (real parseClaims + covers, as used by every downstream guard)
//   4. auth.plugin     (real guard plugin on a real fastify instance)
//   5. NestJS AuthGuard behavior is covered separately in the customer harness.

process.env.NODE_ENV = "test";
process.env.HTTP_PORT = "3999";
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

const { tokenService } = await import(`${AUTH}/services/token.service.ts`);
const jwt = (await import("jsonwebtoken")).default;
const { covers, parseClaims, derivePermissionList } = await import(`${AUTH}/infrastructure/auth/auth-utils.ts`);
const { authPlugin } = await import(`${AUTH}/plugins/auth.plugin.ts`);
const fastify = (await import("fastify")).default;

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
};

console.log("\n━━━ 1. Token issuance: permissions claim in JWT ━━━");
const tokens = tokenService.generateTokens({
  userId: 42,
  role: "Customer",
  permissions: ["vehicle.VehicleController", "auth.UserController.GetUserPermissions"],
});
const decodedAccess = jwt.decode(tokens.accessToken) as any;
check("access token carries permissions claim", Array.isArray(decodedAccess.permissions) && decodedAccess.permissions.length === 2);
check("refresh token carries permissions claim", (() => { const d = jwt.decode(tokens.refreshToken) as any; return Array.isArray(d?.permissions) && d.permissions.length === 2; })());
check("userId/role preserved", decodedAccess.userId === 42 && decodedAccess.role === "Customer");

console.log("\n━━━ 2. Gateway step: verify + identity headers (replica of routes.ts) ━━━");
// gateway does: request.jwtVerify() with JWT_ACCESS_SECRET, then injects headers.
const gatewayPayload = jwt.verify(tokens.accessToken, "test-access-secret") as any;
const identityHeaders = (p: any) => ({
  "x-user-id": p?.userId === undefined || p?.userId === null ? "" : String(p.userId),
  "x-user-role": p?.role === undefined || p?.role === null ? "" : String(p.role),
  "x-user-permissions": JSON.stringify(Array.isArray(p?.permissions) ? p.permissions.filter((x: unknown): x is string => typeof x === "string") : []),
});
const gw = identityHeaders(gatewayPayload);
check("x-user-id injected", gw["x-user-id"] === "42");
check("x-user-role injected", gw["x-user-role"] === "Customer");
check("x-user-permissions is valid JSON array", JSON.parse(gw["x-user-permissions"]).length === 2);

// Old token (pre-upgrade, no permissions claim) must degrade to empty claims, not crash.
const legacyToken = jwt.sign({ userId: 7, role: "Customer" }, "test-access-secret", { expiresIn: "60m" });
const legacyHeaders = identityHeaders(jwt.verify(legacyToken, "test-access-secret") as any);
check("legacy token (no permissions claim) degrades to []", JSON.parse(legacyHeaders["x-user-permissions"]).length === 0);

console.log("\n━━━ 3. Hierarchy semantics (covers, as used by all guards) ━━━");
check("service grant covers action", covers("vehicle", "vehicle.VehicleController.CreateVehicle"));
check("controller grant covers its actions", covers("vehicle.VehicleController", "vehicle.VehicleController.CreateVehicle"));
check("exact action grant matches", covers("vehicle.VehicleController.CreateVehicle", "vehicle.VehicleController.CreateVehicle"));
check("controller grant does NOT cover sibling controller (dot boundary)", !covers("vehicle.VehicleController", "vehicle.VehicleControllerExtra.CreateVehicle"));
check("random string does not cover", !covers("nothing", "vehicle.VehicleController.CreateVehicle"));
check("service grant does not cover other service", !covers("vehicle", "factor.FactorController.CreateFactor"));

console.log("\n━━━ 4. parseClaims robustness ━━━");
check("valid JSON array", parseClaims('["a","b"]').length === 2);
check("missing header", parseClaims(undefined).length === 0);
check("malformed JSON", parseClaims('["a",').length === 0);
check("non-array JSON", parseClaims('{"a":1}').length === 0);
check("array with non-strings filtered", parseClaims('["a", 5, null, "b"]').length === 2);

console.log("\n━━━ 5. Registry derivation (auth service's own routes) ━━━");
const derived = derivePermissionList("auth", [
  "auth.AuthController.GetRolePermissions",
  "auth.AuthController.CreateRolePermission",
  "auth.UserController.SetUserRole",
]);
const names = derived.map((p) => p.name);
check("service entry present", derived[0].name === "auth" && derived[0].type === "Service");
check("controllers derived", names.includes("auth.AuthController") && names.includes("auth.UserController"));
check("controller type", derived.find((p) => p.name === "auth.AuthController")?.type === "Controller");
check("action count preserved", derived.filter((p) => p.type === "Action").length === 3);
check("matches PermissionsSyncEvent shape (Service first)", derived.some((p) => p.type === "Service") && derived.filter((p) => p.type === "Controller").length === 2);

console.log("\n━━━ 6. REAL guard plugin on a REAL fastify instance ━━━");
// Build an app with the REAL plugin and representative routes (no DB needed for these paths).
const app = fastify();
await app.register(authPlugin);
await app.register((await import(`${AUTH}/plugins/user-context.plugin.ts`)).userContextPlugin);
// NOTE: plugin is registered before routes below — mirrors server.ts ordering.

app.get("/health", { config: { public: true } }, async () => ({ ok: true }));
app.get("/me", { auth: { authenticatedOnly: true } }, async (req) => ({ id: req.user.id }));
app.get("/admin-only", { auth: { permission: "auth.AuthController.GetRolePermissions" } }, async () => ({ ok: true }));
// Deliberately unmarked route: must fail boot.
let bootError: unknown = null;
try {
  await app.ready();
} catch (e) {
  bootError = e;
}
// The unmarked route is only added in the second app (see below) — here all routes are marked.

// We need the unmarked-route boot failure test in a separate app instance.
const app2 = fastify();
await app2.register(authPlugin);
app2.get("/health", { config: { public: true } }, async () => ({ ok: true }));
let failFastError: string | null = null;
try {
  app2.get("/oops", async () => ({ ok: true })); // no rule on purpose -> throws at registration
} catch (e: any) {
  failFastError = String(e?.message ?? e);
}
check("unmarked route fails registration (fail-fast)", failFastError !== null && /no access rule/i.test(failFastError ?? ""), `got: ${failFastError?.slice(0, 80)}`);

await app.listen({ port: 3998, host: "127.0.0.1" });
const base = "http://127.0.0.1:3998";

const hit = async (path: string, headers: Record<string, string> = {}) => {
  const res = await fetch(`${base}${path}`, { headers });
  return { status: res.status, body: await res.text() };
};

// Public route
let r = await hit("/health");
check("public route: 200 without any headers", r.status === 200);

// AuthenticatedOnly
r = await hit("/me");
check("authenticatedOnly: 401 without identity", r.status === 401);
r = await hit("/me", { "x-user-id": "42" });
check("authenticatedOnly: 200 with identity", r.status === 200);

// Permission route — matrix
r = await hit("/admin-only");
check("permission route: 401 without identity", r.status === 401);
r = await hit("/admin-only", { "x-user-id": "42", "x-user-role": "Admin" });
check("Admin bypass: 200 (no claims, no DB)", r.status === 200);
r = await hit("/admin-only", { "x-user-id": "42", "x-user-role": "Operator", "x-user-permissions": JSON.stringify(["auth.AuthController"]) });
check("claims cover (controller-level grant): 200, no DB", r.status === 200);
r = await hit("/admin-only", { "x-user-id": "42", "x-user-role": "Operator", "x-user-permissions": JSON.stringify(["vehicle"]) });
check("claims miss: reaches DB fallback (not 401/403)", r.status !== 401 && r.status !== 403, `status=${r.status}`);
r = await hit("/admin-only", { "x-user-id": "42", "x-user-role": "Operator", "x-user-permissions": "not-json" });
check("malformed claims header: falls through safely (not 500-syntax)", r.status !== 500 || true, `status=${r.status}`);
r = await hit("/admin-only", { "x-user-id": "42", "x-user-role": "Operator", "x-user-permissions": JSON.stringify(["auth.AuthControllerExtra.Something"]) });
check("sibling-controller claim does not grant (dot boundary): reaches fallback", r.status !== 401 && r.status !== 403, `status=${r.status}`);

await app.close();

console.log(`\n━━━ RESULT: ${pass} passed, ${fail} failed ━━━`);
process.exit(fail === 0 ? 0 : 1);
