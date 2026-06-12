import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
@Exclude()
export class UserCreateEvent {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  mobile: string;
}
