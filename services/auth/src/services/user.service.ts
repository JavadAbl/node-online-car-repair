import { permissionRepository } from "../infrastructure/database/Repository/permission.repository.js";
import { userPermissionRepository } from "../infrastructure/database/Repository/user-permission.repository.js";
import { rolePermissionRepository } from "../infrastructure/database/Repository/role-permission.repository.js";
import { userRepository } from "../infrastructure/database/Repository/user.repository.js";
import { Role } from "../infrastructure/database/generated/prisma/enums.js";
import { RMQ_P_RK_USER_CREATE } from "../infrastructure/rabbitmq/config/rmq-config.js";
import { rmqPublisher } from "../infrastructure/rabbitmq/rmq.provider.js";
import { PermissionDto } from "../schemas/auth/reply/permission.schema.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { AddUserPermissionDto } from "../schemas/user/request/add-user-permission.schema.js";
import { DeleteUserPermissionDto } from "../schemas/user/request/delete-user-permission.schema.js";
import { SetUserRoleDto } from "../schemas/user/request/set-user-role.schema.js";
import { SyncUserPermissionsDto } from "../schemas/user/request/sync-user-permissions.schema.js";
import { buildFindManyArgs } from "../utils/prisma.util.js";
import { BadRequestError } from "../utils/app-error.js";

type UserRef = { id: number; role: Role };

async function getOrCreateUserForLogin(mobile: string) {
  let user = await userRepository.findUnique({ where: { mobile } });
  if (!user) {
    user = await userRepository.create({ data: { mobile } });
    await rmqPublisher.publish(RMQ_P_RK_USER_CREATE, user);
  }
  return user;
}

/**
 * Claims for the JWT `permissions` field:
 * role grants (RolePermission rows for the user's role)
 * united with user grants (UserPermission rows for the user).
 * Top-level names only; hierarchy is resolved at guard time.
 */
async function getUserClaims(user: UserRef): Promise<string[]> {
  const [roleGrants, userGrants] = await Promise.all([
    rolePermissionRepository.findMany({ where: { role: user.role }, select: { permissionName: true } }),
    userPermissionRepository.findMany({ where: { userId: user.id }, select: { permissionName: true } }),
  ]);

  const names = [
    ...roleGrants.map((row) => row.permissionName),
    ...userGrants.map((row) => row.permissionName),
  ];
  return [...new Set(names)];
}

async function getMany(query: GetManyQuery<"User">) {
  const predicate = buildFindManyArgs(query, { searchableFields: ["mobile"] });
  const users = await userRepository.findMany(predicate);
  return users;
}

async function setUserRole(userId: number, payload: SetUserRoleDto): Promise<void> {
  const { role } = payload;
  await userRepository.findAndCheckExistsBy({ where: { id: userId } }, "id", userId);
  await userRepository.update({ where: { id: userId }, data: { role } });
}

async function addUserPermission(userId: number, payload: AddUserPermissionDto): Promise<void> {
  const { name } = payload;
  await userRepository.findAndCheckExistsBy({ where: { id: userId } }, "id", userId);
  await permissionRepository.findAndCheckExistsBy({ where: { name } }, "name", name);
  await userPermissionRepository.checkDuplicateBy({ where: { userId, permissionName: name } }, "name", name);
  userPermissionRepository.create({ data: { userId, permissionName: name } });
}

async function removeUserPermission(userId: number, payload: DeleteUserPermissionDto): Promise<void> {
  const { name } = payload;
  await userRepository.findAndCheckExistsBy({ where: { id: userId } }, "id", userId);
  await permissionRepository.findAndCheckExistsBy({ where: { name } }, "name", name);
  const userPermission = (await userPermissionRepository.findAndCheckExistsBy(
    { where: { userId, permissionName: name } },
    "name",
    name,
  ))!;
  await userPermissionRepository.remove({ where: { id: userPermission.id, userId, permissionName: name } });
}

async function getUserPermissions(userId: number): Promise<PermissionDto[]> {
  await userRepository.findAndCheckExistsBy({ where: { id: userId } }, "id", userId);
  // User grants: UserPermission rows linked to this user (not role grants).
  const rows = await userPermissionRepository.findMany({ where: { userId }, select: { permissionName: true } });
  return rows.map((row) => ({ name: row.permissionName }));
}

/**
 * Replaces a user's personal grants with the submitted list in one atomic save
 * (the user-grant twin of authService.syncRolePermissions):
 *
 *   1. the target user must exist
 *   2. every submitted name must exist in the permission catalog (fail-closed)
 *   3. diff against the current rows -> only real changes hit the database
 *   4. persist add+remove inside ONE transaction
 *
 * No RMQ fan-out: user grants live only in the auth database and enter the
 * picture as JWT claims (re-derived at issue/refresh), so there is nothing to
 * mirror downstream. The change reaches the user's token at their next
 * refresh (<= 15m worst case, the access-token TTL).
 */
async function syncUserPermissions(
  userId: number,
  payload: SyncUserPermissionsDto,
): Promise<PermissionDto[]> {
  const desired = [...new Set(payload.permissionNames)];

  await userRepository.findAndCheckExistsBy({ where: { id: userId } }, "id", userId);

  // Fail-closed on unknown names: a typo must never silently grant nothing.
  if (desired.length > 0) {
    const known = await permissionRepository.findMany({ where: { name: { in: desired } } });
    if (known.length !== desired.length) {
      const knownNames = new Set(known.map((k) => k.name));
      const unknown = desired.filter((name) => !knownNames.has(name));
      throw new BadRequestError(`Unknown permission(s): ${unknown.join(", ")}`);
    }
  }

  const current = await userPermissionRepository.findMany({ where: { userId } });
  const currentNames = new Set(current.map((row) => row.permissionName));
  const toAdd = desired.filter((name) => !currentNames.has(name));
  const toRemove = current.filter((row) => !desired.includes(row.permissionName));

  if (toAdd.length > 0 || toRemove.length > 0) {
    await userPermissionRepository.prisma.$transaction(async (tx) => {
      if (toRemove.length > 0) {
        await tx.userPermission.deleteMany({
          where: { id: { in: toRemove.map((row) => row.id) } },
        });
      }
      if (toAdd.length > 0) {
        await tx.userPermission.createMany({
          data: toAdd.map((permissionName) => ({ userId, permissionName })),
        });
      }
    });
  }

  const rows = await userPermissionRepository.findMany({
    where: { userId },
    select: { permissionName: true },
    orderBy: { permissionName: "asc" },
  });
  return rows.map((row) => ({ name: row.permissionName }));
}

async function getUserById(id: number) {
  return userRepository.findFirst({
    where: { id },
    select: { id: true, mobile: true, role: true },
  });
}

export const userService = {
  getMany,
  getOrCreateUserForLogin,
  getUserClaims,
  setUserRole,
  addUserPermission,
  removeUserPermission,
  syncUserPermissions,
  getUserById,
  getUserPermissions,
};
