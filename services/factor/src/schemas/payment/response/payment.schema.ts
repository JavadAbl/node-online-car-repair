import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "../../../infrastructure/database/generated/prisma/enums.js";

export const PaymentSchema = z.object({
  amount: z.number(),
  method: z.enum(PaymentMethod),
  factorId: z.number(),
  transactionId: z.string(),
  description: z.string().nullable(),
  status: z.enum(PaymentStatus),
  paidAt: z.date().nullable(),
});

export type PaymentDto = z.infer<typeof PaymentSchema>;
