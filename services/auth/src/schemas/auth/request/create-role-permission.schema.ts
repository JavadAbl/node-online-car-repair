import { Static, Type } from "@sinclair/typebox";
import { FastifySchema, RouteGenericInterface } from "fastify";
import { Role } from "../../../infrastructure/database/generated/prisma/enums.js";
import { StatusCodes } from "http-status-codes";

const CreateRolePermissionBodySchema = Type.Object({
  role: Type.Enum(Role, { description: "Role" }),
  permissionName: Type.String({ description: "The permission to assign" }),
});

export const CreateRolePermissionSchema: FastifySchema = {
  body: CreateRolePermissionBodySchema,
  description: "Create a role permission",
  tags: ["RolePermission"],
  response: { [StatusCodes.CREATED]: Type.Null() },
};

export type CreateRolePermission = Static<typeof CreateRolePermissionBodySchema>;

export interface CreateRolePermissionRouteType extends RouteGenericInterface {
  Body: CreateRolePermission;
  Reply: void;
}
