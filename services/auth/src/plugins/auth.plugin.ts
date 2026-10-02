// auth.plugin.ts
// Secure-by-default authorization guard for the auth service's own routes.
//
// Model (see doc.md):
//   - Authentication is handled at the gateway (JWT verification -> trusted x-user-* headers).
//   - Authorization is handled here. Every route MUST declare an access rule:
//       config: { public: true }            -> no guard (login endpoints)
//       auth:  { authenticatedOnly: true }   -> any valid identity, no permission needed
//       auth:  { permission: "auth.X.Y" }    -> identity + (Admin role OR claims OR local grants)
//     A route without any rule fails fast at boot (it can never silently ship unprotected).
//   - Admin role always has access to everything.
//   - Grants are hierarchical: a service/controller grant covers all its children.
//   - Local fallback reads the tables this service OWNS (RolePermission + UserPermission),
//     so auth-service grants are always fresh (no claims staleness for admin operations).

import fp from "fastify-plugin";
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { covers, parseClaims } from "../infrastructure/auth/auth-utils.js";
import { Role } from "../infrastructure/database/generated/prisma/enums.js";
import { rolePermissionRepository } from "../infrastructure/database/Repository/role-permission.repository.js";
import { userPermissionRepository } from "../infrastructure/database/Repository/user-permission.repository.js";

/**
 * Action-level permission names collected from route definitions.
 * Consumed at startup (index.ts) to publish this service's own permission
 * catalog into PermissionReference via the permission-sync flow.
 */
export const collectedRoutePermissions = new Set<string>();

function header(request: FastifyRequest, key: string): string | undefined {
  const value = request.headers[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Identity-only guard: any request that passed the gateway's JWT check. */
async function identityGuard(request: FastifyRequest, reply: FastifyReply) {
  if (!header(request, "x-user-id")) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
  }
}

/** Full authorization guard for a single required action permission. */
async function permissionGuard(required: string, request: FastifyRequest, reply: FastifyReply) {
  const userId = header(request, "x-user-id");
  if (!userId) {
    return reply.code(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
  }

  const role = header(request, "x-user-role") ?? "";
  if (role === "Admin") return; // Admin always has access to all

  // 1. Fast path: permission claims from the token (role grants + user grants,
  //    computed at token issuance and injected by the gateway).
  const claims = parseClaims(header(request, "x-user-permissions"));
  if (claims.some((grant) => covers(grant, required))) return;

  // 2. Fresh fallback from the tables this service owns.
  const [roleGrants, userGrants] = await Promise.all([
    rolePermissionRepository.findMany({ where: { role: role as Role }, select: { permissionName: true } }),
    userPermissionRepository.findMany({ where: { userId: Number(userId) }, select: { permissionName: true } }),
  ]);
  const grants = [...roleGrants, ...userGrants].map((row) => row.permissionName);
  if (grants.some((grant) => covers(grant, required))) return;

  return reply.code(StatusCodes.FORBIDDEN).send({ message: "Forbidden" });
}

const authPluginHandler: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRoute", (routeOptions) => {
    const options = routeOptions as any;

    // Public routes (login flow): skip the guard entirely.
    if (options.config?.public === true) return;

    const authOpt = options.auth as { permission?: string; authenticatedOnly?: boolean } | undefined;

    // Secure by default: an unclassified route is a programming error -> fail boot.
    if (!authOpt || (!authOpt.permission && !authOpt.authenticatedOnly)) {
      throw new Error(
        `[auth] Route "${options.method} ${options.url}" has no access rule. ` +
          `Mark it with config:{public:true}, auth:{authenticatedOnly:true} or auth:{permission:"..."}.`,
      );
    }

    if (authOpt.permission) collectedRoutePermissions.add(authOpt.permission);

    const preHandler = authOpt.permission
      ? (request: FastifyRequest, reply: FastifyReply) => permissionGuard(authOpt.permission!, request, reply)
      : (request: FastifyRequest, reply: FastifyReply) => identityGuard(request, reply);

    // Append to any existing preValidation hooks (e.g. schema validation stays first).
    if (!options.preValidation) {
      options.preValidation = preHandler;
    } else if (Array.isArray(options.preValidation)) {
      options.preValidation.push(preHandler);
    } else {
      options.preValidation = [options.preValidation, preHandler];
    }
  });
};

export const authPlugin = fp(authPluginHandler, { name: "auth-guard" });
