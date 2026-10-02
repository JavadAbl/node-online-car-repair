import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { parseClaims } from "../infrastructure/auth/auth-utils.js";

const userContextPluginHandler: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest("user");

  fastify.addHook("onRequest", async (request) => {
    const header = (key: string) => {
      const value = request.headers[key];
      return Array.isArray(value) ? value[0] : value;
    };

    request.user = {
      id: Number(header("x-user-id")),
      role: header("x-user-role") ?? "",
      permissions: parseClaims(header("x-user-permissions")),
    };
  });
};

export const userContextPlugin = fp(userContextPluginHandler, { name: "user-context" });
