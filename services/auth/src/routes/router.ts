import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.route.js";
import { userRoutes } from "./user.route.js";
import { Http2SecureServer } from "http2";

export async function setupRouter(app: FastifyInstance<Http2SecureServer>) {
  await app.register(authRoutes, { prefix: "/Auth/" });
  await app.register(userRoutes, { prefix: "/Users/" });
}
