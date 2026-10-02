import { Static, Type } from "@sinclair/typebox";
import { Role } from "../../../infrastructure/database/generated/prisma/enums.js";

export const UserSchema = Type.Object({
  id: Type.Integer({ description: "User id" }),
  mobile: Type.String({ description: "User mobile" }),
  role: Type.Enum(Role, { description: "User role (drives the role part of their grants)" }),
});

export type UserDto = Static<typeof UserSchema>;
