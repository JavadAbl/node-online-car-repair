//rabbitmq.config.ts
export const RMQ_APP_ID = "factor.api";
export const RMQ_EXCHANGE = "app_exchange";

//Queues
export const RMQ_Q_CUSTOMER_CREATE = "factor.api_customer.create";
export const RMQ_Q_RK_CUSTOMER_CREATE = "customer.api_customer.create";

export const RMQ_Q_CUSTOMER_UPDATE = "factor.api_customer.update";
export const RMQ_Q_RK_CUSTOMER_UPDATE = "customer.api_customer.update";

export const RMQ_Q_SERVICE_CREATE = "factor.api_service.create";
export const RMQ_Q_RK_SERVICE_CREATE = "service.api_service.create";

export const RMQ_Q_SERVICE_UPDATE = "factor.api_service.update";
export const RMQ_Q_RK_SERVICE_UPDATE = "service.api_service.update";
