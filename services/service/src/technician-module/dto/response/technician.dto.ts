import { Exclude, Expose } from 'class-transformer';
import { WorkShift } from 'src/generated/prisma/enums';

@Exclude()
export class TechnicianDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  employeeNumber: string;

  @Expose()
  profession: string;

  @Expose()
  workShift: WorkShift;

  @Expose()
  image: string;

  @Expose()
  rating: number;
}
