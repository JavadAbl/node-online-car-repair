import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

@Exclude()
export class RolePermissionDeleteEvent {
  @Expose()
  @IsInt()
  @IsNotEmpty()
  id: number;
}
