import { prisma } from "../infrastructure/database/prisma-provider.js";
import { PermissionRepository } from "../infrastructure/database/Repository/permission.repository.js";
import { UserRepository } from "../infrastructure/database/Repository/user.repository.js";
import { RMQ_P_RK_USER_CREATE } from "../infrastructure/rabbitmq/config/rmq-config.js";
import { rmqPublisher } from "../infrastructure/rabbitmq/rmq.provider.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { SetUserPermissionDto } from "../schemas/user/request/set-user-permission.schema.js";
import { SetUserRoleDto } from "../schemas/user/request/set-user-role.schema.js";
import { buildFindManyArgs } from "../utils/prisma.util.js";

export const userService = { getMany, getOrCreateUserForLogin, setUserRole, setUserPermissions };
const userRep = new UserRepository();
const permissionRep = new PermissionRepository();

async function getOrCreateUserForLogin(mobile: string) {
  let user = await userRep.findUnique({ where: { mobile } });
  if (!user) {
    user = await userRep.create({ data: { mobile } });
    await rmqPublisher.publish(RMQ_P_RK_USER_CREATE, user);
  }

  const permissions = await permissionRep.findMany({
    where: { UserPermissions: { every: { userId: user.id } } },
  });

  return { ...user, permissions };
}

async function getMany(query: GetManyQuery<"User">) {
  const predicate = buildFindManyArgs(query, { searchableFields: ["mobile"] });
  const users = await userRep.findMany(predicate);
  return users;
}

async function setUserRole(userId: number, payload: SetUserRoleDto): Promise<void> {
  const { role } = payload;
  await userRep.findAndCheckExistsBy({ where: { id: userId } }, "id", userId);
  await userRep.update({ where: { id: userId }, data: { role } });
}

async function setUserPermissions(userId: number, payload: SetUserPermissionDto): Promise<void> {
  await userRep.findAndCheckExistsBy({ where: { id: userId } }, "id", userId);

  const permissionIds = Array.from(new Set(payload.permissionIds || []));

  await prisma.$transaction(async (tx) => {
    // delete user permissions whose permissionId is not in the new list
    await tx.userPermission.deleteMany({
      where: { userId, NOT: permissionIds.length ? { permissionId: { in: permissionIds } } : undefined },
    });

    if (permissionIds.length === 0) return;

    // find which permissionIds are already assigned
    const existing = await tx.userPermission.findMany({
      where: { userId, permissionId: { in: permissionIds } },
      select: { permissionId: true },
    });
    const existingSet = new Set(existing.map((r) => r.permissionId));

    // create missing UserPermission rows
    const toCreate = permissionIds
      .filter((id) => !existingSet.has(id))
      .map((permissionId) => ({ userId, permissionId }));

    if (toCreate.length) {
      await tx.userPermission.createMany({ data: toCreate });
    }
  });
}
