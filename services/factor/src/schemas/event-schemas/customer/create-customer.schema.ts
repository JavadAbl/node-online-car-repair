import z from "zod";
import { optionalNullable } from "../../common/optional-nullable.schema.js";

export const CreateCustomerSchema = z.object({
  id: z.number().int(),

  firstName: optionalNullable(z.string()),
  lastName: optionalNullable(z.string()),
  nationalCode: optionalNullable(z.string()),

  mobile: z.string(),

  email: optionalNullable(z.string()),
});

export type CreateCustomerEvent = z.infer<typeof CreateCustomerSchema>;

export const validateCustomerCreate = (obj: any) => CreateCustomerSchema.parseAsync(obj);
