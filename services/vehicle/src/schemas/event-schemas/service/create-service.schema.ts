import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, Type } from "@sinclair/typebox";

export const CreateServiceSchema = Type.Object({
  id: Type.Integer({ description: "Unique identifier for the service" }),
  name: Type.String({ description: "Service name" }),
  price: Type.Integer({ description: "Service price" }),
});

export type CreateService = Static<typeof CreateServiceSchema>;

const validator = TypeCompiler.Compile(CreateServiceSchema);

export function validateServiceCreate(obj: any) {
  return validator.Check(obj);
}
