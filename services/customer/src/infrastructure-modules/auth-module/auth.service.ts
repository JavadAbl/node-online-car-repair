import { Injectable } from '@nestjs/common';
import {
  generateActionPermissionName,
  generateControllerPermissionName,
  SERVICE_PERMISSION,
} from './auth.utils';
import { PermissionType, Role } from 'src/generated/prisma/enums';
import { AuthRepository } from './auth.repository';
import { RabbitMQPublisher } from '../rmq-module/rmq-publisher.service';
import { RMQ_P_RK_PERMISSIONS } from '../rmq-module/config/rmq.config';
import { RolePermissionCreateEvent } from '../rmq-module/contracts/role-permission-event';

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
    const { name, role } = rolePermissionEvent;
    return this.authRep.createRolePermission({ data: { permissionName: name, role } });
  }

  findIncludedRolePermission(role: Role, permissionName: string) {
    return this.authRep.findFirstRolePermission({
      where: { role, permissionName: { contains: permissionName } },
    });
  }
}
