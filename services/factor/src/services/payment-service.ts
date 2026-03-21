import { prisma } from "../infrastructure/database/prisma-provider.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { CreatePayment } from "../schemas/payment/request/create-payment-schema.js";
import { UpdatePayment } from "../schemas/payment/request/update-payment-schema.js";
import { buildFindManyArgs } from "../utils/prisma.util.js";
import { FactorStatus, PaymentStatus } from "../infrastructure/database/generated/prisma/enums.js";
import { NotFoundError } from "../utils/app.error.js";

function getMany(query: GetManyQuery<"Payment">) {
  const predicate = buildFindManyArgs(query, { searchableFields: ["transactionId"] });
  return prisma.payment.findMany(predicate);
}

function getById(id: number) {
  return prisma.payment.findUnique({ where: { id } });
}

async function create(payload: CreatePayment) {
  const { amount, method, factorId, transactionId, description, status, paidAt } = payload;

  const factor = await prisma.factor.findUnique({ where: { id: factorId } });
  if (!factor) {
    throw new Error(`Factor with ID ${factorId} not found`);
  }

  const payment = await prisma.payment.create({
    data: {
      amount,
      method,
      factorId,
      transactionId,
      description: description || null,
      status: status || PaymentStatus.PENDING,
      paidAt: paidAt || null,
    },
  });

  await updateFactorStatus(factorId);

  return payment;
}

async function update(id: number, payload: UpdatePayment) {
  const existingPayment = await prisma.payment.findUnique({ where: { id } });
  if (!existingPayment) throw new NotFoundError("Service", "id", id);

  const updatedPayment = await prisma.payment.update({ where: { id }, data: payload });

  await updateFactorStatus(existingPayment!.factorId);

  return updatedPayment;
}

async function deleteById(id: number) {
  const payment = await prisma.payment.findUnique({ where: { id }, select: { id: true, factorId: true } });
  if (!payment) throw new NotFoundError("Service", "id", id);

  await prisma.payment.delete({ where: { id } });

  // Update factor status after deletion
  await updateFactorStatus(payment.factorId);
}

// Helper function to update factor status based on payment status
async function updateFactorStatus(factorId: number) {
  // Get all payments for this factor
  const payments = await prisma.payment.findMany({
    where: { factorId },
    select: { status: true, amount: true },
  });

  if (payments.length === 0) {
    // If no payments exist, set factor status back to ISSUED
    await prisma.factor.update({ where: { id: factorId }, data: { status: FactorStatus.ISSUED } });
    return;
  }

  // Calculate total paid amount
  const totalPaid = payments
    .filter((payment) => payment.status === PaymentStatus.COMPLETED)
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Get factor total amount
  const factor = await prisma.factor.findUnique({ where: { id: factorId }, select: { totalPrice: true } });

  if (!factor) return;

  // Determine factor status based on payment status
  let factorStatus: FactorStatus = FactorStatus.ISSUED; // Default status

  if (totalPaid >= factor.totalPrice) {
    factorStatus = FactorStatus.PAID;
  } else if (totalPaid > 0 && totalPaid < factor.totalPrice) {
    factorStatus = FactorStatus.PARTIALLY_PAID;
  }

  await prisma.factor.update({ where: { id: factorId }, data: { status: factorStatus } });
}

export const paymentService = { getMany, getById, create, update, deleteById };
