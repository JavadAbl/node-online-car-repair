import { Type, Static } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { Role } from "../../../infrastructure/database/generated/prisma/enums.js";
import { RolePermissionDto, RolePermissionSchema } from "../reply/role-permission.schema.js";
import { StatusCodes } from "http-status-codes";

const RoleParamsSchema = Type.Object({
  role: Type.Enum(Role, { description: "Role" }),
});

export const GetRolePermissionsByRoleSchema: FastifySchema = {
  params: RoleParamsSchema,
  description: "Get every permission granted to one role (no pagination)",
  tags: ["RolePermission"],
  response: { [StatusCodes.OK]: Type.Array(RolePermissionSchema) },
};

export type RoleParams = Static<typeof RoleParamsSchema>;

export interface GetRolePermissionsByRoleRouteType extends RouteGenericInterface {
  Params: RoleParams;
  Reply: RolePermissionDto[];
}
