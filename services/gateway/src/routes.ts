//routes.ts
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import fastifyReplyFrom from "@fastify/reply-from";
import { SERVICES } from "./services.js";

export const serviceProxyPlugin: FastifyPluginAsync = fp(
  async (app) => {
    for (const [serviceName, baseUrl] of Object.entries(SERVICES)) {
      // Create a new context (scope) for this specific service
      await app.register(async function (serviceInstance) {
        await serviceInstance.register(fastifyReplyFrom, { base: baseUrl, disableCache: true });

        // ---------------------------------------------------------
        // 2. The Main Gateway Routes (Existing)
        // ---------------------------------------------------------

        serviceInstance.all(
          `/${serviceName}/*`,
          { preValidation: [serviceInstance.auth] },
          async (request, reply) => {
            const wildcardValue = request.params["*"];
            const jwtPayload = request.user as any;

            return reply.from(wildcardValue, {
              rewriteRequestHeaders: (req, headers) => ({
                ...headers,
                "x-user-id": jwtPayload.userId,
                "x-user-role": jwtPayload.role,
                "x-user-permissions": jwtPayload.permissions,
              }),

              onError: (reply, error) => {
                // If the specific microservice instance is down, return a clean error
                app.log.error(`Proxy error to ${serviceName}: ${error.error.message}`);
                reply.code(503).send({ error: `${serviceName} is currently unavailable` });
              },
            });
          },
        );

        //Public routes
        if (serviceName === "auth-api") {
          serviceInstance.post("/Auth-Api/Auth/SendOtp", (request, reply) => {
            return reply.from("/Auth/SendOtp");
          });
          serviceInstance.post("/Auth-Api/Auth/SendOtp/", (request, reply) => {
            return reply.from("/Auth/SendOtp");
          });

          serviceInstance.post("/Auth-Api/Auth/VerifyOtp", (request, reply) => {
            return reply.from("/Auth/VerifyOtp");
          });
          serviceInstance.post("/Auth-Api/Auth/VerifyOtp/", (request, reply) => {
            return reply.from("/Auth/VerifyOtp");
          });

          serviceInstance.post("/Auth-Api/Auth/Refresh", (request, reply) => {
            return reply.from("/Auth/Refresh");
          });
          serviceInstance.post("/Auth-Api/Auth/Refresh/", (request, reply) => {
            return reply.from("/Auth/Refresh");
          });
        }

        // ---------------------------------------------------------
        // 3. The Swagger Proxy Routes (Moved here for HTTP/2)
        // ---------------------------------------------------------
        // By placing this here, it inherits the http2: true configuration
        // and the base: baseUrl automatically.
        serviceInstance.get(`/api-docs/${serviceName}/swagger.json`, async (request, reply) => {
          try {
            // We only need the relative path because 'base' is set in the plugin options above
            const targetUrl = `${baseUrl}/json`;
            return reply.from(targetUrl, {
              rewriteRequestHeaders: (req, headers) => ({
                ...headers,
                // Add service-specific auth headers if needed
              }),
              // Specific error handler for swagger
              onError: (reply, error) => {
                app.log.error(`Failed to fetch ${serviceName} Swagger: ${error.error.message}`);
                reply.code(502).send({ error: `Service '${serviceName}' documentation unavailable` });
              },
            });
          } catch (err) {
            app.log.error(`Proxy error for ${serviceName}: ${err?.message}`);
            reply.code(500).send({ error: "Documentation fetch failed" });
          }
        });
      });
    }
  },
  { name: "service-proxy" },
);
