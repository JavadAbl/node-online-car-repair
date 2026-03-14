import { Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import { StatusCodes } from "http-status-codes";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";

export const DeleteVehicleSchema = {
  params: IdParamsSchema,
  description: "Delete a vehicle by ID",
  tags: ["Vehicles"],
  response: { [StatusCodes.NO_CONTENT]: Type.Null() },
};

export interface DeleteVehicleRouteType extends RouteGenericInterface {
  Params: IdParams;
  Reply: void;
}
