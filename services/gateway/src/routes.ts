//routes.ts
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import fastifyReplyFrom from "@fastify/reply-from";
import { SERVICES } from "./services.js";
import type { IncomingHttpHeaders } from "node:http";

/**
 * Removes any client-supplied identity headers so they can never be forged.
 * The gateway is the only party allowed to set x-user-* (from the verified JWT).
 */
function stripUserHeaders(headers: IncomingHttpHeaders): Record<string, string | string[] | undefined> {
  const safe: Record<string, any> = { ...headers };
  delete safe["x-user-id"];
  delete safe["x-user-role"];
  delete safe["x-user-permissions"];
  return safe;
}

function singleHeader(jwtPayload: any, key: "userId" | "role", fallback: string): string {
  const value = jwtPayload?.[key];
  return value === undefined || value === null ? fallback : String(value);
}

/** Identity headers derived from the verified JWT, ready for the downstream guard. */
function identityHeaders(jwtPayload: any): Record<string, string> {
  const permissions = Array.isArray(jwtPayload?.permissions)
    ? jwtPayload.permissions.filter((p: unknown): p is string => typeof p === "string")
    : [];

  return {
    "x-user-id": singleHeader(jwtPayload, "userId", ""),
    "x-user-role": singleHeader(jwtPayload, "role", ""),
    // JSON array: downstream guards parse this with parseClaims().
    "x-user-permissions": JSON.stringify(permissions),
  };
}

export const serviceProxyPlugin: FastifyPluginAsync = fp(
  async (app) => {
    for (const [serviceName, baseUrl] of Object.entries(SERVICES)) {
      // Create a new context (scope) for this specific service
      await app.register(async function (serviceInstance) {
        await serviceInstance.register(fastifyReplyFrom, { base: baseUrl, disableCache: true });

        // ---------------------------------------------------------
        // 2. The Main Gateway Routes (authenticated by default)
        // ---------------------------------------------------------

        serviceInstance.all(
          `/${serviceName}/*`,
          { preValidation: [serviceInstance.auth] },
          async (request, reply) => {
            const wildcardValue = request.params["*"];
            const jwtPayload = request.user as any;

            return reply.from(wildcardValue, {
              rewriteRequestHeaders: (req, headers) => ({
                ...stripUserHeaders(headers),
                ...identityHeaders(jwtPayload),
              }),

              onError: (reply, error) => {
                // If the specific microservice instance is down, return a clean error
                app.log.error(`Proxy error to ${serviceName}: ${error.error.message}`);
                reply.code(503).send({ error: `${serviceName} is currently unavailable` });
              },
            });
          },
        );

        // Public routes (no JWT) — still strip any client-supplied identity headers.
        if (serviceName === "auth-api") {
          const publicForward = (upstreamPath: string) => async (request: any, reply: any) => {
            return reply.from(upstreamPath, {
              rewriteRequestHeaders: (req: any, headers: IncomingHttpHeaders) => stripUserHeaders(headers),
            });
          };

          serviceInstance.post("/Auth-Api/Auth/SendOtp", publicForward("/Auth/SendOtp"));
          serviceInstance.post("/Auth-Api/Auth/SendOtp/", publicForward("/Auth/SendOtp"));

          serviceInstance.post("/Auth-Api/Auth/VerifyOtp", publicForward("/Auth/VerifyOtp"));
          serviceInstance.post("/Auth-Api/Auth/VerifyOtp/", publicForward("/Auth/VerifyOtp"));

          serviceInstance.post("/Auth-Api/Auth/Refresh", publicForward("/Auth/Refresh"));
          serviceInstance.post("/Auth-Api/Auth/Refresh/", publicForward("/Auth/Refresh"));
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
                ...stripUserHeaders(headers),
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
