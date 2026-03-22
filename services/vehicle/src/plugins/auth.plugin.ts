import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { StatusCodes } from "http-status-codes";

const authPluginHandler: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("auth", async function (request, reply, required) {
    const userRole = request.headers["x-user-role"];
    const userPermissionsRaw = request.headers["x-user-permissions"];

    const userPermissions = typeof userPermissionsRaw === "string" ? userPermissionsRaw.split(",") : [];

    if (required.roles && !required.roles.includes(userRole as string)) {
      return reply.code(StatusCodes.FORBIDDEN).send();
    }

    if (required.permissions) {
      const hasAll = required.permissions.every((p) => userPermissions.includes(p));

      if (!hasAll) {
        return reply.code(StatusCodes.FORBIDDEN).send();
      }
    }
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
