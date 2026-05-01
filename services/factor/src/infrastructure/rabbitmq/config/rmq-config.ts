//rabbitmq.config.ts
export const RMQ_APP_ID = "factor.api";
export const RMQ_EXCHANGE = "app_exchange";

//Queues
export const RMQ_Q_RPC = "factor.api-rpc";

export const RMQ_Q_CUSTOMER_CREATE = "factor.api-customer.create";
export const RMQ_Q_RK_CUSTOMER_CREATE = "customer.api-customer.create";

export const RMQ_Q_CUSTOMER_UPDATE = "factor.api-customer.update";
export const RMQ_Q_RK_CUSTOMER_UPDATE = "customer.api-customer.update";

export const RMQ_Q_SERVICE_CREATE = "factor.api-service.create";
export const RMQ_Q_RK_SERVICE_CREATE = "service.api-service.create";

export const RMQ_Q_SERVICE_UPDATE = "factor.api-service.update";
export const RMQ_Q_RK_SERVICE_UPDATE = "service.api-service.update";

export const RMQ_Q_VEHICLE_SERVICE_CREATE = "factor.api-vehicle.service.create";
export const RMQ_Q_RK_VEHICLE_SERVICE_CREATE = "service.api-vehicle.service.create";

//RPC KEYS
export const RMQ_RPC_KEY_FACTOR_CREATE = "factor.create";
