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

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Send otp ------------------------------------------------
  app.post<SendOtpRouteType>("Send", { schema: SendOtpSchema }, async (request, reply) =>
    authService.sendOtp(request.body),
  );

  // Send otp ------------------------------------------------
  app.post<VerifyOtpRouteType>("Verify", { schema: VerifyOtpSchema }, async (request, reply) =>
    authService.verifyOtp(request.body),
  );

  // Create Role Permission------------------------------------------------
  app.post<CreateRolePermissionRouteType>(
    "Admin/Permission",
    { schema: CreateRolePermissionSchema },
    async (request, reply) => {
      reply.statusCode = StatusCodes.CREATED;
      return authService.createRolePermission(request.body);
    },
  );

  // Delete Role Permission------------------------------------------------
  app.delete<DeleteRolePermissionRouteType>(
    "Admin/Permission/:id",
    { schema: DeleteRolePermissionSchema },
    async (request, reply) => {
      await authService.deleteRolePermission(request.params.id);
      reply.status(StatusCodes.NO_CONTENT);
    },
  );
};
