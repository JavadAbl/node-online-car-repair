export const RMQ_APP_ID = 'service.api';
export const RMQ_EXCHANGE = 'app_exchange';

//Queue
export const RMQ_Q_AUTH_ROLE_PERMISSION_CREATE = `customer.api-role.permission.create`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE = 'auth.api-role.permission.create';

export const RMQ_Q_AUTH_ROLE_PERMISSION_DELETE = `customer.api-role.permission.delete`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_DELETE = 'auth.api-role.permission.delete';

//Publish
export const RMQ_P_RK_SERVICE_CREATE = 'service.api_service.create';
export const RMQ_P_RK_SERVICE_UPDATE = 'service.api_service.update';
export const RMQ_P_RK_PERMISSIONS = 'auth.api-permission.sync';
