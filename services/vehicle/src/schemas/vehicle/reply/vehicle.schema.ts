import { Static, Type } from "@sinclair/typebox";
import {
  FuelType,
  TransmissionType,
  VehicleStatus,
} from "../../../infrastructure/database/generated/prisma/enums.js";

export const VehicleDtoSchema = Type.Object({
  id: Type.Integer({ description: "Unique identifier for the vehicle" }),
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
  customerId: Type.Integer({ description: "Customer ID associated with the vehicle" }),
  status: Type.Enum(VehicleStatus, { description: "Vehicle status", default: VehicleStatus.Active }),
  createdAt: Type.String({ format: "date-time", description: "Creation timestamp" }),
  updatedAt: Type.Optional(Type.String({ format: "date-time", description: "Last update timestamp" })),
});

export type VehicleDto = Static<typeof VehicleDtoSchema>;
