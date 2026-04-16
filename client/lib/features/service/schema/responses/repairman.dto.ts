import { WorkShift } from "../../service-enums";

export interface RepairmanDto {
  id: number;

  firstName: string;

  lastName: string;

  employeeNumber: string;

  workShift: WorkShift;
}
