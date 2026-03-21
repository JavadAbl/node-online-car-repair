import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { factorService } from "../services/factor-service.js";
import { TypedRequest } from "../types/express.js";
import { CreateFactor } from "../schemas/factor/request/create-factor-schema.js";
import { ParamId } from "../schemas/common/param-id-schema.js";
import { UpdateFactor } from "../schemas/factor/request/update-factor-schema.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { Factor } from "../infrastructure/database/generated/prisma/client.js";

export async function getFactors(req: TypedRequest<void, void, GetManyQuery<"Factor">>, res: Response) {
  const factors = await factorService.getMany(req.query);
  return res.json(factors);
}

export async function getFactorById(req: TypedRequest<void, ParamId, void>, res: Response) {
  const factor = await factorService.getById(req.params.id);
  res.json(factor);
}

export async function createFactor(req: TypedRequest<CreateFactor, void, void>, res: Response) {
  const factor = await factorService.create(req.body);
  res.status(StatusCodes.CREATED).json(factor);
}

export async function updateFactor(req: TypedRequest<UpdateFactor, ParamId, void>, res: Response) {
  await factorService.update(req.params.id, req.body);
  res.sendStatus(StatusCodes.OK);
}

export async function deleteFactor(req: TypedRequest<void, ParamId, void>, res: Response) {
  await factorService.deleteById(req.params.id);
  res.sendStatus(StatusCodes.NO_CONTENT);
}

export const factorController = { getFactors, getFactorById, createFactor, updateFactor, deleteFactor };
