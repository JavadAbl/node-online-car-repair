import { Static, Type } from "@sinclair/typebox";

export const UserSchema = Type.Object({
  id: Type.Integer({ description: "User id" }),
  mobile: Type.String({ description: "User mobile" }),
});

export type UserDto = Static<typeof UserSchema>;
