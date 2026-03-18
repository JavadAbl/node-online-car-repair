import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const CreateCustomerSchema = Type.Object(
  {
    id: Type.Integer({ description: "Unique identifier for the customer" }),
    firstName: Type.String({ description: "Customer first name" }),
    lastName: Type.String({ description: "Customer last name" }),
    nationalCode: Type.String({ description: "Customer national identification code" }),
    mobile: Type.String({ description: "Customer mobile phone number" }),
    email: Type.String({ format: "email", description: "Customer email address" }),
  },
  { additionalProperties: false },
);

export type CreateCustomer = Static<typeof CreateCustomerSchema>;

const validator = TypeCompiler.Compile(CreateCustomerSchema);

export function validateCustomerCreate(obj: any) {
  const cleaned = Value.Clean(CreateCustomerSchema, obj);
  return validator.Decode(cleaned);
}
