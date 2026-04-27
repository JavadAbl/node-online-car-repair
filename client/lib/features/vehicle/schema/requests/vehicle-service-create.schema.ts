import { z } from "zod";

export const VehicleServiceCreateSchema = z.object({
  serviceDate: z.iso.datetime(),
  mileageAtService: z.number().int().min(0),
  description: z.string().nullable(),
  serviceId: z.number().int().min(1),
  technicianId: z.number().int().min(1),
  vehicleId: z.number().int().min(1),
});

export type VehicleServiceCreateDto = z.infer<
  typeof VehicleServiceCreateSchema
>;
