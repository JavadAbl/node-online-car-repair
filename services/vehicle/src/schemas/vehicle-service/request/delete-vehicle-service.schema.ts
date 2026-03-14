import { Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";
import { StatusCodes } from "http-status-codes";

export const DeleteVehicleServiceSchema = {
  params: IdParamsSchema,
  tags: ["VehicleService"],
  response: { [StatusCodes.NO_CONTENT]: Type.Null() },
};

export interface DeleteVehicleServiceRouteType extends RouteGenericInterface {
  Params: IdParams;
  Reply: void;
}
