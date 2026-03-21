import { z } from "zod";

export const CreateServiceSchema = z.object({ id: z.int(), name: z.string(), price: z.int() });

export type CreateServiceEvent = z.infer<typeof CreateServiceSchema>;

export const validateServiceCreate = (obj: any) => CreateServiceSchema.parseAsync(obj);
