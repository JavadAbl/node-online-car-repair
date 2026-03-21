import { z } from "zod";
import { FactorStatus } from "../../../infrastructure/database/generated/prisma/enums.js";
import { FactorItemSchema } from "./factor-item.schema.js";

export const FactorSchema = z.object({
  id: z.int(),

  factorNumber: z.string(),

  status: z.enum(FactorStatus),

  issuedAt: z.date(),

  totalPrice: z.int(),

  description: z.string().nullable().optional(),

  customerId: z.int(),

  items: z.array(FactorItemSchema),
});

export type FactorDto = z.infer<typeof FactorSchema>;
