//rabbitmq.config.ts
export const RMQ_APP_ID = "vehicle.api";
export const RMQ_EXCHANGE = "app_exchange";

//Queues
export const RMQ_Q_PERMISSION_SYNC = "vehicle.api-permission.sync";
export const RMQ_Q_RK_CUSTOMER_PERMISSION_SYNC = "customer.api-permission.sync";

//Publish
export const RMQ_P_RK_USER_CREATE = "auth.api_user.create";
