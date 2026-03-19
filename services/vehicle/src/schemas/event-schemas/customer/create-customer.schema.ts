import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Static, TSchema, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { OptionalNullable } from "../../common/optional-nullable.schema.js";

export const CreateCustomerSchema = Type.Object(
  {
    id: Type.Integer({ description: "Unique identifier for the customer" }),
    firstName: OptionalNullable(Type.String({ description: "Customer first name" })),
    lastName: OptionalNullable(Type.String({ description: "Customer last name" })),
    nationalCode: OptionalNullable(Type.String({ description: "Customer national identification code" })),
    mobile: Type.String({ description: "Customer mobile phone number" }),
    email: OptionalNullable(Type.String({ format: "email", description: "Customer email address" })),
  },
  { additionalProperties: false },
);

export type CreateCustomer = Static<typeof CreateCustomerSchema>;

const validator = TypeCompiler.Compile(CreateCustomerSchema);

export function validateCustomerCreate(obj: any) {
  const cleaned = Value.Clean(CreateCustomerSchema, obj);
  return validator.Decode(cleaned);
}
