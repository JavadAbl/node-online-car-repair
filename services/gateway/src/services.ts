import { appConfig } from "./utils/app-config.js";

export const SERVICES = {
  "notification-api": appConfig.NOTIFICATION_SERVICE_URL,
  "vehicle-api": appConfig.VEHICLE_SERVICE_URL,
  "auth-api": appConfig.AUTH_SERVICE_URL,
  "product-api": appConfig.PRODUCT_SERVICE_URL,
  "customer-api": appConfig.CUSTOMER_SERVICE_URL,
  "factor-api": appConfig.FACTOR_SERVICE_URL,
};
