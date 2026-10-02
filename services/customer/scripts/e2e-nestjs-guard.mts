// E2E harness (customer service) — REAL AuthGuard, REAL permission utils,
// with lightweight fakes for Reflector/AuthService/ExecutionContext.
// No infra required.

process.env.NODE_ENV = "test";

const { AuthGuard } = await import("../src/common/guards/auth.guard.ts");
const { covers } = await import("../src/common/utils/permission.utils.ts");
const { UnauthorizedException, ForbiddenException } = await import("@nestjs/common");

let pass = 0, fail = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
};

// ---- fakes ----
let publicFlag = false;
let localGrants: string[] = [];
const fakeReflector: any = {
  getAllAndOverride: (_key: string, scopes: any[]) => (scopes[0] as any)?.__isPublic ?? publicFlag,
};
const fakeAuthService: any = {
  getRoleGrantNames: async () => localGrants,
};
const makeContext = (headers: Record<string, string>, handler = "getManyCustomers", controller = "CustomerController") => ({
  switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  getClass: () => ({ name: controller }),
  getHandler: () => ({ name: handler }),
});

const guard = new AuthGuard(fakeReflector, fakeAuthService);
const decide = async (headers: Record<string, string>) => {
  try {
    const ok = await guard.canActivate(makeContext(headers) as any);
    return { ok };
  } catch (e: any) {
    return { ok: false, err: e };
  }
};

console.log("\n━━━ 7. NestJS AuthGuard (real class, customer service) ━━━");

publicFlag = true;
let r = await decide({});
check("@Public handler: allowed without identity", r.ok);
publicFlag = false;

r = await decide({});
check("no identity: UnauthorizedException (401)", !r.ok && r.err instanceof UnauthorizedException, `err=${r.err?.constructor?.name}`);

r = await decide({ "x-user-id": "1", "x-user-role": "Admin" });
check("Admin bypass", r.ok);

r = await decide({ "x-user-id": "1", "x-user-role": "Operator", "x-user-permissions": JSON.stringify(["customer.CustomerController"]) });
check("claims cover (controller-level): allowed", r.ok);

r = await decide({ "x-user-id": "1", "x-user-role": "Operator", "x-user-permissions": JSON.stringify(["customer.CustomerControllerExtra.x"]) });
check("sibling-controller claim does NOT cover (dot boundary)", !r.ok && r.err instanceof ForbiddenException, `err=${r.err?.constructor?.name}`);

localGrants = ["customer"];
r = await decide({ "x-user-id": "1", "x-user-role": "Operator", "x-user-permissions": "[]" });
check("claims miss + local mirror grant (service level): allowed via fallback", r.ok);

localGrants = ["customer.CustomerController"];
r = await decide({ "x-user-id": "1", "x-user-role": "Operator", "x-user-permissions": "garbage" });
check("malformed claims + local controller grant: allowed via fallback", r.ok);

localGrants = ["factor"];
r = await decide({ "x-user-id": "1", "x-user-role": "Operator", "x-user-permissions": "[]" });
check("no claim + no matching local grant: ForbiddenException (403)", !r.ok && r.err instanceof ForbiddenException, `err=${r.err?.constructor?.name}`);

console.log(`\n━━━ RESULT: ${pass} passed, ${fail} failed ━━━`);
process.exit(fail === 0 ? 0 : 1);
