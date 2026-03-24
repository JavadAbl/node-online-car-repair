import { Type, Static } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";

const AddUserPermissionBodySchema = Type.Object({
  name: Type.String({ description: "Name of the permission" }),
});

export const AddUserPermissionSchema: FastifySchema = {
  params: IdParamsSchema,
  body: AddUserPermissionBodySchema,
  description: "Add an user permission",
  tags: ["User"],
  response: { 200: Type.Null() },
};

export type AddUserPermissionDto = Static<typeof AddUserPermissionBodySchema>;

export interface AddUserPermissionRouteType extends RouteGenericInterface {
  Params: IdParams;
  Body: AddUserPermissionDto;
  Reply: void;
}
