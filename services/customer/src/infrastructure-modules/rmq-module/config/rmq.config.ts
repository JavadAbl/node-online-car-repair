export const RMQ_APP_ID = 'customer.api';
export const RMQ_EXCHANGE = 'app_exchange';

//Queues
export const RMQ_Q_AUTH_USER_CREATE = `customer.api-user.create`;
export const RMQ_Q_RK_AUTH_USER_CREATE = 'auth.api-user.create';

export const RMQ_Q_AUTH_ROLE_PERMISSION_CREATE = `customer.api-role.permission.create`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE = 'auth.api-role.permission.create';

export const RMQ_Q_AUTH_ROLE_PERMISSION_DELETE = `customer.api-role.permission.delete`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_DELETE = 'auth.api-role.permission.delete';

//Publish
export const RMQ_P_RK_CUSTOMER_CREATE = 'customer.api-customer.create';
export const RMQ_P_RK_CUSTOMER_UPDATE = 'customer.api-customer.update';
export const RMQ_P_RK_PERMISSIONS = 'customer.api-permission.sync';
