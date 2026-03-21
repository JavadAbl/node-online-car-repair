import { Repository } from "./common-repository.js";

export class CustomerRepository extends Repository<"customerReference"> {
  constructor() {
    super("customerReference");
  }
}
