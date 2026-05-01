import { Repository } from "./common-repository.js";

class FactorRepository extends Repository<"factor"> {
  constructor() {
    super("factor");
  }
}

export const factorRep = new FactorRepository();
