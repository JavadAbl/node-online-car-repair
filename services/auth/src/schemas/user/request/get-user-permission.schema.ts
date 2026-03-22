import { Type, Static } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { PermissionDto, PermissionSchema } from "../../auth/reply/permission.schema.js";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";

export const GetUserPermissionSchema: FastifySchema = {
  params: IdParamsSchema,
  description: "Get an user permissions",
  tags: ["User"],
  response: { 200: Type.Array(PermissionSchema) },
};

export interface GetUserPermissionRouteType extends RouteGenericInterface {
  Params: IdParams;
  Reply: PermissionDto[];
}
