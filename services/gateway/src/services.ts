import { appConfig } from "./utils/app-config.js";

export const SERVICES = {
  "notification-api": appConfig.NOTIFICATION_SERVICE_URL,
  "vehicle-api": appConfig.VEHICLE_SERVICE_URL,
  "auth-api": appConfig.AUTH_SERVICE_URL,
  "product-api": appConfig.PRODUCT_SERVICE_URL,
  // The product service also hosts the car-repair Service + Technician
  // domain (controllers 'Service' and 'Technicians'). The client calls it
  // under its own prefix (Service-Api/Service, Service-Api/Technicians,
  // Service-Api/uploads/*), so it is registered here a second time pointing
  // at the same instance — the gateway wildcard strips the prefix before
  // forwarding.
  "service-api": appConfig.PRODUCT_SERVICE_URL,
  "customer-api": appConfig.CUSTOMER_SERVICE_URL,
  "factor-api": appConfig.FACTOR_SERVICE_URL,
};
