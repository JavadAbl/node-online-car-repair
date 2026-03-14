import { RouteGenericInterface } from "fastify";
import { VehicleServiceDto, VehicleServiceDtoSchema } from "../reply/vehicle-service.schema.js";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";
import { StatusCodes } from "http-status-codes";

export const GetVehicleServiceByIdSchema = {
  params: IdParamsSchema,
  tags: ["VehicleService"],
  response: { [StatusCodes.OK]: VehicleServiceDtoSchema },
};

export interface GetVehicleServiceByIdRouteType extends RouteGenericInterface {
  Params: IdParams;
  Reply: VehicleServiceDto;
}
