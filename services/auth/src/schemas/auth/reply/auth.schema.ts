import { Static, Type } from "@sinclair/typebox";

export const AuthDtoSchema = Type.Object({
  accessToken: Type.String({ description: "Access token" }),
  refreshToken: Type.String({ description: "Refresh token" }),
});

export type AuthDto = Static<typeof AuthDtoSchema>;
