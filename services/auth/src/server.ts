import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { config, isDev } from "./infrastructure/config.js";
import { errorHandler } from "./plugins/error-handler.js";
import fastify from "fastify";
import { setupRouter } from "./routes/router.js";

export const app = fastify({ logger: false, caseSensitive: false });

export async function startHttpServer() {
  // Register Swagger for API documentation
  if (isDev) {
    await app.register(fastifySwagger, {
      openapi: {
        info: {
          title: "Auth Microservice API",
          description: "API documentation for the Auth Microservice",
          version: "1.0.0",
        },
        // servers: [{ url: `http://localhost:${config.HTTP_PORT}`, description: "Internal Microservice (h2c)" }],
      },
      exposeHeadRoutes: false,
    });

    await app.register(fastifySwaggerUi, {
      routePrefix: "/",
      uiConfig: { deepLinking: false, docExpansion: "list", persistAuthorization: true },
    });
  }

  app.setErrorHandler(errorHandler);

  await setupRouter(app);

  const port = config.HTTP_PORT;
  const address = config.HTTP_HOST;

  await app.listen({ port, host: address });

  console.log(`HTTP/2 (h2c) Server running on http://${address}:${port}`);
}
