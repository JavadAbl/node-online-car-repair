import { IsString, IsNotEmpty, MaxLength, IsPositive } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsPositive()
  price: number;
}
