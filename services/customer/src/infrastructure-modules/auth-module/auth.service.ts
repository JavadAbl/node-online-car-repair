import { Injectable } from '@nestjs/common';
import {
  generateActionPermissionName,
  generateControllerPermissionName,
  SERVICE_PERMISSION,
} from './auth.utils';
import { PermissionType } from 'src/generated/prisma/enums';
import { AuthRepository } from './auth.repository';
import { RabbitMQPublisher } from '../rmq-module/rmq-publisher.service';
import { RMQ_P_RK_PERMISSIONS } from '../rmq-module/config/rmq.config';
import { RolePermissionCreateEvent } from '../rmq-module/contracts/role-permission-create-event';
import { RolePermissionDeleteEvent } from '../rmq-module/contracts/role-permission-delete-event';
import { Role } from 'src/generated/prisma/enums';

@Injectable()
export class AuthService {
  private APP_PERMISSIONS: { name: string; type: PermissionType }[] = [
    { type: PermissionType.Service, name: SERVICE_PERMISSION },
  ];

  constructor(
    private readonly authRep: AuthRepository,
    private readonly rmqPublisher: RabbitMQPublisher,
  ) {}

  async setupPermissions() {
    await this.authRep.syncPermissions(this.APP_PERMISSIONS);
    await this.rmqPublisher.publishNoLog(RMQ_P_RK_PERMISSIONS, this.APP_PERMISSIONS);
  }

  addControllerPermissions(controller: any) {
    this.APP_PERMISSIONS.push({
      type: PermissionType.Controller,
      name: generateControllerPermissionName(controller.name),
    });

    Object.getOwnPropertyNames(controller.prototype)
      .filter((name) => name !== 'constructor' && typeof controller.prototype[name] === 'function')
      .forEach((method) =>
        this.APP_PERMISSIONS.push({
          type: PermissionType.Action,
          name: generateActionPermissionName(controller.name, method),
        }),
      );
  }

  createRolePermission(rolePermissionEvent: RolePermissionCreateEvent) {
    const { permissionName, role, id } = rolePermissionEvent;
    return this.authRep.createRolePermission({ data: { permissionName, role, id } });
  }

  deleteRolePermission(rolePermissionEvent: RolePermissionDeleteEvent) {
    const { id } = rolePermissionEvent;
    return this.authRep.deleteRolePermission({ where: { id } });
  }

  /**
   * All permission names granted to a role in this service's local mirror.
   * Used by the guard as the fresh fallback when the token carries no matching claim.
   */
  async getRoleGrantNames(role: string) {
    const rows = await this.authRep.findManyRolePermission({
      where: { role: role as Role },
      select: { permissionName: true },
    });
    return rows.map((row) => row.permissionName);
  }
}
