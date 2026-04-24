import { Static, Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import { VehicleDto, VehicleDtoSchema } from "../reply/vehicle.schema.js";
import { FuelType, TransmissionType } from "../../../infrastructure/database/generated/prisma/enums.js";
import { StatusCodes } from "http-status-codes";
import { OptionalNullable } from "../../common/optional-nullable.schema.js";

const CreateVehicleBodySchema = Type.Object({
  vin: Type.String({ description: "Vehicle Identification Number" }),
  make: Type.String({ description: "Vehicle manufacturer" }),
  model: Type.String({ description: "Vehicle model" }),
  year: Type.Integer({ description: "Vehicle manufacturing year" }),
  trim: Type.String({ description: "Vehicle trim level" }),
  fuelType: Type.Enum(FuelType, { description: "Fuel type" }),
  transmission: Type.Enum(TransmissionType, { description: "Transmission type" }),
  engine: Type.String({ description: "Engine specification" }),
  color: Type.String({ description: "Vehicle color" }),
  mileage: Type.Integer({ description: "Vehicle mileage" }),
  licensePlate: Type.String({ description: "License plate number" }),
  state: OptionalNullable(Type.String({ description: "Registration state" })),
  description: OptionalNullable(Type.String({ description: "Description state" })),
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
