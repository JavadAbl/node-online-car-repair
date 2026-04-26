import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const UpdateTechnicianSchema = Type.Object(
  {
    id: Type.Integer(),
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    technicianNumber: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export type UpdateTechnician = Static<typeof UpdateTechnicianSchema>;

const validator = TypeCompiler.Compile(UpdateTechnicianSchema);

export function validateTechnicianUpdate(obj: any): UpdateTechnician {
  const cleaned = Value.Clean(UpdateTechnicianSchema, obj);
  return validator.Decode(cleaned);
}
