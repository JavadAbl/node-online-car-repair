import dotenv from "dotenv";
dotenv.config();

export const appConfig = {
  NODE_ENV: process.env.NODE_ENV,
  HTTP_PORT: parseInt(process.env.HTTP_PORT),
  HTTP_HOST: process.env.HTTP_HOST,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,

  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
  VEHICLE_SERVICE_URL: process.env.VEHICLE_SERVICE_URL,
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL,
  CUSTOMER_SERVICE_URL: process.env.CUSTOMER_SERVICE_URL,
  PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL,
  FACTOR_SERVICE_URL: process.env.FACTOR_SERVICE_URL,
};
