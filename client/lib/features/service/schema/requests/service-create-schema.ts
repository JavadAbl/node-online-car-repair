import { z } from "zod";

export const ServiceCreateSchema = z.object({
  name: z.string().nonempty(),
  price: z.float64().positive(),
});

export type ServiceCreateDto = z.infer<typeof ServiceCreateSchema>;
