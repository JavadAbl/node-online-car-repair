// auth.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { DECORATOR_AUTH_KEY } from './decorator-keys';
import { generateActionPermissionName } from 'src/infrastructure-modules/auth-module/auth.utils';

export const Auth = (controllerName: string, permission: string) =>
  SetMetadata(DECORATOR_AUTH_KEY, generateActionPermissionName(controllerName, permission));
