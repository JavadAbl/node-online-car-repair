// auth.guard.ts
// Global secure-by-default authorization guard (registered as APP_GUARD).
//
// Model:
//   - Authentication is handled at the gateway (JWT verification -> trusted x-user-* headers).
//   - Authorization is handled here. Handlers are guarded BY DEFAULT; only
//     @Public() handlers are skipped. The required permission is derived from the
//     controller and handler names (same source addControllerPermissions uses),
//     so no per-handler marks are needed and nothing can drift.
//   - Admin role always has access to all.
//   - Grants are hierarchical (service -> controller -> action, dot-boundary aware).
//   - Fast path: token claims (role grants + user grants at issuance time).
//   - Fallback: this service's local RolePermission mirror (synced via RMQ).

import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from '../decorators/decorator-keys';
import { AuthService } from 'src/infrastructure-modules/auth-module/auth.service';
import { generateActionPermissionName } from 'src/infrastructure-modules/auth-module/auth.utils';
import { covers, parseClaims, singleHeader } from '../utils/permission.utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Public routes (login flow, health): skip the guard entirely.
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Required permission derived from names -> always in sync with the registry.
    const required = generateActionPermissionName(context.getClass().name, context.getHandler().name);

    // Authentication: identity must be present (gateway-verified).
    const userId = singleHeader(request, 'x-user-id');
    if (!userId) throw new UnauthorizedException();

    // Admin always has access to all.
    const role = singleHeader(request, 'x-user-role') ?? '';
    if (role === 'Admin') return true;

    // 1. Fast path: permission claims from the token.
    const claims = parseClaims(singleHeader(request, 'x-user-permissions'));
    if (claims.some((grant) => covers(grant, required))) return true;

    // 2. Fallback: local RolePermission mirror (fresh via RMQ events).
    const grants = await this.authService.getRoleGrantNames(role);
    if (grants.some((grant) => covers(grant, required))) return true;

    throw new ForbiddenException();
  }
}
