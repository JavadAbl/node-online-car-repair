import { Static, Type } from "@sinclair/typebox";
import {
  FuelType,
  TransmissionType,
  VehicleStatus,
} from "../../../infrastructure/database/generated/prisma/enums.js";
import { Nullable } from "../../common/nullable.schema.js";

export const VehicleDtoSchema = Type.Object({
  id: Type.Integer({ description: "Unique identifier for the vehicle" }),
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
  state: Nullable(Type.String({ description: "Registration state" })),
  description: Nullable(Type.String({ description: "Description" })),
  customerId: Type.Integer({ description: "Customer ID associated with the vehicle" }),
  status: Type.Enum(VehicleStatus, { description: "Vehicle status", default: VehicleStatus.Active }),
  createdAt: Type.String({ format: "date-time", description: "Creation timestamp" }),
  updatedAt: Nullable(Type.String({ format: "date-time", description: "Last update timestamp" })),
});

export type VehicleDto = Static<typeof VehicleDtoSchema>;
