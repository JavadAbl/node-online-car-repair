import { z } from "zod";
import { CreateFactorItemSchema } from "./create-factorItem-schema.js";

export const CreateFactorSchema = z.object({
  description: z.string().nullable(),
  customerId: z.number(),

  items: z.array(CreateFactorItemSchema),
});

export type CreateFactor = z.infer<typeof CreateFactorSchema>;
