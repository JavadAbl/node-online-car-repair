import { IsString, IsOptional, MaxLength, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Min(0)
  @IsOptional()
  price?: number;
}
