import { Repository } from "./common-repository.js";

class PermissionRepository extends Repository<"permissionReference"> {
  constructor() {
    super("permissionReference");
  }
}

export const permissionRepository = new PermissionRepository();
