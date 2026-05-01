import { Repository } from "./common-repository.js";

class ServiceRepository extends Repository<"serviceReference"> {
  constructor() {
    super("serviceReference");
  }
}

export const serviceRep = new ServiceRepository();
