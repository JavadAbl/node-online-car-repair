import express from "express";
import { useValidate } from "../middlewares/use-validate.js";
import { useAuth } from "../middlewares/use-auth.js";
import { PaymentControllerPermissions } from "../infrastructure/auth/permissions.js";
import { CreatePaymentSchema } from "../schemas/payment/request/create-payment-schema.js";
import { UpdatePaymentSchema } from "../schemas/payment/request/update-payment-schema.js";
import { paymentController } from "../controllers/payment-controller.js";
import { GetManyQuerySchema } from "../schemas/common/get-many-request.schema.js";
import { ParamIdSchema } from "../schemas/common/param-id-schema.js";

export const paymentRoutes = express.Router();

paymentRoutes.get(
  "/",
  useAuth(PaymentControllerPermissions.GetPayments),
  useValidate(GetManyQuerySchema, "query"),
  paymentController.getPayments,
);
paymentRoutes.get(
  "/:id",
  useAuth(PaymentControllerPermissions.GetPaymentById),
  useValidate(ParamIdSchema, "params"),
  paymentController.getPaymentById,
);
paymentRoutes.post(
  "/",
  useAuth(PaymentControllerPermissions.CreatePayment),
  useValidate(CreatePaymentSchema, "body"),
  paymentController.createPayment,
);
paymentRoutes.put(
  "/:id",
  useAuth(PaymentControllerPermissions.UpdatePayment),
  useValidate(ParamIdSchema, "params"),
  useValidate(UpdatePaymentSchema, "body"),
  paymentController.updatePayment,
);
paymentRoutes.delete(
  "/:id",
  useAuth(PaymentControllerPermissions.DeletePayment),
  useValidate(ParamIdSchema, "params"),
  paymentController.deletePayment,
);
