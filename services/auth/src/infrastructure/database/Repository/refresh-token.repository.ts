import { Repository } from "./common-repository.js";

class RefreshTokenRepository extends Repository<"refreshToken"> {
  constructor() {
    super("refreshToken");
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
