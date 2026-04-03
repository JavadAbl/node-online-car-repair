import { Static, Type } from "@sinclair/typebox";
import { FastifySchema, RouteGenericInterface } from "fastify";
import { StatusCodes } from "http-status-codes";

const SendOtpBodySchema = Type.Object({ mobile: Type.String({ description: "Mobile Number" }) });

export const SendOtpSchema: FastifySchema = {
  body: SendOtpBodySchema,
  description: "Send an otp",
  tags: ["Auth"],
  response: { [StatusCodes.OK]: Type.Null() },
};

export type SendOtpDto = Static<typeof SendOtpBodySchema>;

export interface SendOtpRouteType extends RouteGenericInterface {
  Body: SendOtpDto;
  Reply: void;
}
