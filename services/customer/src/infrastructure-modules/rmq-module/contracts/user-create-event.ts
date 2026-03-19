import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
@Exclude()
export class UserCreateEvent {
  @Expose()
  @IsString()
  @IsNotEmpty()
  mobile: string;
}
