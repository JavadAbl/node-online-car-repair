import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: UserContext;
  }

  interface FastifyInstance {
    auth: (request: FastifyRequest, reply: FastifyReply, required: { permission?: string }) => Promise<void>;
  }

  interface RouteShorthandOptions {
    auth?: { permission: string };
  }
}

export interface UserContext {
  id: number;
  role: string;
}
