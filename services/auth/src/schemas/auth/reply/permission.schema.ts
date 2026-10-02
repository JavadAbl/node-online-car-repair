import { Type, Static } from "@sinclair/typebox";
import { PermissionType } from "../../../infrastructure/database/generated/prisma/enums.js";

/** A bare permission name (used for user-permission listings). */
export const PermissionSchema = Type.Object({ name: Type.String({ description: "Permission" }) });

export type PermissionDto = Static<typeof PermissionSchema>;

/** A catalog entry: permission name + its level in the Service/Controller/Action tree. */
export const PermissionReferenceSchema = Type.Object({
  name: Type.String({ description: "Permission name (Service / Controller / Action)" }),
  type: Type.Enum(PermissionType, { description: "Permission level" }),
});

export type PermissionReferenceDto = Static<typeof PermissionReferenceSchema>;
