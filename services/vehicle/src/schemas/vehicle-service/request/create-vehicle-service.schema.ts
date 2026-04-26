import { Static, Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import { VehicleServiceDto, VehicleServiceDtoSchema } from "../reply/vehicle-service.schema.js";
import { StatusCodes } from "http-status-codes";

const CreateVehicleServiceBodySchema = Type.Object({
  serviceDate: Type.String({ format: "date-time", description: "Date when the service was performed" }),
  mileageAtService: Type.Integer({ description: "Mileage of the vehicle at the time of service" }),
  technicianName: Type.String({ description: "Name of the technician who performed the service" }),
  description: Type.Optional(Type.String({ description: "Description of the service performed" })),
  vehicleId: Type.Integer({ description: "ID of the vehicle that received the service" }),
  serviceId: Type.Integer({ description: "ID of the service reference" }),
  technicianId: Type.Integer({ description: "ID of the technician reference" }),
});

export const CreateVehicleServiceSchema = {
  body: CreateVehicleServiceBodySchema,
  tags: ["VehicleService"],
  response: { [StatusCodes.CREATED]: VehicleServiceDtoSchema },
};

export type CreateVehicleService = Static<typeof CreateVehicleServiceBodySchema>;

export interface CreateVehicleServiceRouteType extends RouteGenericInterface {
  Body: CreateVehicleService;
  Reply: VehicleServiceDto;
}
