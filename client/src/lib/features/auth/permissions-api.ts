import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "@/lib/shared/base-api-client";
import {
  GetUsersParams,
  PermissionReferenceDto,
  RolePermissionDto,
  SetUserRoleDto,
  SyncRolePermissionsDto,
  SyncUserPermissionsDto,
  UserAccountDto,
  UserPermissionDto,
} from "./permissions-types";

const AUTH_DOMAIN = "Auth-Api";

// Role & permission management (admin). The catalog and per-role grants are
// read from the auth service through the gateway; the bulk sync replaces a
// role's whole grant list atomically and fans out mirror events server-side.
export const permissionsApi = createApi({
  reducerPath: "permissionsApi",
  baseQuery: baseApi,
  tagTypes: ["Roles", "PermissionReferences", "RolePermissions", "Users", "UserPermissions"],
  endpoints: (builder) => ({
    // The available roles (auth database enum) -------------------------------
    GetRoles: builder.query<string[], void>({
      query: () => ({
        url: `${AUTH_DOMAIN}/Auth/Roles`,
      }),
      providesTags: ["Roles"],
    }),

    // The global permission catalog (every service's registry) ---------------
    GetPermissionReferences: builder.query<PermissionReferenceDto[], void>({
      query: () => ({
        url: `${AUTH_DOMAIN}/Auth/PermissionReferences`,
      }),
      providesTags: ["PermissionReferences"],
    }),

    // Every grant of one role (seed state for the permissions screen) --------
    GetRolePermissions: builder.query<RolePermissionDto[], string>({
      query: (role) => ({
        url: `${AUTH_DOMAIN}/Auth/RolePermissions/Role/${role}`,
      }),
      providesTags: (result, error, role) => [
        { type: "RolePermissions", id: role },
      ],
    }),

    // Replace a role's grants with the submitted list ------------------------
    SyncRolePermissions: builder.mutation<
      RolePermissionDto[],
      SyncRolePermissionsDto
    >({
      query: (body) => ({
        url: `${AUTH_DOMAIN}/Auth/RolePermissions`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { role }) => [
        { type: "RolePermissions", id: role },
      ],
    }),

    // ---------------------------------------------------------------------
    // User grant management (admin "Users & Permissions" screen)
    // ---------------------------------------------------------------------

    // The admin user listing (paginated server-side, limit 10; search by mobile)
    GetUsers: builder.query<UserAccountDto[], GetUsersParams>({
      query: ({ page = 1, search }) => ({
        url: `${AUTH_DOMAIN}/Users/Admin`,
        params: { page, ...(search ? { search } : {}) },
      }),
      providesTags: ["Users"],
    }),

    // The personal grants of one user (seed state for the user screen) -------
    GetUserPermissions: builder.query<UserPermissionDto[], number>({
      query: (userId) => ({
        url: `${AUTH_DOMAIN}/Users/${userId}/GetUserPermissions`,
      }),
      providesTags: (result, error, userId) => [
        { type: "UserPermissions", id: userId },
      ],
    }),

    // Replace a user's personal grants with the submitted list ----------------
    SyncUserPermissions: builder.mutation<
      UserPermissionDto[],
      SyncUserPermissionsDto
    >({
      query: ({ userId, permissionNames }) => ({
        url: `${AUTH_DOMAIN}/Users/${userId}/SyncUserPermissions`,
        method: "PUT",
        body: { permissionNames },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "UserPermissions", id: userId },
      ],
    }),

    // Change a user's role (drives the role half of their effective grants) ----
    SetUserRole: builder.mutation<void, SetUserRoleDto>({
      query: ({ userId, role }) => ({
        url: `${AUTH_DOMAIN}/Users/${userId}/SetRole`,
        method: "POST",
        body: { role },
      }),
      // The listing row (and the manager's role-coverage view) both read the
      // user's role from the Users cache, so it must be refetched.
      invalidatesTags: (result, error, { userId }) => [
        "Users",
        { type: "UserPermissions", id: userId },
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetPermissionReferencesQuery,
  useGetRolePermissionsQuery,
  useSyncRolePermissionsMutation,
  useGetUsersQuery,
  useGetUserPermissionsQuery,
  useSyncUserPermissionsMutation,
  useSetUserRoleMutation,
} = permissionsApi;
