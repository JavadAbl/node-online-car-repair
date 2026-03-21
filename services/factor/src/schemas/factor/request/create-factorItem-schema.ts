import z from "zod";

export const CreateFactorItemSchema = z.object({
  description: z.string().nullable(),
  quantity: z.number().default(1),
  serviceId: z.number(),
});

export type CreateFactorItem = z.infer<typeof CreateFactorItemSchema>;
