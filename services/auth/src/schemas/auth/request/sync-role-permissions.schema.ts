import { Type, Static } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { Role } from "../../../infrastructure/database/generated/prisma/enums.js";
import { RolePermissionDto, RolePermissionSchema } from "../reply/role-permission.schema.js";
import { StatusCodes } from "http-status-codes";

const SyncRolePermissionsBodySchema = Type.Object({
  role: Type.Enum(Role, { description: "Role" }),
  permissionNames: Type.Array(Type.String({ description: "Permission name" }), {
    description:
      "The COMPLETE desired grant list for this role. Omitted permissions are revoked. " +
      "Duplicates are ignored. Every name must exist in the permission catalog.",
    maxItems: 500,
    uniqueItems: true,
  }),
});

export const SyncRolePermissionsSchema: FastifySchema = {
  body: SyncRolePermissionsBodySchema,
  description: "Replace a role's permission grants with the submitted list (bulk sync)",
  tags: ["RolePermission"],
  response: { [StatusCodes.OK]: Type.Array(RolePermissionSchema) },
};

export type SyncRolePermissions = Static<typeof SyncRolePermissionsBodySchema>;

export interface SyncRolePermissionsRouteType extends RouteGenericInterface {
  Body: SyncRolePermissions;
  Reply: RolePermissionDto[];
}
