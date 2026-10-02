// permission.utils.ts
// Shared helpers for the authorization guards (NestJS services).

/**
 * Hierarchical permission containment with dot-segment boundary.
 * grant "customer" (service level) covers "customer.CustomerController.getManyCustomers";
 * grant "customer.CustomerController" covers its actions,
 * but never "customer.CustomerControllerExtra.x".
 */
export function covers(grant: string, required: string): boolean {
  return grant === required || required.startsWith(grant + '.');
}

/**
 * Safely parse the x-user-permissions header (JSON array of permission names
 * injected by the gateway from the JWT permissions claim). Never throws.
 */
export function parseClaims(raw: unknown): string[] {
  if (typeof raw !== 'string' || raw.length === 0) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

/** Single-valued header reader (x-user-* headers are gateway-controlled strings). */
export function singleHeader(req: { headers: Record<string, unknown> }, key: string): string | undefined {
  const value = req.headers[key];
  return Array.isArray(value) ? value[0] : (value as string | undefined);
}
