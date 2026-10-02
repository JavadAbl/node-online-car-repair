import { randomInt, randomUUID } from "crypto";
import { cacheCheckConnection } from "../infrastructure/cache/cache-provider.js";
import { otpStore } from "../infrastructure/cache/otp-store.js";
import { evaluateSend, evaluateVerify, OTP_POLICY } from "../infrastructure/auth/otp-policy.js";
import { SendOtpDto } from "../schemas/auth/request/send-otp.schema.js";
import { BadRequestError, TooManyRequestsError, UnauthorizedError } from "../utils/app-error.js";
import { isMobileNumber } from "../utils/app.util.js";
import { VerifyOtpDto } from "../schemas/auth/request/verify-otp.schema.js";
import { userService } from "./user.service.js";
import { tokenService, REFRESH_TOKEN_TTL_MS } from "./token.service.js";
import { AuthDto } from "../schemas/auth/reply/auth.schema.js";
import { PermissionsSyncEvent } from "../schemas/event-schemas/auth/permission-sync.schema.js";
import { CreateRolePermission } from "../schemas/auth/request/create-role-permission.schema.js";
import { rolePermissionRepository } from "../infrastructure/database/Repository/role-permission.repository.js";
import { refreshTokenRepository } from "../infrastructure/database/Repository/refresh-token.repository.js";
import { permissionRepository } from "../infrastructure/database/Repository/permission.repository.js";
import { userRepository } from "../infrastructure/database/Repository/user.repository.js";
import { rmqPublisher } from "../infrastructure/rabbitmq/rmq.provider.js";
import {
  RMQ_P_RK_PERMISSIONS,
  RMQ_P_RK_ROLE_PERMISSION_CREATE,
  RMQ_P_RK_ROLE_PERMISSION_DELETE,
} from "../infrastructure/rabbitmq/config/rmq-config.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { buildFindManyArgs } from "../utils/prisma.util.js";
import { RolePermissionDto } from "../schemas/auth/reply/role-permission.schema.js";
import { PermissionReferenceDto } from "../schemas/auth/reply/permission.schema.js";
import { SyncRolePermissions } from "../schemas/auth/request/sync-role-permissions.schema.js";
import { RefreshDto } from "../schemas/auth/request/refresh.schema.js";
import { LogoutDto } from "../schemas/auth/request/logout.schema.js";
import { isDev } from "../infrastructure/config.js";
import { Role } from "../infrastructure/database/generated/prisma/enums.js";

/** Audit context captured whenever a session is issued or rotated. */
export interface SessionContext {
  ip?: string;
  userAgent?: string;
}

export type UserRef = { id: number; role: Role };

// ---------------------------------------------------------------------------
// OTP flow (throttled)
// ---------------------------------------------------------------------------

async function sendOtp(payload: SendOtpDto): Promise<void> {
  const { mobile } = payload;
  if (!isMobileNumber(mobile)) throw new BadRequestError("Invalid mobile");

  await cacheCheckConnection();

  // Gate 1+2: per-mobile cooldown and per-window volume cap (pure policy).
  const decision = evaluateSend({
    cooldownActive: await otpStore.hasCooldown(mobile),
    sendsInWindow: await otpStore.getSendCount(mobile),
  });
  if (!decision.allow) {
    throw new TooManyRequestsError(
      decision.reason === "cooldown"
        ? `Please wait ${OTP_POLICY.RESEND_COOLDOWN_SECONDS}s before requesting another code`
        : "Too many otp requests for this mobile; try again later",
    );
  }

  // The counter is only incremented once the request is allowed through.
  await otpStore.incrSendCount(mobile);

  const otp = generateOtp();
  await otpStore.setCode(mobile, otp);
  await otpStore.startCooldown(mobile);
  // A fresh code gets a fresh attempt budget.
  await otpStore.resetFailedAttempts(mobile);

  // Dev convenience (no SMS integration yet): the code is visible server-side.
  // In every other environment the code leaves the process only inside the OTP key.
  if (isDev) console.log(`[dev] OTP for ${mobile}: ${otp}`);
  //todo: real SMS provider integration (prod)
}

async function verifyOtp(payload: VerifyOtpDto, ctx: SessionContext = {}): Promise<AuthDto> {
  const { mobile, otp } = payload;
  if (!isMobileNumber(mobile)) throw new BadRequestError("Invalid mobile");

  await cacheCheckConnection();

  const cachedOtp = await otpStore.getCode(mobile);
  const outcome = evaluateVerify({
    cachedOtp,
    submitted: otp,
    failedAttempts: await otpStore.getFailedAttempts(mobile),
  });

  if (outcome.kind === "no_code") throw new BadRequestError("Otp code was expired");

  if (outcome.kind === "wrong" || outcome.kind === "wrong_final") {
    await otpStore.incrFailedAttempts(mobile);
    if (outcome.kind === "wrong_final") {
      // Budget exhausted: void the code, force a fresh SendOtp.
      await otpStore.deleteCode(mobile);
      throw new UnauthorizedError("Wrong otp code; request a new code");
    }
    throw new UnauthorizedError(`Wrong otp code (${outcome.attemptsLeft} attempt(s) left)`);
  }

  // Match: burn the code (no replay within its TTL) and clear attempt history.
  await otpStore.deleteCode(mobile);
  await otpStore.resetFailedAttempts(mobile);

  const user = await userService.getOrCreateUserForLogin(mobile);
  return issueSession(user, ctx);
}

// ---------------------------------------------------------------------------
// Session issuance (login) and rotation (refresh)
// ---------------------------------------------------------------------------

/**
 * Issues a brand-new session for a user: persists the RefreshToken row FIRST
 * (fail-closed — no row, no tokens), then signs the pair embedding its jti.
 * Claims = role grants + user grants at issuance time.
 */
async function issueSession(user: UserRef, ctx: SessionContext): Promise<AuthDto> {
  const permissions = await userService.getUserClaims(user);
  const jti = randomUUID();

  // Row is the source of truth for the token's lifetime; create before signing.
  await refreshTokenRepository.create({
    data: {
      jti,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    },
  });

  return tokenService.generateTokens(
    { userId: user.id, role: user.role, permissions },
    { refreshJti: jti },
  );
}

/**
 * Refresh with rotation. The presented token is ALWAYS retired and replaced:
 *
 *   1. verify JWT (refresh secret, typ=refresh, jti present) — 401 otherwise
 *   2. atomically claim the DB row (only if still live): mark revoked + link to successor
 *   3. create the successor row, then sign the new pair
 *
 * Claim failure means one of:
 *   - row already revoked  -> REPLAY of a rotated token. Assume theft and revoke
 *                             every live session of that user (reuse detection).
 *   - row unknown          -> forged or pre-rotation legacy token -> plain 401.
 *
 * Claims are ALWAYS re-derived from the database (never copied from the old
 * token), so role/grant changes apply at most one refresh later.
 */
async function refresh(payload: RefreshDto, ctx: SessionContext = {}): Promise<AuthDto> {
  const decoded = tokenService.verifyRefreshToken(payload.refreshToken);
  const oldJti = decoded.jti!;

  const user = await userRepository.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new UnauthorizedError("User no longer exists");

  const permissions = await userService.getUserClaims(user);
  const now = new Date();
  const successorJti = randomUUID();

  const claimed = await refreshTokenRepository.prisma.$transaction(async (tx) => {
    // Atomic claim: succeeds only while the row is live. Concurrent refreshes
    // with the same token — exactly one wins, the loser detects the replay.
    const res = await tx.refreshToken.updateMany({
      where: { jti: oldJti, revokedAt: null },
      data: { revokedAt: now, replacedByJti: successorJti },
    });
    if (res.count === 0) return false;

    await tx.refreshToken.create({
      data: {
        jti: successorJti,
        userId: user.id,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      },
    });
    return true;
  });

  if (!claimed) {
    const record = await refreshTokenRepository.findUnique({ where: { jti: oldJti } });
    if (record && record.revokedAt) {
      // Replay of an already-rotated token: assume compromise, kill all sessions.
      await refreshTokenRepository.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError("Refresh token reuse detected; all sessions were revoked");
    }
    throw new UnauthorizedError("Invalid or Expired Refresh Token");
  }

  return tokenService.generateTokens(
    { userId: user.id, role: user.role, permissions },
    { refreshJti: successorJti },
  );
}

/**
 * Revokes the caller's own refresh token. Idempotent: unknown, foreign or
 * already-revoked tokens are silently accepted (logout must never fail UX-wise).
 */
async function logout(payload: LogoutDto, ctx: { userId: number }): Promise<void> {
  const decoded = tokenService.verifyRefreshToken(payload.refreshToken);
  const record = await refreshTokenRepository.findUnique({ where: { jti: decoded.jti! } });
  if (!record || record.userId !== ctx.userId) return; // not ours -> nothing to do

  await refreshTokenRepository.updateMany({
    where: { jti: record.jti, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Periodic sweep of rows whose tokens can no longer be replayed anyway. */
async function pruneExpiredRefreshTokens(): Promise<number> {
  const res = await refreshTokenRepository.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return res.count;
}

// ---------------------------------------------------------------------------
// Permission catalog (unchanged from phase 1)
// ---------------------------------------------------------------------------

/**
 * Receives a service's permission list and syncs it into the global catalog
 * (PermissionReference). Only that service's own prefix is touched.
 */
async function syncPermission(payload: PermissionsSyncEvent): Promise<void> {
  const serviceEntry = payload.find((p) => p.type === "Service");
  if (!serviceEntry) throw new Error("Permission sync payload is missing its Service entry");

  await permissionRepository.prisma.$transaction(async (tx) => {
    const incomingNames = payload.map((p) => p.name);

    // Delete catalog rows of THIS service that are no longer declared.
    // (The startsWith prefix guard makes sure other services' rows are never touched.)
    await tx.permissionReference.deleteMany({
      where: { name: { notIn: incomingNames, startsWith: serviceEntry.name } },
    });

    // Upsert the declared permissions (insert new, update type if it changed).
    for (const permission of payload) {
      await tx.permissionReference.upsert({
        where: { name: permission.name },
        update: { type: permission.type },
        create: { name: permission.name, type: permission.type },
      });
    }
  });
}

/**
 * Publishes this service's own route permissions into the global catalog
 * through the standard permission-sync flow (consumed by this same service).
 */
async function publishOwnPermissions(list: PermissionsSyncEvent): Promise<void> {
  await rmqPublisher.publish(RMQ_P_RK_PERMISSIONS, list);
}

function getRolePermissions(query: GetManyQuery<"RolePermission">): Promise<RolePermissionDto[]> {
  const criteria = buildFindManyArgs<"RolePermission">(query);
  return rolePermissionRepository.findMany(criteria);
}

async function createRolePermission(payload: CreateRolePermission): Promise<void> {
  const { permissionName, role } = payload;
  await rolePermissionRepository.checkDuplicateBy(
    { where: { permissionName, role } },
    "permissionName",
    permissionName,
  );

  await permissionRepository.findAndCheckExistsBy(
    { where: { name: permissionName } },
    "name",
    permissionName,
  );
  const createdRolePermission = await rolePermissionRepository.create({ data: { permissionName, role } });
  await rmqPublisher.publish(RMQ_P_RK_ROLE_PERMISSION_CREATE, createdRolePermission);
}

async function deleteRolePermission(id: number): Promise<void> {
  await rolePermissionRepository.findAndCheckExistsBy({ where: { id } }, "id", id);
  await rolePermissionRepository.remove({ where: { id } });
  await rmqPublisher.publish(RMQ_P_RK_ROLE_PERMISSION_DELETE, { id });
}

// ---------------------------------------------------------------------------
// Role & permission management (admin UI backing, phase 3)
// ---------------------------------------------------------------------------

/** The full global catalog — every permission every service has declared. */
function getPermissionReferences(): Promise<PermissionReferenceDto[]> {
  return permissionRepository.findMany({ orderBy: { name: "asc" } });
}

/** The available roles (kept in sync with the database enum by definition). */
function getRoles(): string[] {
  return Object.values(Role);
}

/** Every grant of one role — the seed state for the admin permissions screen. */
function getRolePermissionsByRole(role: Role): Promise<RolePermissionDto[]> {
  return rolePermissionRepository.findMany({ where: { role }, orderBy: { permissionName: "asc" } });
}

/**
 * Replaces a role's grants with the submitted list in one atomic save:
 *
 *   1. every submitted name must exist in the permission catalog (fail-closed)
 *   2. diff against the current rows -> only real changes hit the database
 *   3. persist add+remove inside ONE transaction
 *   4. after commit, fan out the same create/delete events the single-grant
 *      endpoints emit, so every service's local mirror stays consistent
 *
 * Grants take effect for a user at their next token refresh (claims are
 * re-derived from the database there) or immediately via the mirror fallback.
 */
async function syncRolePermissions(payload: SyncRolePermissions): Promise<RolePermissionDto[]> {
  const { role, permissionNames } = payload;
  const desired = [...new Set(permissionNames)];

  // Fail-closed on unknown names: a typo must never silently grant nothing.
  if (desired.length > 0) {
    const known = await permissionRepository.findMany({ where: { name: { in: desired } } });
    if (known.length !== desired.length) {
      const knownNames = new Set(known.map((k) => k.name));
      const unknown = desired.filter((name) => !knownNames.has(name));
      throw new BadRequestError(`Unknown permission(s): ${unknown.join(", ")}`);
    }
  }

  const current = await rolePermissionRepository.findMany({ where: { role } });
  const currentNames = new Set(current.map((row) => row.permissionName));
  const toAdd = desired.filter((name) => !currentNames.has(name));
  const toRemove = current.filter((row) => !desired.includes(row.permissionName));

  if (toAdd.length > 0 || toRemove.length > 0) {
    await rolePermissionRepository.prisma.$transaction(async (tx) => {
      if (toAdd.length > 0) {
        await tx.rolePermission.createMany({
          data: toAdd.map((permissionName) => ({ role, permissionName })),
        });
      }
      if (toRemove.length > 0) {
        await tx.rolePermission.deleteMany({
          where: { id: { in: toRemove.map((row) => row.id) } },
        });
      }
    });

    // Publish after commit (never announce rolled-back changes).
    // Added rows are re-read so the events carry the generated ids the
    // downstream mirrors copy into their local RolePermission tables.
    if (toAdd.length > 0) {
      const added = await rolePermissionRepository.findMany({
        where: { role, permissionName: { in: toAdd } },
      });
      for (const row of added) {
        await rmqPublisher.publish(RMQ_P_RK_ROLE_PERMISSION_CREATE, row);
      }
    }
    for (const row of toRemove) {
      await rmqPublisher.publish(RMQ_P_RK_ROLE_PERMISSION_DELETE, { id: row.id });
    }
  }

  return rolePermissionRepository.findMany({ where: { role }, orderBy: { permissionName: "asc" } });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateOtp() {
  // Always a real random code — the dev variant is only HOW it is delivered
  // (logged to the server console instead of an SMS, see sendOtp).
  return randomInt(100000, 999999).toString();
}

export const authService = {
  sendOtp,
  verifyOtp,
  syncPermission,
  publishOwnPermissions,
  createRolePermission,
  deleteRolePermission,
  getRolePermissions,
  getPermissionReferences,
  getRoles,
  getRolePermissionsByRole,
  syncRolePermissions,
  refresh,
  logout,
  pruneExpiredRefreshTokens,
};
