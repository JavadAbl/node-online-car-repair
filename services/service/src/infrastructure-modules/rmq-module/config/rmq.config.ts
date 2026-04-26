export const RMQ_APP_ID = 'service.api';
export const RMQ_EXCHANGE = 'app_exchange';

//Queue
export const RMQ_Q_AUTH_ROLE_PERMISSION_CREATE = `customer.api-role.permission.create`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE = 'auth.api-role.permission.create';

export const RMQ_Q_AUTH_ROLE_PERMISSION_DELETE = `customer.api-role.permission.delete`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_DELETE = 'auth.api-role.permission.delete';

//Publish
export const RMQ_P_RK_SERVICE_CREATE = 'service.api-service.create';
export const RMQ_P_RK_SERVICE_UPDATE = 'service.api-service.update';
export const RMQ_P_RK_TECHNICIAN_CREATE = 'service.api-technician.create';
export const RMQ_P_RK_TECHNICIAN_UPDATE = 'service.api-technician.update';
export const RMQ_P_RK_PERMISSIONS = 'auth.api-permission.sync';
