import express from "express";
import { useValidate } from "../middlewares/use-validate.js";
import { CreatePaymentSchema } from "../schemas/payment/request/create-payment-schema.js";
import { UpdatePaymentSchema } from "../schemas/payment/request/update-payment-schema.js";
import { paymentController } from "../controllers/payment-controller.js";
import { GetManyQuerySchema } from "../schemas/common/get-many-request.schema.js";
import { ParamIdSchema } from "../schemas/common/param-id-schema.js";

export const paymentRoutes = express.Router();

paymentRoutes.get("/", useValidate(GetManyQuerySchema, "query"), paymentController.getPayments);
paymentRoutes.get("/:id", useValidate(ParamIdSchema, "params"), paymentController.getPaymentById);
paymentRoutes.post("/", useValidate(CreatePaymentSchema, "body"), paymentController.createPayment);
paymentRoutes.put(
  "/:id",
  useValidate(ParamIdSchema, "params"),
  useValidate(UpdatePaymentSchema, "body"),
  paymentController.updatePayment,
);
paymentRoutes.delete("/:id", useValidate(ParamIdSchema, "params"), paymentController.deletePayment);
