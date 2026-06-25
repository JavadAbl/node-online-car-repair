import { IsString, IsOptional, MaxLength, Min, IsNumber } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;
}
