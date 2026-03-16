import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UserCreate {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  mobile: string;
}
