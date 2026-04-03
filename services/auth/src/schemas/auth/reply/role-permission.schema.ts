import { Static, Type } from "@sinclair/typebox";
import { Role } from "../../../infrastructure/database/generated/prisma/enums.js";

export const RolePermissionSchema = Type.Object({
  id: Type.Integer({ description: "Id" }),
  role: Type.Enum(Role, { description: "Role" }),
  permissionName: Type.String({ description: "PermissionName" }),
});

export type RolePermissionDto = Static<typeof RolePermissionSchema>;
