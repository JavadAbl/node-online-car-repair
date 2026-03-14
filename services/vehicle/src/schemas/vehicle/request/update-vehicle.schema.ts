import { Static, Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import {
  FuelType,
  TransmissionType,
  VehicleStatus,
} from "../../../infrastructure/database/generated/prisma/enums.js";
import { IdParamsSchema, IdParams } from "../../common/id-params.schema.js";
import { StatusCodes } from "http-status-codes";

const UpdateVehicleBodySchema = Type.Object({
  vin: Type.Optional(Type.String({ description: "Vehicle Identification Number" })),
  make: Type.Optional(Type.String({ description: "Vehicle manufacturer" })),
  model: Type.Optional(Type.String({ description: "Vehicle model" })),
  year: Type.Optional(Type.Integer({ description: "Vehicle manufacturing year" })),
  trim: Type.Optional(Type.String({ description: "Vehicle trim level" })),
  fuelType: Type.Optional(Type.Enum(FuelType, { description: "Fuel type" })),
  transmission: Type.Optional(Type.Enum(TransmissionType, { description: "Transmission type" })),
  engine: Type.Optional(Type.String({ description: "Engine specification" })),
  color: Type.Optional(Type.String({ description: "Vehicle color" })),
  mileage: Type.Optional(Type.Integer({ description: "Vehicle mileage" })),
  licensePlate: Type.Optional(Type.String({ description: "License plate number" })),
  state: Type.Optional(Type.String({ description: "Registration state" })),
  customerId: Type.Optional(Type.Integer({ description: "Owner ID" })),
  status: Type.Optional(Type.Enum(VehicleStatus, { description: "Vehicle status" })),
  isDeleted: Type.Optional(Type.Boolean({ description: "Soft delete flag" })),
});

export const UpdateVehicleSchema = {
  body: UpdateVehicleBodySchema,
  params: IdParamsSchema,
  description: "Update a vehicle entity",
  tags: ["Vehicles"],
  response: { [StatusCodes.OK]: Type.Unknown() },
};

export type UpdateVehicle = Static<typeof UpdateVehicleBodySchema>;

export interface UpdateVehicleRouteType extends RouteGenericInterface {
  Body: UpdateVehicle;
  Params: IdParams;
}
