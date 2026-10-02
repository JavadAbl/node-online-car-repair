// use-auth.ts
// Express authorization middleware for the factor service.
//
// Model:
//   - Authentication is handled at the gateway (JWT verification -> trusted x-user-* headers).
//   - Authorization is handled here. This service keeps no local permission mirror,
//     so decisions are made from the token claims injected by the gateway
//     (role grants + user grants, computed at token issuance).
//   - Admin role always has access to all.
//   - Grants are hierarchical (service -> controller -> action, dot-boundary aware).

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Hierarchical permission containment with dot-segment boundary.
 * grant "factor.FactorController" covers "factor.FactorController.CreateFactor",
 * but never "factor.FactorControllerExtra.X".
 */
function covers(grant: string, required: string): boolean {
  return grant === required || required.startsWith(grant + ".");
}

/** Safely parse the x-user-permissions header (JSON array). Never throws. */
function parseClaims(raw: unknown): string[] {
  if (typeof raw !== "string" || raw.length === 0) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function header(req: Request, key: string): string | undefined {
  const value = req.headers[key];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Usage:
 *   router.get("/", useAuth(), handler)                    // authenticated only
 *   router.get("/", useAuth("factor.FactorController.GetFactors"), handler)  // permission required
 */
export const useAuth =
  (permission?: string) => (req: Request, res: Response, next: NextFunction) => {
    const userId = header(req, "x-user-id");
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    // Authenticated-only route: identity is enough.
    if (!permission) return next();

    // Admin always has access to all.
    if (header(req, "x-user-role") === "Admin") return next();

    const claims = parseClaims(header(req, "x-user-permissions"));
    if (claims.some((grant) => covers(grant, permission))) return next();

    return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
  };
