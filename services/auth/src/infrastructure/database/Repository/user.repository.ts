import { Repository } from "./common-repository.js";

class UserRepository extends Repository<"user"> {
  constructor() {
    super("user");
  }
}

export const userRepository = new UserRepository();
