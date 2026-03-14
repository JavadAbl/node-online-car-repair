import { Static, Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import { VehicleServiceDto, VehicleServiceDtoSchema } from "../reply/vehicle-service.schema.js";
import { StatusCodes } from "http-status-codes";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";

const UpdateVehicleServiceBodySchema = Type.Partial(
  Type.Object({
    serviceDate: Type.String({ format: "date-time", description: "Date when the service was performed" }),
    mileageAtService: Type.Integer({ description: "Mileage of the vehicle at the time of service" }),
    technicianName: Type.String({ description: "Name of the technician who performed the service" }),
    description: Type.Optional(Type.String({ description: "Description of the service performed" })),
    vehicleId: Type.Integer({ description: "ID of the vehicle that received the service" }),
    serviceId: Type.Integer({ description: "ID of the service reference" }),
  }),
);

export const UpdateVehicleServiceSchema = {
  body: UpdateVehicleServiceBodySchema,
  params: IdParamsSchema,
  tags: ["VehicleService"],
  response: { [StatusCodes.OK]: VehicleServiceDtoSchema },
};

export type UpdateVehicleService = Static<typeof UpdateVehicleServiceBodySchema>;

export interface UpdateVehicleServiceRouteType extends RouteGenericInterface {
  Params: IdParams;
  Body: UpdateVehicleService;
  Reply: VehicleServiceDto;
}
