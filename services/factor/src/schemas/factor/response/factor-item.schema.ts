import { z } from "zod";

export const FactorItemSchema = z.object({
  id: z.number().int(),

  description: z.string().nullable().optional(),

  quantity: z.int(),

  unitPrice: z.int(),

  totalPrice: z.int(),

  factorId: z.number().int(),

  serviceId: z.number().int(),
});

export type FactorItemDto = z.infer<typeof FactorItemSchema>;
