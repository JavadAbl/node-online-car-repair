import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { StatusCodes } from "http-status-codes";
import { authService } from "../infrastructure/auth/auth.service.js";

const authPluginHandler: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("auth", async function (request, reply, required) {
    const { permission: actionPermission } = required;
    const userRole: any = request.headers["x-user-role"];
    const userPermissions: string[] =
      request.headers["x-user-permissions"] && JSON.parse(request.headers["x-user-permissions"] as string);

    if (userRole === "Admin" || !actionPermission) return;

    if (userPermissions && Array.isArray(userPermissions)) {
      const permissionMatch = userPermissions.some((userPermission) =>
        actionPermission.includes(userPermission),
      );
      if (permissionMatch) return;
    }

    if (userRole) {
      const roleMatch = await authService.findIncludedRolePermission(userRole, actionPermission);
      if (roleMatch) return;
    }

    return reply.code(StatusCodes.FORBIDDEN).send();
  });

  // Automatically attach auth to routes
  fastify.addHook("onRoute", (routeOptions) => {
    const authConfig = routeOptions.auth;

    if (!authConfig) return;

    const preHandler = async (request: any, reply: any) => {
      await fastify.auth(request, reply, authConfig);
    };

    if (!routeOptions.preValidation) {
      routeOptions.preValidation = preHandler;
    } else if (Array.isArray(routeOptions.preValidation)) {
      routeOptions.preValidation.push(preHandler);
    } else {
      routeOptions.preValidation = [routeOptions.preValidation, preHandler];
    }
  });
};

export const authPlugin = fp(authPluginHandler, { name: "auth" });
