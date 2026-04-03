import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { config, isDev } from "./infrastructure/config.js";
import { errorHandler } from "./plugins/error-handler.js";
import { vehicleRoutes } from "./routes/vehicle.route.js";
import { vehicleServiceRoutes } from "./routes/vehicle-service.route.js";
import fastify from "fastify";
import { testRoutes } from "./routes/test.route.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { authPlugin } from "./plugins/auth.plugin.js";

export const app = fastify({
  logger: true,
  http2: true,
  https: {
    key: readFileSync(join(process.cwd(), "localhost-private.key")),
    cert: readFileSync(join(process.cwd(), "localhost-cert.pem")),
  },
  caseSensitive: false,
  ajv: { customOptions: { removeAdditional: "all" } },
});

export async function startHttpServer() {
  // Register Swagger for API documentation
  if (isDev) {
    await app.register(fastifySwagger, {
      openapi: {
        info: {
          title: "Vehicle Microservice API",
          description: "API documentation for the Vehicle Microservice",
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

  app.register(authPlugin);

  app.register(testRoutes, { prefix: "/Test" });
  app.register(vehicleRoutes, { prefix: "/Vehicles" });
  app.register(vehicleServiceRoutes, { prefix: "/VehicleService" });

  app.setErrorHandler(errorHandler);

  app.get("/health", async () => {
    return { status: "OK", timestamp: new Date().toISOString() };
  });

  const port = config.HTTP_PORT;
  const address = config.HTTP_HOST;

  await app.listen({ port, host: address });

  // Note: When using http2: true with Fastify without passing https options,
  // it defaults to running on the HTTP/2 module but may handle the initial
  // connection as HTTP/1.1 and require an Upgrade header depending on the Node version/Fastify wrapper.

  // For strict "h2c" (prior knowledge) where the client speaks HTTP/2 immediately,
  // standard Node.js http2.createServer is needed. However, Fastify's built-in http2: true
  // handles standard h2c upgrades automatically.

  console.log(`HTTP/2 (h2c) Server running on http://${address}:${port}`);
}
