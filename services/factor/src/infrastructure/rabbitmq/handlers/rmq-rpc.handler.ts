import { factorService } from "../../../services/factor-service.js";
import { RMQ_RPC_KEY_FACTOR_CREATE } from "../config/rmq-config.js";

export class RmqRpcHandlers {
  static getHandlers() {
    return { [RMQ_RPC_KEY_FACTOR_CREATE]: factorService.create };
  }
}
