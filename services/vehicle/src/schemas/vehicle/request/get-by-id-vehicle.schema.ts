import { RouteGenericInterface } from "fastify";
import { IdParamsSchema, IdParams } from "../../common/id-params.schema.js";
import { VehicleDtoSchema, VehicleDto } from "../reply/vehicle.schema.js";
import { StatusCodes } from "http-status-codes";

export const GetVehicleByIdSchema = {
  params: IdParamsSchema,
  description: "Get a vehicle by ID",
  tags: ["Vehicles"],
  response: { [StatusCodes.OK]: VehicleDtoSchema },
};

export interface GetVehicleByIdRouteType extends RouteGenericInterface {
  Params: IdParams;
  Reply: VehicleDto;
}
