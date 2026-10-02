import { Static, Type } from "@sinclair/typebox";
import { FastifySchema, RouteGenericInterface } from "fastify";
import { StatusCodes } from "http-status-codes";

const LogoutBodySchema = Type.Object({ refreshToken: Type.String({ description: "refreshToken" }) });

export const LogoutSchema: FastifySchema = {
  body: LogoutBodySchema,
  description: "Revoke the caller's refresh token (logout)",
  tags: ["Auth"],
  response: { [StatusCodes.NO_CONTENT]: Type.Null() },
};

export type LogoutDto = Static<typeof LogoutBodySchema>;

export interface LogoutRouteType extends RouteGenericInterface {
  Body: LogoutDto;
  Reply: void;
}
