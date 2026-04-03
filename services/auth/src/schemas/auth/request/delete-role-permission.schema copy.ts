import { Type } from "@sinclair/typebox";
import { FastifySchema, RouteGenericInterface } from "fastify";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";
import { StatusCodes } from "http-status-codes";

export const DeleteRolePermissionSchema: FastifySchema = {
  params: IdParamsSchema,
  description: "Delete a role permission",
  tags: ["RolePermission"],
  response: { [StatusCodes.NO_CONTENT]: Type.Null() },
};

export interface DeleteRolePermissionRouteType extends RouteGenericInterface {
  Params: IdParams;
  Reply: void;
}
