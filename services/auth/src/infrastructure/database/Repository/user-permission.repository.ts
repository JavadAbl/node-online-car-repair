import { Repository } from "./common-repository.js";

export class UserPermissionRepository extends Repository<"userPermission"> {
  constructor() {
    super("userPermission");
  }
}
