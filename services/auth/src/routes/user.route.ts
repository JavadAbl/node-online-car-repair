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
} from "../schemas/user/request/delete-user-permission.schema copy.js";

export const userRoutes: FastifyPluginAsync = async (app) => {
  // Get many users ------------------------------------------------
  app.get<GetManyUsersRouteType>("Admin", { schema: GetManyUsersSchema }, async (request, reply) => {
    return userService.getMany(request.query);
  });

  // Set user role ------------------------------------------------
  app.post<SetUserRoleRouteType>(":id/SetRole", { schema: SetUserRoleSchema }, async (request, reply) => {
    return userService.setUserRole(request.params.id, request.body);
  });

  // Add user permissions ------------------------------------------------
  app.post<AddUserPermissionRouteType>(
    ":id/AddUserPermission",
    { schema: AddUserPermissionSchema },
    async (request, reply) => {
      return userService.addUserPermission(request.params.id, request.body);
    },
  );

  // Remove user permissions ------------------------------------------------
  app.delete<DeleteUserPermissionRouteType>(
    ":id/DeleteUserPermission",
    { schema: DeleteUserPermissionSchema },
    async (request, reply) => {
      return userService.removeUserPermission(request.params.id, request.body);
    },
  );

  // Get user permissions ------------------------------------------------
  app.get<GetUserPermissionRouteType>(
    ":id/GetUserPermissions",
    { schema: GetUserPermissionSchema },
    async (request, reply) => {
      return userService.getUserPermissions(request.params.id);
    },
  );
};
