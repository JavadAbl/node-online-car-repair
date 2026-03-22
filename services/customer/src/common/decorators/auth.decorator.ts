// auth.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { DECORATOR_AUTH_KEY } from './decorator-keys';

export interface AuthConfig {
  roles?: string[];
  permission?: string;
}

export const Auth = (config: AuthConfig) => SetMetadata(DECORATOR_AUTH_KEY, config);
