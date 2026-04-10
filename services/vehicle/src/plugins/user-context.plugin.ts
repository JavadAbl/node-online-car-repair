import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { BadRequestError } from "../utils/app-error.js";

const userContextPluginHandler: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest("user");

  fastify.addHook("onRequest", async (request) => {
    const userId: string = request.headers["x-user-id"] as string;
    const role: string = request.headers["x-user-role"] as string;

    request.user = { id: Number(userId), role };
  });
};

export const userContextPlugin = fp(userContextPluginHandler, { name: "user-context" });
