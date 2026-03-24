import { Repository } from "./common-repository.js";

class UserPermissionRepository extends Repository<"userPermission"> {
  constructor() {
    super("userPermission");
  }
}

export const userPermissionRepository = new UserPermissionRepository();
