import { Static, Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import { VehicleDto, VehicleDtoSchema } from "../reply/vehicle.schema.js";
import { FuelType, TransmissionType } from "../../../infrastructure/database/generated/prisma/enums.js";
import { StatusCodes } from "http-status-codes";

const CreateVehicleBodySchema = Type.Object({
  vin: Type.String({ description: "Vehicle Identification Number" }),
  make: Type.String({ description: "Vehicle manufacturer" }),
  model: Type.String({ description: "Vehicle model" }),
  year: Type.Integer({ description: "Vehicle manufacturing year" }),
  trim: Type.Optional(Type.String({ description: "Vehicle trim level" })),
  fuelType: Type.Optional(Type.Enum(FuelType, { description: "Fuel type" })),
  transmission: Type.Optional(Type.Enum(TransmissionType, { description: "Transmission type" })),
  engine: Type.Optional(Type.String({ description: "Engine specification" })),
  color: Type.Optional(Type.String({ description: "Vehicle color" })),
  mileage: Type.Optional(Type.Integer({ description: "Vehicle mileage" })),
  licensePlate: Type.Optional(Type.String({ description: "License plate number" })),
  state: Type.Optional(Type.String({ description: "Registration state" })),
  customerId: Type.Integer({ description: "Owner ID" }),
});

export const CreateVehicleSchema = {
  body: CreateVehicleBodySchema,
  description: "Create a vehicle entity",
  tags: ["Vehicles"],
  response: { [StatusCodes.CREATED]: VehicleDtoSchema },
};

export type CreateVehicle = Static<typeof CreateVehicleBodySchema>;

export interface CreateVehicleRouteType extends RouteGenericInterface {
  Body: CreateVehicle;
  Reply: VehicleDto;
}
