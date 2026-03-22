import { FastifyPluginAsync } from "fastify";
import { userService } from "../services/user.service.js";
import { SetUserRoleRouteType, SetUserRoleSchema } from "../schemas/user/request/set-user-role.schema.js";
import { GetManyUsersRouteType, GetManyUsersSchema } from "../schemas/user/request/get-many-users.schema.js";
import {
  SetUserPermissionRouteType,
  SetUserPermissionSchema,
} from "../schemas/user/request/set-user-permission.schema.js";
import {
  GetUserPermissionRouteType,
  GetUserPermissionSchema,
} from "../schemas/user/request/get-user-permission.schema.js";

export const userRoutes: FastifyPluginAsync = async (app) => {
  // Get many users ------------------------------------------------
  app.get<GetManyUsersRouteType>("Admin", { schema: GetManyUsersSchema }, async (request, reply) => {
    return userService.getMany(request.query);
  });

  // Set user role ------------------------------------------------
  app.post<SetUserRoleRouteType>(
    "Admin/:id/SetRole",
    { schema: SetUserRoleSchema },
    async (request, reply) => {
      return userService.setUserRole(request.params.id, request.body);
    },
  );

  // Add user permissions ------------------------------------------------
  app.post<SetUserPermissionRouteType>(
    "Admin/:id/SetPermissions",
    { schema: SetUserPermissionSchema },
    async (request, reply) => {
      return userService.addUserPermissions(request.params.id, request.body);
    },
  );

  // Remove user permissions ------------------------------------------------
  app.post<SetUserPermissionRouteType>(
    "Admin/:id/SetPermissions",
    { schema: SetUserPermissionSchema },
    async (request, reply) => {
      return userService.removeUserPermissions(request.params.id, request.body);
    },
  );

  // Get user permissions ------------------------------------------------
  app.get<GetUserPermissionRouteType>(
    "Admin/:id/SetPermissions",
    { schema: GetUserPermissionSchema },
    async (request, reply) => {
      return userService.getUserPermissions(request.params.id);
    },
  );
};
