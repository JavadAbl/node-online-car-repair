export const RMQ_APP_ID = 'customer.api';
export const RMQ_EXCHANGE = 'app_exchange';

//Queues
const auth_user_create_base = 'customer.api-user.create';
export const RMQ_Q_AUTH_USER_CREATE = `${auth_user_create_base}`;
export const RMQ_Q_AUTH_USER_CREATE_RETRY = `${auth_user_create_base}-retry`;
export const RMQ_Q_AUTH_USER_CREATE_RETRY_RK = `${auth_user_create_base}-retry-rk`;
export const RMQ_Q_AUTH_USER_CREATE_DLQ = `${auth_user_create_base}-dlq`;
export const RMQ_Q_RK_AUTH_USER_CREATE = 'auth.api-user.create';

const auth_role_permission_create_base = 'customer.api-role.permission-create';
export const RMQ_Q_AUTH_ROLE_PERMISSION_CREATE = `${auth_role_permission_create_base}`;
export const RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_RETRY = `${auth_role_permission_create_base}-retry`;
export const RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_RETRY_RK = `${auth_role_permission_create_base}-retry-rk`;
export const RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_DLQ = `${auth_role_permission_create_base}-dlq`;
export const RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE = 'auth.api-role.permission-create';

//Publish
export const RMQ_P_RK_CUSTOMER_CREATE = 'customer.api_customer.create';
export const RMQ_P_RK_CUSTOMER_UPDATE = 'customer.api_customer.update';
export const RMQ_P_RK_PERMISSIONS = 'customer.api_permissions';
