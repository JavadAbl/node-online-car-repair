import z from "zod";

export const createVehicleSchema = z.object({
  vin: z
    .string("VIN is required")
    .min(17, "VIN must be 17 characters")
    .max(17, "VIN must be 17 characters")
    .toUpperCase(),

  make: z.string().min(1, "Make is required"),

  model: z.string().min(1, "Model is required"),

  year: z
    .number()
    .min(1900, "Year must be valid")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),

  trim: z.string().nullable(),

  fuelType: z
    .enum([
      "Gasoline",
      "Diesel",
      "Electric",
      "Hybrid",
      "PlugInHybrid",
      "Hydrogen",
      "Other",
    ])
    .nullable(),

  transmission: z
    .enum(["Automatic", "Manual", "CVT", "DualClutch", "Robotic", "Other"])
    .nullable(),

  engine: z.string().nullable(),

  color: z.string().nullable(),

  mileage: z.number().min(0, "Mileage cannot be negative").nullable(),

  licensePlate: z.string().nullable(),

  state: z.string().nullable(),

  status: z
    .enum([
      "Active",
      "InRepair",
      "ReadyForPickup",
      "Archived",
      "UnderWarranty",
      "InService",
      "OnLoan",
      "NotOperational",
    ])
    .nullable(),

  description: z.string().nullable(),
});

export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
