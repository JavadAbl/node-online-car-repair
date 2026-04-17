import { z } from "zod";

export const VehicleServiceCreateSchema = z.object({
  serviceDate: z.iso.datetime().describe("Date when the service was performed"),
  mileageAtService: z
    .number()
    .int()
    .describe("Mileage of the vehicle at the time of service"),
  technicianName: z
    .string()
    .describe("Name of the technician who performed the service"),
  description: z
    .string()
    .optional()
    .describe("Description of the service performed"),
  vehicleId: z
    .number()
    .int()
    .describe("ID of the vehicle that received the service"),
  serviceId: z.number().int().describe("ID of the service reference"),
});

export type VehicleServiceCreateDto = z.infer<
  typeof VehicleServiceCreateSchema
>;
