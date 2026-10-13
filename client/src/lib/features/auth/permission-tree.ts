/**
 * Pure helpers shared by the admin permission screens (roles & users).
 * Both screens render the global permission catalog as a
 * Service -> Controller -> Action tree and resolve hierarchical grants the
 * same way the backend guards do (an ancestor grant covers its descendants).
 */

import type { PermissionReferenceDto } from "./permissions-types";

export type ControllerNode = { name: string; actions: string[] };
export type ServiceNode = { name: string; controllers: ControllerNode[] };

/** Groups the flat catalog into Service -> Controller -> Actions. */
export function buildTree(references: PermissionReferenceDto[]): ServiceNode[] {
  const services = new Map<string, ServiceNode>();
  const controllers = new Map<string, ControllerNode>();

  for (const ref of references) {
    const segments = ref.name.split(".");
    if (segments.length === 1) {
      if (!services.has(ref.name)) services.set(ref.name, { name: ref.name, controllers: [] });
    } else if (segments.length === 2) {
      const service = services.get(segments[0]);
      if (service) {
        const node: ControllerNode = { name: ref.name, actions: [] };
        controllers.set(ref.name, node);
        service.controllers.push(node);
      }
    } else {
      // Action (3+ segments): its controller must exist; create it defensively
      // if the catalog was only partially synced.
      const controllerName = segments.slice(0, 2).join(".");
      let node = controllers.get(controllerName);
      if (!node) {
        let service = services.get(segments[0]);
        if (!service) {
          service = { name: segments[0], controllers: [] };
          services.set(segments[0], service);
        }
        node = { name: controllerName, actions: [] };
        controllers.set(controllerName, node);
        service.controllers.push(node);
      }
      node.actions.push(ref.name);
    }
  }

  return [...services.values()]
    .map((service) => ({
      ...service,
      controllers: service.controllers.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** "vehicle.VehicleController.GetVehicle" -> ["vehicle", "vehicle.VehicleController"] */
export function ancestorsOf(name: string): string[] {
  const segments = name.split(".");
  return Array.from(
    { length: segments.length - 1 },
    (_, index) => segments.slice(0, index + 1).join("."),
  );
}

export const shortName = (name: string) => name.split(".").pop() ?? name;

export const prettify = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1);
