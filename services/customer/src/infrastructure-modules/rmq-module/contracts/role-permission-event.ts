import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

@Exclude()
export class RolePermissionCreateEvent {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsEnum(Role)
  role: Role;
}
