import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { Role } from "../../../infrastructure/database/generated/prisma/enums.js";

export const DeleteRolePermissionSchema = Type.Object(
  { id: Type.Integer() },
  { additionalProperties: false },
);

export type RolePermissionDeleteEvent = Static<typeof DeleteRolePermissionSchema>;

const validator = TypeCompiler.Compile(DeleteRolePermissionSchema);

export function validateRolePermissionDelete(obj: any) {
  const cleaned = Value.Clean(DeleteRolePermissionSchema, obj);
  return validator.Decode(cleaned);
}
