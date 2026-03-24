import { Repository } from "./common-repository.js";

class PermissionRepository extends Repository<"permission"> {
  constructor() {
    super("permission");
  }
}

export const permissionRepository = new PermissionRepository();
