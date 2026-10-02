import { Type } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { PermissionReferenceDto, PermissionReferenceSchema } from "../reply/permission.schema.js";
import { StatusCodes } from "http-status-codes";

export const GetPermissionReferencesSchema: FastifySchema = {
  description: "Get the global permission catalog (every permission declared by every service)",
  tags: ["RolePermission"],
  response: { [StatusCodes.OK]: Type.Array(PermissionReferenceSchema) },
};

export interface GetPermissionReferencesRouteType extends RouteGenericInterface {
  Reply: PermissionReferenceDto[];
}
