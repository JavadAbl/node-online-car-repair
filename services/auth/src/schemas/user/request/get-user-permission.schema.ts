import { Type } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { PermissionDto, PermissionSchema } from "../../auth/reply/permission.schema.js";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";
import { StatusCodes } from "http-status-codes";

export const GetUserPermissionSchema: FastifySchema = {
  params: IdParamsSchema,
  description: "Get an user permissions",
  tags: ["User"],
  response: { [StatusCodes.OK]: Type.Array(PermissionSchema) },
};

export interface GetUserPermissionRouteType extends RouteGenericInterface {
  Params: IdParams;
  Reply: PermissionDto[];
}
