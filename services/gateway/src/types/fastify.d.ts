import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    /** JWT verification guard: validates the Bearer token and sets request.user. */
    auth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
