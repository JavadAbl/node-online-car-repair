// auth-utils.ts
// Shared helpers for the authorization chain.
// Used by: the guard plugin (authorization), the user-context plugin (request.user)
// and the service registry publisher (permission catalog sync).

/**
 * Hierarchical permission containment with dot-segment boundary.
 *
 * The permission tree is:  Service -> Controller -> Action
 * e.g. grant "vehicle" (service level) covers "vehicle.VehicleController.CreateVehicle",
 *      grant "vehicle.VehicleController" covers "vehicle.VehicleController.CreateVehicle",
 *      but grant "vehicle.VehicleController" does NOT cover "vehicle.VehicleControllerExtra.X"
 * (the trailing "." prevents prefix collisions between sibling controllers).
 */
export function covers(grant: string, required: string): boolean {
  return grant === required || required.startsWith(grant + ".");
}

/**
 * Safely parse the `x-user-permissions` header (a JSON array of permission names
 * injected by the gateway from the JWT `permissions` claim).
 * Never throws; malformed input is treated as "no claims".
 */
export function parseClaims(raw: unknown): string[] {
  if (typeof raw !== "string" || raw.length === 0) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/**
 * Derive the full permission list (for the auth-service catalog) from the
 * action-level permission names collected from route definitions:
 *   actions   -> exactly the collected route permissions
 *   controllers -> actions with the last segment stripped (deduped)
 *   service   -> the service-level root permission
 */
export function derivePermissionList(
  service: string,
  actions: string[],
): { name: string; type: "Service" | "Controller" | "Action" }[] {
  const uniqueActions = [...new Set(actions)].sort();
  const controllers = [...new Set(uniqueActions.map((a) => a.split(".").slice(0, -1).join(".")))].sort();

  return [
    { name: service, type: "Service" as const },
    ...controllers.map((name) => ({ name, type: "Controller" as const })),
    ...uniqueActions.map((name) => ({ name, type: "Action" as const })),
  ];
}
