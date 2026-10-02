import { FastifyPluginAsync } from "fastify";
import { userService } from "../services/user.service.js";
import { SetUserRoleRouteType, SetUserRoleSchema } from "../schemas/user/request/set-user-role.schema.js";
import { GetManyUsersRouteType, GetManyUsersSchema } from "../schemas/user/request/get-many-users.schema.js";
import {
  GetUserPermissionRouteType,
  GetUserPermissionSchema,
} from "../schemas/user/request/get-user-permission.schema.js";
import {
  AddUserPermissionRouteType,
  AddUserPermissionSchema,
} from "../schemas/user/request/add-user-permission.schema.js";
import {
  DeleteUserPermissionRouteType,
  DeleteUserPermissionSchema,
} from "../schemas/user/request/delete-user-permission.schema.js";
import {
  GetUserByContextRouteType,
  GetUserByContextSchema,
} from "../schemas/user/request/get-user-by-context.schema.js";
import {
  SyncUserPermissionsRouteType,
  SyncUserPermissionsSchema,
} from "../schemas/user/request/sync-user-permissions.schema.js";

export const userRoutes: FastifyPluginAsync = async (app) => {
  // GetUserByContext (any authenticated user reads their own context) --------
  app.get<GetUserByContextRouteType>(
    "/",
    { schema: GetUserByContextSchema, auth: { authenticatedOnly: true } },
    async (request, reply) => {
      return userService.getUserById(request.user.id);
    },
  );

  // Get many users (admin listing) -------------------------------------------
  app.get<GetManyUsersRouteType>(
    "Admin",
    { schema: GetManyUsersSchema, auth: { permission: "auth.UserController.GetManyUsers" } },
    async (request, reply) => {
      return userService.getMany(request.query);
    },
  );

  // Set user role ------------------------------------------------
  app.post<SetUserRoleRouteType>(
    ":id/SetRole",
    { schema: SetUserRoleSchema, auth: { permission: "auth.UserController.SetUserRole" } },
    async (request, reply) => {
      return userService.setUserRole(request.params.id, request.body);
    },
  );

  // Add user permissions ------------------------------------------------
  app.post<AddUserPermissionRouteType>(
    ":id/AddUserPermission",
    { schema: AddUserPermissionSchema, auth: { permission: "auth.UserController.AddUserPermission" } },
    async (request, reply) => {
      return userService.addUserPermission(request.params.id, request.body);
    },
  );

  // Remove user permissions ------------------------------------------------
  app.delete<DeleteUserPermissionRouteType>(
    ":id/DeleteUserPermission",
    { schema: DeleteUserPermissionSchema, auth: { permission: "auth.UserController.DeleteUserPermission" } },
    async (request, reply) => {
      return userService.removeUserPermission(request.params.id, request.body);
    },
  );

  // Get user permissions ------------------------------------------------
  app.get<GetUserPermissionRouteType>(
    ":id/GetUserPermissions",
    { schema: GetUserPermissionSchema, auth: { permission: "auth.UserController.GetUserPermissions" } },
    async (request, reply) => {
      return userService.getUserPermissions(request.params.id);
    },
  );

  // Bulk-sync a user's personal grants (admin user screen save) ------------
  app.put<SyncUserPermissionsRouteType>(
    ":id/SyncUserPermissions",
    { schema: SyncUserPermissionsSchema, auth: { permission: "auth.UserController.SyncUserPermissions" } },
    async (request, reply) => {
      return userService.syncUserPermissions(request.params.id, request.body);
    },
  );
};
