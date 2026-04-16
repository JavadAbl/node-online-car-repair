import { IsString, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Min(0)
  price: number;
}
