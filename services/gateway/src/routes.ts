import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import fastifyReplyFrom from "@fastify/reply-from";
import { SERVICES } from "./services.js";

/**
 * This plugin creates a scope for each service.
 * Inside this scope, HTTP/2 is enabled globally via 'base'.
 */
export const serviceProxyPlugin: FastifyPluginAsync = fp(
  async (app) => {
    for (const [serviceName, baseUrl] of Object.entries(SERVICES)) {
      // Create a new context (scope) for this specific service
      await app.register(async function (serviceInstance) {
        // 1. Register reply-from with HTTP/2 enabled for this scope
        await serviceInstance.register(fastifyReplyFrom, {
          base: baseUrl, // Fixed base for this service
          http2: true, // HTTP/2 enabled globally here
          disableCache: true,

          // Global error handler for this upstream
          onError: (reply, error) => {
            app.log.error({ error, service: serviceName }, "Upstream error");
          },
        });

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
            });
          },
        );

        /*     serviceInstance.all(
          `/${serviceName}/:tail(.*)`,
          // { preValidation: [serviceInstance.auth] },
          async (request, reply) => {
            const tail = (request.params as { tail?: string }).tail ?? "";
            const dest = tail ? `/${tail}` : "/";
            console.log(tail, dest);

            const jwtPayload = request.user as any;

            return reply.from(dest, {
              rewriteRequestHeaders: (req, headers) => ({
                ...headers,
                "x-user-id": jwtPayload.userId,
                "x-user-role": jwtPayload.role,
                "x-user-permissions": jwtPayload.permissions,
              }),
            });
          },
        );
 */
        /*  serviceInstance.all(
          `/${serviceName}`,
          { preValidation: [serviceInstance.auth] },
          async (request, reply) => {
            reply.redirect(`/${serviceName}/`);
          },
        ); */

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
