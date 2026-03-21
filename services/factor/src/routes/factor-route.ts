import express from "express";
import { factorController } from "../controllers/factor-controller.js";
import { useValidate } from "../middlewares/use-validate.js";
import { CreateFactorSchema } from "../schemas/factor/request/create-factor-schema.js";
import { GetManyQuerySchema } from "../schemas/common/get-many-request.schema.js";
import { ParamIdSchema } from "../schemas/common/param-id-schema.js";
import { UpdateFactorSchema } from "../schemas/factor/request/update-factor-schema.js";

export const factorRoutes = express.Router();

factorRoutes.get("/", useValidate(GetManyQuerySchema, "query"), factorController.getFactors);
factorRoutes.get("/:id", useValidate(ParamIdSchema, "params"), factorController.getFactorById);
factorRoutes.post("/", useValidate(CreateFactorSchema, "body"), factorController.createFactor);
factorRoutes.put(
  "/:id",
  useValidate(ParamIdSchema, "params"),
  useValidate(UpdateFactorSchema, "body"),
  factorController.updateFactor,
);
factorRoutes.delete("/:id", useValidate(ParamIdSchema, "params"), factorController.deleteFactor);
