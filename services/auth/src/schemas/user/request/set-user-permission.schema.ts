import { Type, Static } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";

const SetUserPermissionBodySchema = Type.Object({
  name: Type.String({ description: "Name of the permission" }),
});

export const SetUserPermissionSchema: FastifySchema = {
  params: IdParamsSchema,
  body: SetUserPermissionBodySchema,
  description: "Set an user permission",
  tags: ["User"],
  response: { 200: Type.Null() },
};

export type SetUserPermissionDto = Static<typeof SetUserPermissionBodySchema>;

export interface SetUserPermissionRouteType extends RouteGenericInterface {
  Params: IdParams;
  Body: SetUserPermissionDto;
  Reply: void;
}
