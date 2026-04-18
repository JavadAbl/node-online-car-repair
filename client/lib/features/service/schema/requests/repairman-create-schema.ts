import { z } from "zod";
import { WorkShift } from "../../service-enums";

export const RepairmanCreateSchema = z.object({
  firstName: z.string().min(1, "firstName is required").max(100),
  lastName: z.string().min(1, "lastName is required").max(100),
  employeeNumber: z.string().min(1).max(100),
  workShift: z.enum(WorkShift),
});

export type RepairmanCreateDto = z.infer<typeof RepairmanCreateSchema>;
