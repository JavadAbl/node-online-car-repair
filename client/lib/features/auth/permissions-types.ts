/** Level of a permission inside the Service / Controller / Action tree. */
export type PermissionType = "Service" | "Controller" | "Action";

/** One entry of the global permission catalog (served by the auth service). */
export type PermissionReferenceDto = {
  name: string;
  type: PermissionType;
};

/** One role grant row. */
export type RolePermissionDto = {
  id: number;
  role: string;
  permissionName: string;
};

/** Bulk-sync payload: the COMPLETE desired grant list for a role. */
export type SyncRolePermissionsDto = {
  role: string;
  permissionNames: string[];
};

/** One user row of the admin listing (includes the role so the UI can reason
 *  about role-derived vs personal grants). */
export type UserAccountDto = {
  id: number;
  mobile: string;
  role: string;
};

/** Query params for the admin user listing (server paginates, limit 10). */
export type GetUsersParams = {
  page?: number;
  search?: string;
};

/** One personal user grant row (same shape as GetUserPermissions replies). */
export type UserPermissionDto = {
  name: string;
};

/** Bulk-sync payload: the COMPLETE desired personal grant list for a user. */
export type SyncUserPermissionsDto = {
  userId: number;
  permissionNames: string[];
};

/** SetUserRole payload. */
export type SetUserRoleDto = {
  userId: number;
  role: string;
};
