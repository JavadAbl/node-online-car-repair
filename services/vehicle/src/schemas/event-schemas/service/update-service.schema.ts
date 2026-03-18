import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const UpdateServiceSchema = Type.Object(
  {
    id: Type.Integer({ description: "Unique identifier for the service" }),
    name: Type.Optional(Type.String({ description: "Service name" })),
    price: Type.Optional(Type.Integer({ description: "Service price" })),
  },
  { additionalProperties: false },
);

export type UpdateService = Static<typeof UpdateServiceSchema>;

const validator = TypeCompiler.Compile(UpdateServiceSchema);

export function validateServiceUpdate(obj: any) {
  const cleaned = Value.Clean(UpdateServiceSchema, obj);
  return validator.Decode(cleaned);
}
