// index.ts
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { appConfig } from "./utils/app-config.js";
import { SERVICES } from "./services.js";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { serviceProxyPlugin } from "./routes.js";
import { fastifyJwt } from "@fastify/jwt";
import { readFileSync } from "fs";
import { join } from "path";
import cors from "@fastify/cors";

export const app = fastify({
  logger: false,
  https: {
    key: readFileSync(join(process.cwd(), "localhost-private.key")),
    cert: readFileSync(join(process.cwd(), "localhost-cert.pem")),
  },
  routerOptions: { caseSensitive: false, ignoreTrailingSlash: false },
});

async function start() {
  try {
    await startHttpServer();
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

async function startHttpServer() {
  const host = appConfig.HTTP_HOST;
  const port = appConfig.HTTP_PORT;

  await setupFastifyPlugins();

  await app.listen({ port, host });
  app.log.info(`HTTP server running on ${host}:${port}`);
}

async function setupFastifyPlugins() {
  await app.register(cors, { origin: "*", methods: "*" });

  app.addContentTypeParser("multipart/form-data", (request, payload, done) => {
    done(null, payload);
  });

  app.register(fastifyJwt, { secret: "your-secret-key-for-hashing" });

  app.decorate("auth", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  //  Swagger core (minimal config - only needed for swagger-ui dependency)
  await app.register(swagger, {
    openapi: {
      info: {
        title: "API Gateway",
        description: "Select a service from the dropdown above to view its API documentation",
        version: "1.0.0",
      },
    },
  });

  //  Register the per-service proxy (Replaces the old gatewayRoutes)
  await app.register(serviceProxyPlugin);

  //  Swagger UI with external service specs in dropdown
  await app.register(swaggerUi, {
    routePrefix: "/",
    uiConfig: {
      // THIS POPULATES THE TOP-RIGHT DROPDOWN ("Definition List")
      urls: Object.entries(SERVICES).map(([name]) => ({
        name: `${name.charAt(0).toUpperCase() + name.slice(1)} Service`,
        url: `/api-docs/${name}/swagger.json`,
      })),
      defaultModelsExpandDepth: -1, // Hide empty schemas
      defaultModelRendering: "model",
      displayRequestDuration: true,
    },
    staticCSP: true,
  });
}

start();
