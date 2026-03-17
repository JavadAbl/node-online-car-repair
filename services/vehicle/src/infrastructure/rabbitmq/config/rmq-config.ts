//rabbitmq.config.ts
export const RMQ_APP_ID = "vehicle.api";
export const RMQ_EXCHANGE = "app_exchange";

//Queues
export const RMQ_Q_CUSTOMER_CREATE = "vehicle.api_customer.create";
export const RMQ_Q_RK_CUSTOMER_CREATE = "customer.api_customer.create";

export const RMQ_Q_CUSTOMER_UPDATE = "vehicle.api_customer.update";
export const RMQ_Q_RK_CUSTOMER_UPDATE = "customer.api_customer.update";

export const RMQ_Q_SERVICE_CREATE = "vehicle.api_service.create";
export const RMQ_Q_RK_SERVICE_CREATE = "service.api_service.create";

export const RMQ_Q_SERVICE_UPDATE = "vehicle.api_service.update";
export const RMQ_Q_RK_SERVICE_UPDATE = "service.api_service.update";
