import { Static, Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import { VehicleServiceDto, VehicleServiceDtoSchema } from "../reply/vehicle-service.schema.js";
import { StatusCodes } from "http-status-codes";

const GetVehicleServiceHistoriesQuerystring = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
  offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  vehicleId: Type.Optional(Type.Integer({ description: "Filter by vehicle ID" })),
});

export const GetVehicleServiceHistoriesSchema = {
  querystring: GetVehicleServiceHistoriesQuerystring,
  tags: ["VehicleService"],
  response: { [StatusCodes.OK]: Type.Array(VehicleServiceDtoSchema) },
};

export type GetVehicleServiceHistoriesQuery = Static<typeof GetVehicleServiceHistoriesQuerystring>;

export interface GetVehicleServiceHistoriesRouteType extends RouteGenericInterface {
  Querystring: GetVehicleServiceHistoriesQuery;
  Reply: VehicleServiceDto[];
}
