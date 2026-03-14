import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { WorkShift } from 'src/generated/prisma/enums';

export class UpdateRepairmanDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsEnum(WorkShift)
  @IsOptional()
  workShift?: WorkShift;
}
