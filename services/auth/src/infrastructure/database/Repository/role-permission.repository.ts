import { Repository } from "./common-repository.js";

class RolePermissionRepository extends Repository<"rolePermission"> {
  constructor() {
    super("rolePermission");
  }
}

export const rolePermissionRepository = new RolePermissionRepository();
