import { Static, Type } from "@sinclair/typebox";
import { FastifySchema, RouteGenericInterface } from "fastify";
import { AuthDto, AuthDtoSchema } from "../reply/auth.schema.js";
import { StatusCodes } from "http-status-codes";

const VerifyOtpBodySchema = Type.Object({
  mobile: Type.String({ description: "Mobile Number" }),
  otp: Type.String({ description: "Otp code" }),
});

export const VerifyOtpSchema: FastifySchema = {
  body: VerifyOtpBodySchema,
  description: "Verify an otp",
  tags: ["Auth"],
  response: { [StatusCodes.OK]: AuthDtoSchema },
};

export type VerifyOtpDto = Static<typeof VerifyOtpBodySchema>;

export interface VerifyOtpRouteType extends RouteGenericInterface {
  Body: VerifyOtpDto;
  Reply: AuthDto;
}
