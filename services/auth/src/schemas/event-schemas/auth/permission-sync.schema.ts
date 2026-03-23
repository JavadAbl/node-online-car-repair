import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { PermissionType } from "../../../infrastructure/database/generated/prisma/enums.js";

export const PermissionsSyncSchema = Type.Array(
  Type.Object({ name: Type.String(), type: Type.Enum(PermissionType) }),
  { additionalProperties: false },
);

export type PermissionsSyncEvent = Static<typeof PermissionsSyncSchema>;

const validator = TypeCompiler.Compile(PermissionsSyncSchema);

export function validatePermissionSync(obj: any) {
  const cleaned = Value.Clean(PermissionsSyncSchema, obj);
  return validator.Decode(cleaned);
}
