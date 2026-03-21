import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "../../../infrastructure/database/generated/prisma/enums.js";

export const UpdatePaymentSchema = z.object({
  amount: z.number().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  factorId: z.number().optional(),
  transactionId: z.string().optional(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  paidAt: z.coerce.date().optional().nullable(),
});

export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;
