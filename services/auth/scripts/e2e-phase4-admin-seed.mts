// E2E harness (auth service, phase 4) — no infra required.
// Exercises the REAL seed.service code path for the bootstrap admin
// (SEED_ADMIN_MOBILE):
//   1. var unset            -> seed disabled, zero repo/publisher activity
//   2. user missing         -> created with role=Admin + auth.api-user.create
//                              published with the first-login payload shape
//   3. user exists (NewUser)-> promoted to Admin, NO re-publish (would trip
//                              customer-service's mobile-uniqueness check)
//   4. user already Admin   -> no-op, no writes, no publish
//   5. boot-idempotency     -> running the seed twice changes nothing
//
// Fakes are installed onto the real singletons (same technique as
// e2e-phase3-rbac-admin.mts): in-memory prisma.user + publish spy.

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
process.env.SEED_ADMIN_MOBILE = "";

const AUTH = new URL("../src", import.meta.url).pathname;

// --- real modules (imported AFTER env is set: config reads env at load) ----
const { seedService } = await import(`${AUTH}/services/seed.service.ts`);
const { config } = await import(`${AUTH}/infrastructure/config.ts`);
const { prisma } = await import(`${AUTH}/infrastructure/database/prisma-provider.ts`);
const { rmqPublisher } = await import(`${AUTH}/infrastructure/rabbitmq/rmq.provider.ts`);
const { RMQ_P_RK_USER_CREATE } = await import(`${AUTH}/infrastructure/rabbitmq/config/rmq-config.ts`);

let pass = 0, fail = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
};

// ---------------------------------------------------------------------------
// In-memory fakes installed onto the real singletons
// ---------------------------------------------------------------------------
type UserRow = { id: number; mobile: string; role: string; createdAt: Date; updatedAt: Date };
const users = new Map<number, UserRow>();
let userSeq = 0;

(prisma as any).user = {
  findUnique: async ({ where }: any) => [...users.values()].find((u) => u.mobile === where.mobile) ?? null,
  create: async ({ data }: any) => {
    const row: UserRow = { id: ++userSeq, createdAt: new Date(), updatedAt: new Date(), ...data };
    users.set(row.id, row);
    return row;
  },
  update: async ({ where, data }: any) => {
    const row = users.get(where.id)!;
    Object.assign(row, data, { updatedAt: new Date() });
    return row;
  },
};

const published: { key: string; payload: any }[] = [];
(rmqPublisher as any).publish = async (key: string, payload: any) => {
  published.push({ key, payload });
};

const mobileOf = (m: string) => [...users.values()].find((u) => u.mobile === m);
const reset = () => { users.clear(); published.length = 0; };

// ---------------------------------------------------------------------------
console.log("\n━━━ 1. SEED_ADMIN_MOBILE unset → seed disabled ━━━");
reset();
config.SEED_ADMIN_MOBILE = "";
await seedService.seedAdminUser();
check("no user created", users.size === 0);
check("nothing published", published.length === 0);

// ---------------------------------------------------------------------------
console.log("\n━━━ 2. user missing → create Admin + publish user-create ━━━");
reset();
config.SEED_ADMIN_MOBILE = "09121234567";
await seedService.seedAdminUser();
const created = mobileOf("09121234567");
check("user created", !!created, `users=${JSON.stringify([...users.values()])}`);
check("created with role=Admin", created?.role === "Admin");
check("exactly one publish", published.length === 1);
check("routing key is auth.api-user.create", published[0]?.key === RMQ_P_RK_USER_CREATE, `key=${published[0]?.key}`);
const p = published[0]?.payload;
check("payload carries id/mobile (customer UserCreateEvent contract)", typeof p?.id === "number" && p?.mobile === "09121234567");
check("payload is the full user row (same as organic first login)", p?.role === "Admin" && typeof p?.createdAt === "object");

// ---------------------------------------------------------------------------
console.log("\n━━━ 3. user exists as NewUser → promoted, NO re-publish ━━━");
reset();
const existingId = ++userSeq;
users.set(existingId, {
  id: existingId, mobile: "09121234567", role: "NewUser", createdAt: new Date(), updatedAt: new Date(),
});
await seedService.seedAdminUser();
check("same row kept (no duplicate)", users.size === 1 && users.get(existingId)?.mobile === "09121234567");
check("role updated to Admin", users.get(existingId)?.role === "Admin");
check("no publish on promote (customer uniqueness check would DLQ it)", published.length === 0);

// ---------------------------------------------------------------------------
console.log("\n━━━ 4. user already Admin → no-op ━━━");
reset();
const adminId = ++userSeq;
users.set(adminId, {
  id: adminId, mobile: "09121234567", role: "Admin", createdAt: new Date(), updatedAt: new Date(),
});
const before = JSON.stringify(users.get(adminId));
await seedService.seedAdminUser();
check("row untouched", JSON.stringify(users.get(adminId)) === before);
check("no publish", published.length === 0);

// ---------------------------------------------------------------------------
console.log("\n━━━ 5. boot idempotency → second run changes nothing ━━━");
reset();
config.SEED_ADMIN_MOBILE = "09120000000";
await seedService.seedAdminUser();
const first = JSON.stringify(mobileOf("09120000000"));
const publishedFirst = published.length;
await seedService.seedAdminUser();
check("row identical after re-run", JSON.stringify(mobileOf("09120000000")) === first);
check("no extra publish on re-run", published.length === publishedFirst);

// ---------------------------------------------------------------------------
console.log(`\n${fail === 0 ? "🎉 ALL PASS" : "💥 FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
