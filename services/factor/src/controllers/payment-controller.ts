import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { paymentService } from "../services/payment-service.js";
import { TypedRequest } from "../types/express.js";
import { CreatePayment } from "../schemas/payment/request/create-payment-schema.js";
import { UpdatePayment } from "../schemas/payment/request/update-payment-schema.js";
import { ParamId } from "../schemas/common/param-id-schema.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";

export async function getPayments(req: TypedRequest<void, void, GetManyQuery<"Payment">>, res: Response) {
  const payments = await paymentService.getMany(req.query);
  return res.json(payments);
}

export async function getPaymentById(req: TypedRequest<void, ParamId, void>, res: Response) {
  const payment = await paymentService.getById(req.params.id);
  res.json(payment);
}

export async function createPayment(req: TypedRequest<CreatePayment, void, void>, res: Response) {
  const payment = await paymentService.create(req.body);
  res.status(StatusCodes.CREATED).json(payment);
}

export async function updatePayment(req: TypedRequest<UpdatePayment, ParamId, void>, res: Response) {
  await paymentService.update(Number(req.params.id), req.body);
  res.sendStatus(StatusCodes.OK);
}

export async function deletePayment(req: TypedRequest<void, ParamId, void>, res: Response) {
  await paymentService.deleteById(Number(req.params.id));
  res.sendStatus(StatusCodes.NO_CONTENT);
}

export const paymentController = { getPayments, getPaymentById, createPayment, updatePayment, deletePayment };
