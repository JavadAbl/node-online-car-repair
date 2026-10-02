// E2E harness (auth service, phase 2) — no infra required.
// Exercises REAL code paths:
//   1. token.service    — typ/jti claims, TTLs, refresh-shape verification
//   2. otp-policy       — pure send/verify decision matrix
//   3. authService      — REAL sendOtp/verifyOtp/refresh/logout/prune against
//                          in-memory fakes for prisma models + redis client
//                          (singletons are swapped by property assignment, which
//                          the repositories/otp-store resolve at call time).

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

// --- real modules ----------------------------------------------------------
const { tokenService, REFRESH_TOKEN_TTL_MS } = await import(`${AUTH}/services/token.service.ts`);
const { evaluateSend, evaluateVerify, OTP_POLICY } = await import(`${AUTH}/infrastructure/auth/otp-policy.ts`);
const { authService } = await import(`${AUTH}/services/auth.service.ts`);
const { prisma } = await import(`${AUTH}/infrastructure/database/prisma-provider.ts`);
const { cacheClient } = await import(`${AUTH}/infrastructure/cache/cache-provider.ts`);
const { rmqPublisher } = await import(`${AUTH}/infrastructure/rabbitmq/rmq.provider.ts`);
const jwt = (await import("jsonwebtoken")).default;

let pass = 0, fail = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
};
const expectError = async (fn: () => Promise<unknown>, status: number) => {
  try { await fn(); return null; }
  catch (e: any) { return e; }
};

// ---------------------------------------------------------------------------
// In-memory fakes installed onto the real singletons
// ---------------------------------------------------------------------------

// redis fake ---------------------------------------------------------------
const kv = new Map<string, string>();
const ttlOf = new Map<string, number>(); // key -> expiresAt (ms), for window/cooldown expiry tests
const now = () => Date.now();
const alive = (k: string) => {
  const exp = ttlOf.get(k);
  return kv.has(k) && (exp === undefined || exp > now());
};
const fakeRedis = {
  get: async (k: string) => (alive(k) ? kv.get(k)! : null),
  setEx: async (k: string, ttl: number, v: string) => { kv.set(k, v); ttlOf.set(k, now() + ttl * 1000); return "OK"; },
  del: async (k: string) => { const had = alive(k); kv.delete(k); ttlOf.delete(k); return had ? 1 : 0; },
  exists: async (k: string) => (alive(k) ? 1 : 0),
  incr: async (k: string) => {
    if (!alive(k)) { kv.set(k, "1"); ttlOf.delete(k); return 1; } // expired -> restart at 1
    const n = Number(kv.get(k)) + 1; kv.set(k, String(n)); return n;
  },
  expire: async (k: string, s: number, mode?: string) => {
    if (mode === "NX" && ttlOf.has(k)) return 0;
    ttlOf.set(k, now() + s * 1000); return 1;
  },
  sendCommand: async (args: (string | number)[]) => {
    // only used for SET key val NX EX ttl (cooldown marker)
    const [cmd, k, v, nx, ex, ttl] = args as string[];
    if (cmd === "SET" && nx === "NX") { if (alive(k)) return null; kv.set(k, v); ttlOf.set(k, now() + Number(ttl) * 1000); return "OK"; }
    return "OK";
  },
  connect: async () => {},
};
for (const [k, v] of Object.entries(fakeRedis)) (cacheClient as any)[k] = v;

// prisma fake ---------------------------------------------------------------
interface Row {
  id: number; jti: string; userId: number; createdAt: Date; expiresAt: Date;
  revokedAt: Date | null; replacedByJti: string | null; ip: string | null; userAgent: string | null;
}
const rows = new Map<string, Row>(); // jti -> row
let rowSeq = 0;

const users = [
  { id: 1, mobile: "09120000000", role: "Customer" as const },
  { id: 2, mobile: "09120000001", role: "Operator" as const },
];
// mutable grant sources — tests flip them to prove claims are re-derived
let roleGrants: { permissionName: string }[] = [{ permissionName: "vehicle.VehicleController" }];
let userGrants: { permissionName: string }[] = [{ permissionName: "factor" }];

const matchesWhere = (r: Row, where: any) => {
  if (where.jti !== undefined && r.jti !== where.jti) return false;
  if (where.userId !== undefined && r.userId !== where.userId) return false;
  if (where.revokedAt === null && r.revokedAt !== null) return false;
  return true;
};
const fakeRefreshToken = {
  findUnique: async ({ where }: any) => (where.jti !== undefined ? rows.get(where.jti) ?? null : null),
  create: async ({ data }: any) => {
    const row: Row = { id: ++rowSeq, createdAt: new Date(), revokedAt: null, replacedByJti: null, ...data };
    rows.set(row.jti, row); return row;
  },
  updateMany: async ({ where, data }: any) => {
    let count = 0;
    for (const r of rows.values()) if (matchesWhere(r, where)) { Object.assign(r, data); count++; }
    return { count };
  },
  deleteMany: async ({ where }: any = {}) => {
    let count = 0;
    for (const [jti, r] of [...rows.entries()]) {
      if (!where || (where.expiresAt?.lt !== undefined && r.expiresAt < where.expiresAt.lt)) { rows.delete(jti); count++; }
    }
    return { count };
  },
};
(prisma as any).refreshToken = fakeRefreshToken;
(prisma as any).user = {
  findUnique: async ({ where }: any) =>
    users.find((u) => (where.id !== undefined ? u.id === where.id : u.mobile === where.mobile)) ?? null,
  create: async ({ data }: any) => { const u = { id: users.length + 1, ...data }; users.push(u as any); return u; },
};
(prisma as any).rolePermission = { findMany: async () => roleGrants };
(prisma as any).userPermission = { findMany: async () => userGrants };
(prisma as any).$transaction = async (fn: any) => fn({ refreshToken: fakeRefreshToken });
// keep the login path from publishing to a broker that does not exist
(rmqPublisher as any).publish = async () => {};

const rowList = () => [...rows.values()];
const decode = (t: string) => jwt.decode(t) as any;

// ---------------------------------------------------------------------------
console.log("\n━━━ 1. token.service: typ/jti claims, TTLs, refresh shape ━━━");

const pair = tokenService.generateTokens({ userId: 1, role: "Customer", permissions: ["a.b"] });
const dAccess = decode(pair.accessToken);
const dRefresh = decode(pair.refreshToken);
check("access token: typ=access, no jti", dAccess.typ === "access" && dAccess.jti === undefined);
check("refresh token: typ=refresh, jti present", dRefresh.typ === "refresh" && typeof dRefresh.jti === "string" && dRefresh.jti.length > 20);
check("access TTL ~15m", dAccess.exp - dAccess.iat === 900, `got ${dAccess.exp - dAccess.iat}s`);
check("refresh TTL ~7d", dRefresh.exp - dRefresh.iat === 604800, `got ${dRefresh.exp - dRefresh.iat}s`);
check("REFRESH_TOKEN_TTL_MS matches 7d", REFRESH_TOKEN_TTL_MS === 7 * 24 * 60 * 60 * 1000);
check("verifyRefreshToken accepts valid token", tokenService.verifyRefreshToken(pair.refreshToken).jti === dRefresh.jti);

const legacyNoTyp = jwt.sign({ userId: 1, role: "Customer" }, "test-refresh-secret", { expiresIn: "7d" });
const legacyNoJti = jwt.sign({ userId: 1, role: "Customer", typ: "refresh" }, "test-refresh-secret", { expiresIn: "7d" });
let e1: any = null; try { tokenService.verifyRefreshToken(legacyNoTyp); } catch (err) { e1 = err; }
check("legacy refresh (no typ) rejected 401", e1?.statusCode === 401);
let e2: any = null; try { tokenService.verifyRefreshToken(legacyNoJti); } catch (err) { e2 = err; }
check("legacy refresh (typ but no jti) rejected 401", e2?.statusCode === 401);
let e3: any = null; try { tokenService.verifyRefreshToken(pair.accessToken); } catch (err) { e3 = err; }
check("access token refused as refresh token", e3?.statusCode === 401);

const fixedJti = "11111111-2222-3333-4444-555555555555";
const pairFixed = tokenService.generateTokens({ userId: 1, role: "Customer" }, { refreshJti: fixedJti });
check("refreshJti option is embedded verbatim", decode(pairFixed.refreshToken).jti === fixedJti);

console.log("\n━━━ 2. otp-policy: pure decision matrix ━━━");

check("send allowed (no cooldown, under cap)", evaluateSend({ cooldownActive: false, sendsInWindow: 2 }).allow === true);
const cd = evaluateSend({ cooldownActive: true, sendsInWindow: 0 }) as any;
check("send blocked by cooldown (429, retryAfter)", cd.allow === false && cd.status === 429 && cd.reason === "cooldown" && cd.retryAfterSeconds === OTP_POLICY.RESEND_COOLDOWN_SECONDS);
const cap = evaluateSend({ cooldownActive: false, sendsInWindow: OTP_POLICY.MAX_SENDS_PER_WINDOW }) as any;
check("send blocked at window cap (429)", cap.allow === false && cap.status === 429 && cap.reason === "window_exceeded");

check("verify: no code -> no_code", evaluateVerify({ cachedOtp: null, submitted: "123456", failedAttempts: 0 }).kind === "no_code");
check("verify: match", evaluateVerify({ cachedOtp: "123456", submitted: "123456", failedAttempts: 0 }).kind === "match");
const w1 = evaluateVerify({ cachedOtp: "123456", submitted: "000000", failedAttempts: 0 }) as any;
check("verify: wrong, attempts left counted", w1.kind === "wrong" && w1.attemptsLeft === OTP_POLICY.MAX_VERIFY_ATTEMPTS - 1);
const wFinal = evaluateVerify({ cachedOtp: "123456", submitted: "000000", failedAttempts: OTP_POLICY.MAX_VERIFY_ATTEMPTS - 1 }) as any;
check("verify: final miss -> wrong_final", wFinal.kind === "wrong_final");

console.log("\n━━━ 3. OTP flow (real authService + fake redis) ━━━");

const M = "09120000000";
await authService.sendOtp({ mobile: M });
const code = kv.get(`otp:${M}`)!;
check("sendOtp stores a real random 6-digit code (NODE_ENV=test, no dev mock)", /^\d{6}$/.test(code) && code !== "123456");
check("code TTL armed (120s)", ttlOf.get(`otp:${M}`)! > now() + 100 * 1000);
check("cooldown marker set", kv.has(`otp:cd:${M}`));
check("send counter = 1", kv.get(`otp:send:${M}`) === "1");

const cdErr = await expectError(() => authService.sendOtp({ mobile: M }), 429);
check("second send within cooldown -> 429 TooManyRequests", cdErr?.statusCode === 429 && /wait/i.test(cdErr?.message ?? ""));

// simulate cooldown elapsed, counter at cap
ttlOf.set(`otp:cd:${M}`, now() - 1000);
kv.set(`otp:send:${M}`, String(OTP_POLICY.MAX_SENDS_PER_WINDOW));
const capErr = await expectError(() => authService.sendOtp({ mobile: M }), 429);
check("send at window cap -> 429", capErr?.statusCode === 429 && /too many/i.test(capErr?.message ?? ""));
kv.set(`otp:send:${M}`, "0");
kv.delete(`otp:${M}`); ttlOf.delete(`otp:${M}`); // no live code right now
const noCode = await expectError(() => authService.verifyOtp({ mobile: M, otp: "123456" }), 400);
check("verify with no live code -> 400 expired", noCode?.statusCode === 400);

// issue a fresh code for the attempt-lockout ladder
ttlOf.set(`otp:cd:${M}`, now() - 1000);
kv.set(`otp:send:${M}`, "0");
await authService.sendOtp({ mobile: M });
const code2 = kv.get(`otp:${M}`)!;

for (let i = 1; i <= OTP_POLICY.MAX_VERIFY_ATTEMPTS - 1; i++) {
  const wrong = await expectError(() => authService.verifyOtp({ mobile: M, otp: "000000" }), 401);
  if (i === 1) check("first wrong code -> 401 with attempts left", wrong?.statusCode === 401 && /attempt\(s\) left/.test(wrong?.message ?? ""));
  if (i === OTP_POLICY.MAX_VERIFY_ATTEMPTS - 1) check(`attempt ${i} wrong -> still 401`, wrong?.statusCode === 401);
}
check(`attempts recorded = ${OTP_POLICY.MAX_VERIFY_ATTEMPTS - 1}`, kv.get(`otp:att:${M}`) === String(OTP_POLICY.MAX_VERIFY_ATTEMPTS - 1));

const finalWrong = await expectError(() => authService.verifyOtp({ mobile: M, otp: "000000" }), 401);
check("miss that exhausts budget -> 401 'request a new code'", finalWrong?.statusCode === 401 && /request a new code/i.test(finalWrong?.message ?? ""));
check("code voided after lockout", !kv.has(`otp:${M}`));

// successful login after fresh code
ttlOf.set(`otp:cd:${M}`, now() - 1000);
kv.set(`otp:send:${M}`, "0");
await authService.sendOtp({ mobile: M });
const code3 = kv.get(`otp:${M}`)!;
const login = await authService.verifyOtp({ mobile: M, otp: code3 }, { ip: "10.0.0.1", userAgent: "harness" });
check("login issues token pair", typeof login.accessToken === "string" && typeof login.refreshToken === "string");
check("code burned after successful use", !kv.has(`otp:${M}`) && !kv.has(`otp:att:${M}`));

console.log("\n━━━ 4. session issuance persists the refresh row ━━━");

const loginJti = decode(login.refreshToken).jti as string;
const loginRow = rows.get(loginJti);
check("refresh row created for the issued token", !!loginRow);
check("row binds userId + audit context", loginRow?.userId === 1 && loginRow?.ip === "10.0.0.1" && loginRow?.userAgent === "harness");
check("row not revoked, expires ~7d out", loginRow?.revokedAt === null && loginRow!.expiresAt.getTime() - now() > REFRESH_TOKEN_TTL_MS - 60_000);
const dLogin = decode(login.accessToken);
check("claims = role grants ∪ user grants", dLogin.permissions.length === 2 && dLogin.permissions.includes("vehicle.VehicleController") && dLogin.permissions.includes("factor"));

console.log("\n━━━ 5. refresh rotation ━━━");

// a grant added AFTER login must appear in the refreshed token (claims re-derived)
roleGrants = [{ permissionName: "vehicle.VehicleController" }, { permissionName: "customer.CustomerController" }];
const rotated = await authService.refresh({ refreshToken: login.refreshToken }, { ip: "10.0.0.2" });
const oldRow = rows.get(loginJti)!;
const newJti = decode(rotated.refreshToken).jti as string;
check("old row revoked and linked to successor", oldRow.revokedAt !== null && oldRow.replacedByJti === newJti);
check("successor row created", rows.has(newJti) && rows.get(newJti)!.revokedAt === null);
check("successor carries new audit context", rows.get(newJti)!.ip === "10.0.0.2");
const dRot = decode(rotated.accessToken);
check("refresh re-derives claims from DB (new grant present, old token frozen)", dRot.permissions.includes("customer.CustomerController") && !dLogin.permissions.includes("customer.CustomerController"));
check("access token of rotated pair is valid & fresh", tokenService.verifyAccessToken(rotated.accessToken).userId === 1);

console.log("\n━━━ 6. replay / reuse detection ━━━");

const replay = await expectError(() => authService.refresh({ refreshToken: login.refreshToken }), 401);
check("replayed (already rotated) token -> 401 reuse detected", replay?.statusCode === 401 && /reuse detected/i.test(replay?.message ?? ""));
check("reuse revokes ALL live sessions of the user", rowList().every((r) => r.revokedAt !== null));
const revokedRotated = await expectError(() => authService.refresh({ refreshToken: rotated.refreshToken }), 401);
check("the once-valid successor is now revoked too", revokedRotated?.statusCode === 401 && /reuse detected/i.test(revokedRotated?.message ?? ""));

// unknown jti (valid signature, no row)
const unknown = tokenService.generateTokens({ userId: 1, role: "Customer" }, { refreshJti: "99999999-9999-9999-9999-999999999999" });
kv.clear(); ttlOf.clear();
rows.clear(); rowSeq = 0; // clean slate for the unknown-jti test (user rows recreated below)
const unknownErr = await expectError(() => authService.refresh({ refreshToken: unknown.refreshToken }), 401);
check("well-signed but unknown jti -> 401 (not 500)", unknownErr?.statusCode === 401);

console.log("\n━━━ 7. logout ━━━");

// fresh session for logout tests
roleGrants = [{ permissionName: "vehicle.VehicleController" }];
ttlOf.set(`otp:cd:${M}`, now() - 1000); kv.set(`otp:send:${M}`, "0");
await authService.sendOtp({ mobile: M });
const codeL = kv.get(`otp:${M}`)!;
const s1 = await authService.verifyOtp({ mobile: M, otp: codeL });
const s1Jti = decode(s1.refreshToken).jti as string;
check("pre-logout: row live", rows.get(s1Jti)?.revokedAt === null);

await authService.logout({ refreshToken: s1.refreshToken }, { userId: 1 });
check("logout revokes own token", rows.get(s1Jti)?.revokedAt !== null);

// idempotent second logout
let logoutTwice = "no-throw";
try { await authService.logout({ refreshToken: s1.refreshToken }, { userId: 1 }); } catch { logoutTwice = "threw"; }
check("second logout is idempotent (no error)", logoutTwice === "no-throw" && rows.get(s1Jti)?.revokedAt !== null);

// foreign caller must not revoke someone else's token
ttlOf.set(`otp:cd:${M}`, now() - 1000); kv.set(`otp:send:${M}`, "0");
await authService.sendOtp({ mobile: M });
const codeF = kv.get(`otp:${M}`)!;
const s2 = await authService.verifyOtp({ mobile: M, otp: codeF });
const s2Jti = decode(s2.refreshToken).jti as string;
await authService.logout({ refreshToken: s2.refreshToken }, { userId: 2 }); // user 2 presents user 1's token
check("foreign logout does not revoke (row stays live)", rows.get(s2Jti)?.revokedAt === null);

console.log("\n━━━ 8. expired-row pruning ━━━");

const expired: Row = {
  id: ++rowSeq, jti: "aaaaaaaa-0000-0000-0000-000000000000", userId: 1, createdAt: new Date(),
  expiresAt: new Date(now() - 1000), revokedAt: new Date(), replacedByJti: null, ip: null, userAgent: null,
};
rows.set(expired.jti, expired);
const removed = await authService.pruneExpiredRefreshTokens();
check("prune removes only expired rows", removed >= 1 && !rows.has(expired.jti) && rows.has(s2Jti));

console.log(`\n━━━ RESULT: ${pass} passed, ${fail} failed ━━━`);
process.exit(fail === 0 ? 0 : 1);
