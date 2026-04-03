import { permissionRepository } from "../infrastructure/database/Repository/permission.repository.js";
import { userPermissionRepository } from "../infrastructure/database/Repository/user-permission.repository.js";
import { userRepository } from "../infrastructure/database/Repository/user.repository.js";
import { RMQ_P_RK_USER_CREATE } from "../infrastructure/rabbitmq/config/rmq-config.js";
import { rmqPublisher } from "../infrastructure/rabbitmq/rmq.provider.js";
import { PermissionDto } from "../schemas/auth/reply/permission.schema.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { AddUserPermissionDto } from "../schemas/user/request/add-user-permission.schema.js";
import { DeleteUserPermissionDto } from "../schemas/user/request/delete-user-permission.schema copy.js";
import { SetUserRoleDto } from "../schemas/user/request/set-user-role.schema.js";
import { buildFindManyArgs } from "../utils/prisma.util.js";

async function getOrCreateUserForLogin(mobile: string) {
  let user = await userRepository.findUnique({ where: { mobile } });
  if (!user) {
    user = await userRepository.create({ data: { mobile } });
    await rmqPublisher.publish(RMQ_P_RK_USER_CREATE, user);
  }

  const permissions = await permissionRepository.findMany({
    where: { userPermissions: { every: { userId: user.id } } },
  });

  return { ...user, permissions };
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
  const x = await permissionRepository.findMany({
    where: { userPermissions: { every: { userId } } },
    select: { name: true },
  });
  return x;
}

async function getUserById(id: number) {
  return userRepository.findFirst({ where: { id }, select: { id: true, mobile: true } });
}

export const userService = {
  getMany,
  getOrCreateUserForLogin,
  setUserRole,
  addUserPermission,
  removeUserPermission,
  getUserById,
  getUserPermissions,
};
