import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.route.js";
import { userRoutes } from "./user.route.js";

export async function setupRouter(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: "/Auth/" });
  await app.register(userRoutes, { prefix: "/User/" });
}
