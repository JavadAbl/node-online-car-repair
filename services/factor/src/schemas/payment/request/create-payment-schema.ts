import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "../../../infrastructure/database/generated/prisma/enums.js";

export const CreatePaymentSchema = z.object({
  amount: z.number(),
  method: z.nativeEnum(PaymentMethod),
  factorId: z.number(),
  transactionId: z.string(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.PENDING),
  paidAt: z.coerce.date().optional().nullable(),
});

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
