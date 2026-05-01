import { Repository } from "./common-repository.js";

class CustomerRepository extends Repository<"customerReference"> {
  constructor() {
    super("customerReference");
  }
}

export const customerRep = new CustomerRepository();
