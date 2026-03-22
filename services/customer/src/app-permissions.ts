export const PermissionType = { Service: 'Service', Controller: 'Controller', Action: 'Action' } as const;

export const Role = {
  Admin: 'Admin',
  NewUser: 'NewUser',
  Customer: 'Customer',
  Operator: 'Operator',
} as const;

export const SERVICE_PERMISSION = 'customer' as const;

export const APP_PERMISSIONS: any[] = [{ type: PermissionType.Service, name: SERVICE_PERMISSION }];

//----------------------------------------------------------------------------

export const genActionPermissionName = (controller: string, action: string) =>
  `${SERVICE_PERMISSION}.${controller}.${action}`;

export const genControllerPermissionName = (controller: string) => `${SERVICE_PERMISSION}.${controller}`;

export const addControllerPermissions = (controller: any) => {
  APP_PERMISSIONS.push({
    type: PermissionType.Controller,
    name: genControllerPermissionName(controller.name),
  });

  Object.getOwnPropertyNames(controller.prototype)
    .filter((name) => name !== 'constructor' && typeof controller.prototype[name] === 'function')
    .forEach((method) =>
      APP_PERMISSIONS.push({
        type: PermissionType.Action,
        name: genActionPermissionName(controller.name, method),
      }),
    );
};
