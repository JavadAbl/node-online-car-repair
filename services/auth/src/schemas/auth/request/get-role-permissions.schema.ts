import { Type } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { GetManyQuery, GetManyQuerySchema } from "../../common/get-many-request.schema.js";
import { RolePermissionDto, RolePermissionSchema } from "../reply/role-permission.schema.js";
import { StatusCodes } from "http-status-codes";

export const GetRolePermissionsSchema: FastifySchema = {
  querystring: GetManyQuerySchema,
  description: "Get Role Permissions",
  tags: ["RolePermission"],
  response: { [StatusCodes.OK]: Type.Array(RolePermissionSchema) },
};

export interface GetRolePermissionsRouteType extends RouteGenericInterface {
  Querystring: GetManyQuery<"RolePermission">;
  Reply: RolePermissionDto[];
}
