import { z } from "zod";

export const UpdateCustomerSchema = z.object({
  id: z.number().int(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationalCode: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().optional(),
});

export type UpdateCustomerEvent = z.infer<typeof UpdateCustomerSchema>;

export const validateCustomerUpdate = (obj: any) => UpdateCustomerSchema.parseAsync(obj);
