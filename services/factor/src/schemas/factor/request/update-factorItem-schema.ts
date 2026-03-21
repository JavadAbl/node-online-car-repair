import z from "zod";

export const UpdateFactorItemSchema = z.object({
  description: z.string().nullable(),
  quantity: z.number().default(1),
  serviceId: z.number(),
});

export type UpdateFactorItem = z.infer<typeof UpdateFactorItemSchema>;
