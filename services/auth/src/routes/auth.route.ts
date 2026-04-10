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
} from "../schemas/auth/request/delete-role-permission.schema copy.js";
import { StatusCodes } from "http-status-codes";
import {
  GetRolePermissionsRouteType,
  GetRolePermissionsSchema,
} from "../schemas/auth/request/get-role-permissions.schema.js";
import { RefreshRouteType, RefreshSchema } from "../schemas/auth/request/refresh.schema.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Send otp ------------------------------------------------
  app.post<SendOtpRouteType>("SendOtp", { schema: SendOtpSchema }, async (request, reply) =>
    authService.sendOtp(request.body),
  );

  // Verify otp ------------------------------------------------
  app.post<VerifyOtpRouteType>("VerifyOtp", { schema: VerifyOtpSchema }, async (request, reply) =>
    authService.verifyOtp(request.body),
  );

  // Refresh Token ------------------------------------------------
  app.post<RefreshRouteType>("Refresh", { schema: RefreshSchema }, async (request, reply) =>
    authService.refresh(request.body),
  );

  // Get Role Permissions------------------------------------------------
  app.get<GetRolePermissionsRouteType>(
    "RolePermissions",
    { schema: GetRolePermissionsSchema },
    async (request, reply) => authService.getRolePermissions(request.query),
  );

  // Create Role Permission------------------------------------------------
  app.post<CreateRolePermissionRouteType>(
    "RolePermissions",
    { schema: CreateRolePermissionSchema },
    async (request, reply) => {
      reply.statusCode = StatusCodes.CREATED;
      return authService.createRolePermission(request.body);
    },
  );

  // Delete Role Permission------------------------------------------------
  app.delete<DeleteRolePermissionRouteType>(
    "RolePermissions/:id",
    { schema: DeleteRolePermissionSchema },
    async (request, reply) => {
      await authService.deleteRolePermission(request.params.id);
      reply.status(StatusCodes.NO_CONTENT);
    },
  );
};
