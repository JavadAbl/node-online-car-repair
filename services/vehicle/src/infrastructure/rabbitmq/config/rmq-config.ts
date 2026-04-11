//rabbitmq.config.ts
export const RMQ_APP_ID = "vehicle.api";
export const RMQ_EXCHANGE = "app_exchange";

//Queues
export const RMQ_Q_CUSTOMER_CREATE = "vehicle.api-customer.create";
export const RMQ_Q_RK_CUSTOMER_CREATE = "customer.api-customer.create";

export const RMQ_Q_CUSTOMER_UPDATE = "vehicle.api-customer.update";
export const RMQ_Q_RK_CUSTOMER_UPDATE = "customer.api-customer.update";

export const RMQ_Q_SERVICE_CREATE = "vehicle.api-service.create";
export const RMQ_Q_RK_SERVICE_CREATE = "service.api-service.create";

export const RMQ_Q_SERVICE_UPDATE = "vehicle.api-service.update";
export const RMQ_Q_RK_SERVICE_UPDATE = "service.api-service.update";

export const RMQ_Q_AUTH_ROLE_PERMISSION_CREATE = `vehicle.api-role.permission.create`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE = "auth.api-role.permission.create";

export const RMQ_Q_AUTH_ROLE_PERMISSION_DELETE = `vehicle.api-role.permission.delete`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_DELETE = "auth.api-role.permission.delete";

//Publish
export const RMQ_P_RK_PERMISSIONS = "auth.api-permission.sync";
