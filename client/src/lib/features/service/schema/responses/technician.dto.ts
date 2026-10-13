import { WorkShift } from "../../service-enums";

export interface TechnicianDto {
  id: number;

  firstName: string;

  lastName: string;

  technicianNumber: string;

  workShift: WorkShift;

  image?: string;

  rating: number;

  profession: string;
}
