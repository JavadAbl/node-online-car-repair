import { Repository } from "./common-repository.js";

export class ServiceRepository extends Repository<"serviceReference"> {
  constructor() {
    super("serviceReference");
  }
}
