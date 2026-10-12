import { z } from "zod";

export const FactorItemSchema = z.object({
  id: z.number().int(),

  description: z.string().nullable().optional(),

  quantity: z.int(),

  unitPrice: z.int(),

  totalPrice: z.int(),

  // Optional because getById's include omits factorId from items (it is
  // redundant inside a Factor response).
  factorId: z.number().int().optional(),

  serviceId: z.number().int(),
});

export type FactorItemDto = z.infer<typeof FactorItemSchema>;
