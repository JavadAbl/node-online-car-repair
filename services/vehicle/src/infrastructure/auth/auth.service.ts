import { RolePermissionCreateEvent } from "../../schemas/event-schemas/auth/create-role-permission.schema.js";
import { RolePermissionDeleteEvent } from "../../schemas/event-schemas/auth/delete-role-permission.schema.js";
import { Role } from "../database/generated/prisma/enums.js";
import { authRep } from "../database/Repository/auth.repository.js";
import { RMQ_P_RK_PERMISSIONS } from "../rabbitmq/config/rmq-config.js";
import { rmqPublisher } from "../rabbitmq/rmq.provider.js";
import { APP_PERMISSIONS } from "./permissions.js";

async function setupPermissions() {
  await authRep.syncPermissions(APP_PERMISSIONS);
  await rmqPublisher.publishNoLog(RMQ_P_RK_PERMISSIONS, APP_PERMISSIONS);
}

function createRolePermission(rolePermissionEvent: RolePermissionCreateEvent) {
  const { permissionName, role, id } = rolePermissionEvent;
  return authRep.createRolePermission({ data: { permissionName, role, id } });
}

function deleteRolePermission(rolePermissionEvent: RolePermissionDeleteEvent) {
  const { id } = rolePermissionEvent;
  return authRep.deleteRolePermission({ where: { id } });
}

function findIncludedRolePermission(role: Role, permissionName: string) {
  return authRep.findFirstRolePermission({ where: { role, permissionName: { contains: permissionName } } });
}

export const authService = {
  setupPermissions,
  createRolePermission,
  deleteRolePermission,
  findIncludedRolePermission,
};
