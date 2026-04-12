import { Exclude, Expose } from 'class-transformer';
import { WorkShift } from 'src/generated/prisma/enums';

@Exclude()
export class RepairmanDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  employeeNumber: string;

  @Expose()
  workShift: WorkShift;
}
