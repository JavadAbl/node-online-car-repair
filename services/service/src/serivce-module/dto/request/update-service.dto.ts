import { IsString, IsOptional, MaxLength, IsPositive } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsPositive()
  @IsOptional()
  price?: number;
}
