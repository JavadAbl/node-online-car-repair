import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, TSchema, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { OptionalNullable } from "../../common/optional-nullable.schema.js";
import { Role } from "../../../infrastructure/database/generated/prisma/enums.js";

export const CreateRolePermissionSchema = Type.Object(
  { id: Type.Integer(), permissionName: Type.String(), role: Type.Enum(Role) },
  { additionalProperties: false },
);

export type RolePermissionCreateEvent = Static<typeof CreateRolePermissionSchema>;

const validator = TypeCompiler.Compile(CreateRolePermissionSchema);

export function validateRolePermissionCreate(obj: any) {
  const cleaned = Value.Clean(CreateRolePermissionSchema, obj);
  return validator.Decode(cleaned);
}
