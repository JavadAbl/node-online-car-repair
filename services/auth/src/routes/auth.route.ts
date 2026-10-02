import { FastifyPluginAsync } from "fastify";
import { SendOtpRouteType, SendOtpSchema } from "../schemas/auth/request/send-otp.schema.js";
import { authService } from "../services/auth.service.js";
import { VerifyOtpRouteType, VerifyOtpSchema } from "../schemas/auth/request/verify-otp.schema.js";
import {
  CreateRolePermissionRouteType,
  CreateRolePermissionSchema,
} from "../schemas/auth/request/create-role-permission.schema.js";
import {
  DeleteRolePermissionRouteType,
  DeleteRolePermissionSchema,
} from "../schemas/auth/request/delete-role-permission.schema.js";
import { StatusCodes } from "http-status-codes";
import {
  GetRolePermissionsRouteType,
  GetRolePermissionsSchema,
} from "../schemas/auth/request/get-role-permissions.schema.js";
import {
  GetRolePermissionsByRoleRouteType,
  GetRolePermissionsByRoleSchema,
} from "../schemas/auth/request/get-role-permissions-by-role.schema.js";
import {
  GetPermissionReferencesRouteType,
  GetPermissionReferencesSchema,
} from "../schemas/auth/request/get-permission-references.schema.js";
import {
  GetRolesRouteType,
  GetRolesSchema,
} from "../schemas/auth/request/get-roles.schema.js";
import {
  SyncRolePermissionsRouteType,
  SyncRolePermissionsSchema,
} from "../schemas/auth/request/sync-role-permissions.schema.js";
import { RefreshRouteType, RefreshSchema } from "../schemas/auth/request/refresh.schema.js";
import { LogoutRouteType, LogoutSchema } from "../schemas/auth/request/logout.schema.js";

/** Best-effort client context for session audit columns. */
function sessionContext(request: { ip: string; headers: Record<string, unknown> }) {
  const ua = request.headers["user-agent"];
  return {
    ip: request.ip,
    userAgent: Array.isArray(ua) ? ua[0] : (ua as string | undefined),
  };
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Send otp (public: pre-login, throttled per mobile) -------------------------
  app.post<SendOtpRouteType>(
    "SendOtp",
    { schema: SendOtpSchema, config: { public: true } },
    async (request, reply) => {
      await authService.sendOtp(request.body);
      reply.status(StatusCodes.NO_CONTENT);
    },
  );

  // Verify otp (public: pre-login) ----------------------------------------------
  app.post<VerifyOtpRouteType>(
    "VerifyOtp",
    { schema: VerifyOtpSchema, config: { public: true } },
    async (request, reply) => authService.verifyOtp(request.body, sessionContext(request)),
  );

  // Refresh token (public: the refresh token itself is the credential) ----------
  app.post<RefreshRouteType>(
    "Refresh",
    { schema: RefreshSchema, config: { public: true } },
    async (request, reply) => authService.refresh(request.body, sessionContext(request)),
  );

  // Logout (authenticated: revokes the caller's own refresh token) --------------
  app.post<LogoutRouteType>(
    "Logout",
    { schema: LogoutSchema, auth: { authenticatedOnly: true } },
    async (request, reply) => {
      await authService.logout(request.body, { userId: request.user.id });
      reply.status(StatusCodes.NO_CONTENT);
    },
  );

  // Get Role Permissions (paginated generic listing) -------------------------
  app.get<GetRolePermissionsRouteType>(
    "RolePermissions",
    { schema: GetRolePermissionsSchema, auth: { permission: "auth.AuthController.GetRolePermissions" } },
    async (request, reply) => authService.getRolePermissions(request.query),
  );

  // Get every grant of one role (admin permissions screen seed state) --------
  app.get<GetRolePermissionsByRoleRouteType>(
    "RolePermissions/Role/:role",
    {
      schema: GetRolePermissionsByRoleSchema,
      auth: { permission: "auth.AuthController.GetRolePermissionsByRole" },
    },
    async (request, reply) => authService.getRolePermissionsByRole(request.params.role),
  );

  // Get the global permission catalog ----------------------------------------
  app.get<GetPermissionReferencesRouteType>(
    "PermissionReferences",
    {
      schema: GetPermissionReferencesSchema,
      auth: { permission: "auth.AuthController.GetPermissionReferences" },
    },
    async (request, reply) => authService.getPermissionReferences(),
  );

  // Get the available roles ---------------------------------------------------
  app.get<GetRolesRouteType>(
    "Roles",
    { schema: GetRolesSchema, auth: { permission: "auth.AuthController.GetRoles" } },
    async (request, reply) => authService.getRoles(),
  );

  // Bulk-sync a role's grants (admin permissions screen save) ----------------
  app.put<SyncRolePermissionsRouteType>(
    "RolePermissions",
    {
      schema: SyncRolePermissionsSchema,
      auth: { permission: "auth.AuthController.SyncRolePermissions" },
    },
    async (request, reply) => authService.syncRolePermissions(request.body),
  );

  // Create Role Permission ------------------------------------------------
  app.post<CreateRolePermissionRouteType>(
    "RolePermissions",
    { schema: CreateRolePermissionSchema, auth: { permission: "auth.AuthController.CreateRolePermission" } },
    async (request, reply) => {
      reply.statusCode = StatusCodes.CREATED;
      return authService.createRolePermission(request.body);
    },
  );

  // Delete Role Permission ------------------------------------------------
  app.delete<DeleteRolePermissionRouteType>(
    "RolePermissions/:id",
    { schema: DeleteRolePermissionSchema, auth: { permission: "auth.AuthController.DeleteRolePermission" } },
    async (request, reply) => {
      await authService.deleteRolePermission(request.params.id);
      reply.status(StatusCodes.NO_CONTENT);
    },
  );
};
