// E2E harness (gateway) — uses the REAL serviceProxyPlugin from routes.ts
// (real stripUserHeaders + identityHeaders + reply.from proxying) against a
// live echo downstream service. The only replicated parts are the 5-line
// fastify-jwt setup + auth decorator from index.ts (identical code).

process.env.NODE_ENV = "test";
process.env.HTTP_PORT = "3997";
process.env.HTTP_HOST = "127.0.0.1";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
const ECHO = "http://127.0.0.1:3996";
process.env.AUTH_SERVICE_URL = ECHO;
process.env.VEHICLE_SERVICE_URL = ECHO;
process.env.NOTIFICATION_SERVICE_URL = ECHO;
process.env.CUSTOMER_SERVICE_URL = ECHO;
process.env.PRODUCT_SERVICE_URL = ECHO;
process.env.FACTOR_SERVICE_URL = ECHO;

const jwt = (await import("jsonwebtoken")).default;
const fastify = (await import("fastify")).default;
const { fastifyJwt } = await import("@fastify/jwt");
const { serviceProxyPlugin } = await import("../src/routes.ts");

let pass = 0, fail = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
};

// ---- echo downstream (returns the identity headers it received) ----
const echo = fastify();
echo.all("/*", async (request) => {
  const h = request.headers as Record<string, unknown>;
  return {
    path: request.url,
    xUserId: h["x-user-id"] ?? null,
    xUserRole: h["x-user-role"] ?? null,
    xUserPermissions: h["x-user-permissions"] ?? null,
  };
});
await echo.listen({ port: 3996, host: "127.0.0.1" });

// ---- gateway (real proxy plugin; jwt setup replicated from index.ts) ----
const gw = fastify({ routerOptions: { caseSensitive: false, ignoreTrailingSlash: false } });
await gw.register(fastifyJwt, { secret: "test-access-secret" });
gw.decorate("auth", async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err: any) {
    return reply.code(401).send({ error: "Unauthorized", message: err?.message ?? "Invalid token" });
  }
});
await gw.register(serviceProxyPlugin);
await gw.listen({ port: 3997, host: "127.0.0.1" });

const tokenWith = (payload: object) => jwt.sign(payload, "test-access-secret", { expiresIn: "60m" });

console.log("\n━━━ 8. REAL gateway proxy → echo downstream ━━━");

// 1. Authenticated route: headers injected from JWT (client sends forged ones too)
let res = await fetch("http://127.0.0.1:3997/vehicle-api/Vehicles", {
  headers: {
    Authorization: `Bearer ${tokenWith({ userId: 42, role: "Customer", permissions: ["vehicle.VehicleController", "vehicle.VehicleController.GetAllVehicles"] })}`,
    // Forgery attempt: must be stripped and replaced by JWT-derived values
    "x-user-id": "999",
    "x-user-role": "Admin",
    "x-user-permissions": '["evil"]',
  },
});
let body: any = await res.json();
check("proxy passes (200)", res.status === 200, `status=${res.status}`);
check("x-user-id injected from JWT (forgery stripped)", body.xUserId === "42", `got=${body.xUserId}`);
check("x-user-role injected from JWT (forgery stripped)", body.xUserRole === "Customer", `got=${body.xUserRole}`);
check("x-user-permissions injected as JSON array", Array.isArray(JSON.parse(body.xUserPermissions)) && JSON.parse(body.xUserPermissions).length === 2, `got=${body.xUserPermissions}`);

// 2. Legacy token without permissions claim -> empty array, no crash
res = await fetch("http://127.0.0.1:3997/auth-api/Users", {
  headers: { Authorization: `Bearer ${tokenWith({ userId: 7, role: "Operator" })}` },
});
body = await res.json();
check("legacy token: permissions degrade to []", body.xUserPermissions !== null && JSON.parse(body.xUserPermissions).length === 0, `got=${body.xUserPermissions}`);
check("legacy token: userId/role still injected", body.xUserId === "7" && body.xUserRole === "Operator");

// 3. No token -> 401
res = await fetch("http://127.0.0.1:3997/vehicle-api/Vehicles");
check("missing token: 401", res.status === 401, `status=${res.status}`);

// 4. Garbage token -> 401
res = await fetch("http://127.0.0.1:3997/vehicle-api/Vehicles", { headers: { Authorization: "Bearer not-a-token" } });
check("garbage token: 401", res.status === 401, `status=${res.status}`);

// 5. Public route: no token needed, forged identity headers stripped
res = await fetch("http://127.0.0.1:3997/Auth-Api/Auth/SendOtp", {
  method: "POST",
  headers: { "content-type": "application/json", "x-user-id": "999", "x-user-role": "Admin", "x-user-permissions": '["evil"]' },
  body: JSON.stringify({ mobile: "9123456789" }),
});
body = await res.json();
check("public route: no token required (passes to echo)", res.status === 200, `status=${res.status}`);
check("public route: forged identity headers stripped", body.xUserId === null && body.xUserRole === null && body.xUserPermissions === null, `got=${JSON.stringify(body)}`);

await gw.close();
await echo.close();

console.log(`\n━━━ RESULT: ${pass} passed, ${fail} failed ━━━`);
process.exit(fail === 0 ? 0 : 1);
