import { Type } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { StatusCodes } from "http-status-codes";

export const GetRolesSchema: FastifySchema = {
  description: "Get the available roles (from the auth database enum)",
  tags: ["RolePermission"],
  response: { [StatusCodes.OK]: Type.Array(Type.String({ description: "Role" })) },
};

export interface GetRolesRouteType extends RouteGenericInterface {
  Reply: string[];
}
