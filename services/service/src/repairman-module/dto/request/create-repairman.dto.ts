import { IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { WorkShift } from 'src/generated/prisma/enums';

export class CreateRepairmanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  employeeNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEnum(WorkShift)
  @IsNotEmpty()
  workShift: WorkShift;
}
