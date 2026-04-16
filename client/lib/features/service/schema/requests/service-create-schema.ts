import { z } from "zod";

export const ServiceCreateSchema = z.object({
  name: z.string().nonempty(),
  price: z.number().min(0),
});

export type ServiceCreateDto = z.infer<typeof ServiceCreateSchema>;
