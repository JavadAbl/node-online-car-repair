import { RolePermissionCreateEvent } from "../../schemas/event-schemas/auth/create-role-permission.schema.js";
import { RolePermissionDeleteEvent } from "../../schemas/event-schemas/auth/delete-role-permission.schema.js";
import { PermissionType, Role } from "../database/generated/prisma/enums.js";
import { authRep } from "../database/Repository/auth.repository.js";
import { RMQ_P_RK_PERMISSIONS } from "../rabbitmq/config/rmq-config.js";
import { rmqPublisher } from "../rabbitmq/rmq.provider.js";

/**
 * Syncs this service's permission registry (derived from route definitions,
 * see plugins/auth.plugin.ts + infrastructure/auth/auth-utils.ts) into the
 * local catalog and publishes it to the auth service's global catalog.
 */
async function setupPermissions(permissions: { name: string; type: PermissionType }[]) {
  await authRep.syncPermissions(permissions);
  await rmqPublisher.publishNoLog(RMQ_P_RK_PERMISSIONS, permissions);
}

function createRolePermission(rolePermissionEvent: RolePermissionCreateEvent) {
  const { permissionName, role, id } = rolePermissionEvent;
  return authRep.createRolePermission({ data: { permissionName, role, id } });
}

function deleteRolePermission(rolePermissionEvent: RolePermissionDeleteEvent) {
  const { id } = rolePermissionEvent;
  return authRep.deleteRolePermission({ where: { id } });
}

/**
 * All permission names granted to a role in this service's local mirror.
 * Used by the guard as the fresh fallback when the token carries no matching claim.
 */
async function getRoleGrantNames(role: string) {
  const roleStr = role as Role;
  const rows = await authRep.findManyRolePermission({
    where: { role: roleStr },
    select: { permissionName: true },
  });
  return rows.map((row) => row.permissionName);
}

export const authService = {
  setupPermissions,
  createRolePermission,
  deleteRolePermission,
  getRoleGrantNames,
};
