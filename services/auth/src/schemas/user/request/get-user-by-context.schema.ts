import { RouteGenericInterface, FastifySchema } from "fastify";
import { UserDto, UserSchema } from "../reply/user.schema.js";
import { StatusCodes } from "http-status-codes";
import { Type } from "@sinclair/typebox";
import { OptionalNullable } from "../../common/optional-nullable.schema.js";

export const GetUserByContextSchema: FastifySchema = {
  description: "Get the user by context",
  tags: ["User"],
  response: { [StatusCodes.OK]: OptionalNullable(UserSchema) },
};

export interface GetUserByContextRouteType extends RouteGenericInterface {
  Reply: UserDto | null | undefined;
}
