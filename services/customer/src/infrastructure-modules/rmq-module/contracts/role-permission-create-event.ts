import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

@Exclude()
export class RolePermissionCreateEvent {
  @Expose()
  @IsInt()
  @IsNotEmpty()
  id: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  permissionName: string;

  @Expose()
  @IsEnum(Role)
  role: Role;
}
