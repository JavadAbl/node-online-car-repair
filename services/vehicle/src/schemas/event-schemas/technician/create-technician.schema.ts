import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const CreateTechnicianSchema = Type.Object(
  { id: Type.Integer(), firstName: Type.String(), lastName: Type.String(), technicianNumber: Type.String() },
  { additionalProperties: false },
);

export type CreateTechnician = Static<typeof CreateTechnicianSchema>;

const validator = TypeCompiler.Compile(CreateTechnicianSchema);

export function validateTechnicianCreate(obj: any): CreateTechnician {
  const cleaned = Value.Clean(CreateTechnicianSchema, obj);
  return validator.Decode(cleaned);
}
