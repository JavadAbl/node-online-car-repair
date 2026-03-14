import { Repository } from "./common-repository.js";

export class VehicleServiceRepository extends Repository<"vehicleService"> {
  constructor() {
    super("vehicleService");
  }
}
