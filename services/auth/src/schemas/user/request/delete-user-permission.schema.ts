import { Type, Static } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";
import { StatusCodes } from "http-status-codes";

const DeleteUserPermissionBodySchema = Type.Object({
  name: Type.String({ description: "Name of the permission" }),
});

export const DeleteUserPermissionSchema: FastifySchema = {
  params: IdParamsSchema,
  body: DeleteUserPermissionBodySchema,
  description: "Delete an user permission",
  tags: ["User"],
  response: { [StatusCodes.NO_CONTENT]: Type.Null() },
};

export type DeleteUserPermissionDto = Static<typeof DeleteUserPermissionBodySchema>;

export interface DeleteUserPermissionRouteType extends RouteGenericInterface {
  Params: IdParams;
  Body: DeleteUserPermissionDto;
  Reply: void;
}
