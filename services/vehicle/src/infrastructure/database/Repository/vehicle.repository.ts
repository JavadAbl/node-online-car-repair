import { Repository } from "./common-repository.js";

export class VehicleRepository extends Repository<"vehicle"> {
  constructor() {
    super("vehicle");
  }
}
