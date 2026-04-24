import { z } from "zod";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  VEHICLE_STATUS,
} from "../../vehicle-enums";

export const VehicleCreateSchema = z.object({
  vin: z.string().nonempty().describe("Vehicle Identification Number"),
  make: z.string().nonempty().describe("Vehicle manufacturer"),
  model: z.string().nonempty().describe("Vehicle model"),
  year: z.number().int().describe("Vehicle manufacturing year"),
  trim: z.string().nonempty().describe("Vehicle trim level"),
  fuelType: z.enum(FUEL_TYPES).describe("Fuel type"),
  transmission: z.enum(TRANSMISSION_TYPES).describe("Transmission type"),
  status: z.enum(VEHICLE_STATUS).describe("Status"),
  engine: z.string().nonempty().describe("Engine specification"),
  color: z.string().nonempty().describe("Vehicle color"),
  mileage: z.number().int().describe("Vehicle mileage"),
  licensePlate: z.string().nonempty().describe("License plate number"),
  state: z.string().optional().nullable().describe("Registration state"),
  description: z.string().optional().nullable().describe("Description"),
});

export type VehicleCreateDto = z.infer<typeof VehicleCreateSchema>;
