import { z } from "zod";

export const UpdateServiceSchema = z
  .object({
    id: z.int(),
    name: z.string().optional(),
    price: z.number().optional(),
    discountPercent: z.number().optional(),
  })
  .strict();

export type UpdateServiceEvent = z.infer<typeof UpdateServiceSchema>;

export const validateServiceUpdate = (obj: any) => UpdateServiceSchema.parseAsync(obj);
