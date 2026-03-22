// auth.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthConfig } from '../decorators/auth.decorator';
import { DECORATOR_AUTH_KEY } from '../decorators/decorator-keys';
import { Role } from 'src/app-permissions';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const authConfig = this.reflector.getAllAndOverride<AuthConfig>(DECORATOR_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!authConfig) return true;

    const request = context.switchToHttp().getRequest();

    const userRole = request.headers['x-user-role'];
    const userPermission = request.headers['x-user-permissions'];
    console.log(authConfig);

    if (userRole === Role.Admin) return true;

    const roleMatch = authConfig.roles && authConfig.roles.includes(userRole) ? true : false;

    const permissionMatch = authConfig?.permission && authConfig.permission === userPermission ? true : false;

    if (roleMatch || permissionMatch) {
      return true;
    }

    throw new ForbiddenException();
  }
}
