import { Static, Type } from "@sinclair/typebox";
import { FastifySchema, RouteGenericInterface } from "fastify";
import { AuthDto, AuthDtoSchema } from "../reply/auth.schema.js";
import { StatusCodes } from "http-status-codes";

const RefreshBodySchema = Type.Object({ refreshToken: Type.String({ description: "refreshToken" }) });

export const RefreshSchema: FastifySchema = {
  body: RefreshBodySchema,
  description: "Refresh token",
  tags: ["Auth"],
  response: { [StatusCodes.OK]: AuthDtoSchema },
};

export type RefreshDto = Static<typeof RefreshBodySchema>;

export interface RefreshRouteType extends RouteGenericInterface {
  Body: RefreshDto;
  Reply: AuthDto;
}
