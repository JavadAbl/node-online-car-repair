import { z } from "zod";
import { FUEL_TYPES, TRANSMISSION_TYPES } from "../../vehicle-enums";

export const VehicleCreateSchema = z.object({
  vin: z.string().describe("Vehicle Identification Number"),
  make: z.string().describe("Vehicle manufacturer"),
  model: z.string().describe("Vehicle model"),
  year: z.number().int().describe("Vehicle manufacturing year"),
  trim: z.string().optional().describe("Vehicle trim level"),
  fuelType: z.enum(FUEL_TYPES).optional().describe("Fuel type"),
  transmission: z
    .enum(TRANSMISSION_TYPES)
    .optional()
    .describe("Transmission type"),
  engine: z.string().optional().describe("Engine specification"),
  color: z.string().optional().describe("Vehicle color"),
  mileage: z.number().int().optional().describe("Vehicle mileage"),
  licensePlate: z.string().optional().describe("License plate number"),
  state: z.string().optional().describe("Registration state"),
  customerId: z.number().int().describe("Owner ID"),
});

export type VehicleCreateDto = z.infer<typeof VehicleCreateSchema>;
