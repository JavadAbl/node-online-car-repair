import { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: UserContext;
  }

  interface RouteShorthandOptions {
    /** Route access rule for the authorization guard. */
    auth?: {
      /** Required action-level permission, e.g. "auth.UserController.SetUserRole". */
      permission?: string;
      /** Any authenticated identity passes; no permission required. */
      authenticatedOnly?: boolean;
    };
  }

  interface FastifyContextConfig {
    /** Marks a route as public (skips the authorization guard). */
    public?: boolean;
  }
}

export interface UserContext {
  id: number;
  role: string;
  permissions: string[];
}
