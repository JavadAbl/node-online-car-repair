import { Type } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { GetManyQuery, GetManyQuerySchema } from "../../common/get-many-request.schema.js";
import { UserDto, UserSchema } from "../reply/user.schema.js";
import { StatusCodes } from "http-status-codes";

export const GetManyUsersSchema: FastifySchema = {
  querystring: GetManyQuerySchema,
  description: "Set an user permission",
  tags: ["User"],
  response: { [StatusCodes.OK]: Type.Array(UserSchema) },
};

export interface GetManyUsersRouteType extends RouteGenericInterface {
  Querystring: GetManyQuery<"User">;
  Reply: UserDto[];
}
