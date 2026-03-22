import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";

const userContextPluginHandler: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest("user", undefined);

  fastify.addHook("onRequest", async (request) => {
    const userId = request.headers["x-user-id"];
    const role = request.headers["x-user-role"];

    request.user = {
      id: typeof userId === "string" ? userId : undefined,
      role: typeof role === "string" ? role : undefined,
    };
  });
};

export const userContextPlugin = fp(userContextPluginHandler, { name: "user-context" });
