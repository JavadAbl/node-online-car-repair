import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const UpdateCustomerSchema = Type.Object(
  {
    id: Type.Integer({ description: "Unique identifier for the customer" }),
    firstName: Type.Optional(Type.String({ description: "Customer first name" })),
    lastName: Type.Optional(Type.String({ description: "Customer last name" })),
    nationalCode: Type.Optional(Type.String({ description: "Customer national identification code" })),
    mobile: Type.Optional(Type.String({ description: "Customer mobile phone number" })),
    email: Type.Optional(Type.String({ format: "email", description: "Customer email address" })),
  },
  { additionalProperties: false },
);

export type UpdateCustomer = Static<typeof UpdateCustomerSchema>;

const validator = TypeCompiler.Compile(UpdateCustomerSchema);

export function validateCustomerUpdate(obj: any) {
  const cleaned = Value.Clean(UpdateCustomerSchema, obj);
  return validator.Decode(cleaned);
}
