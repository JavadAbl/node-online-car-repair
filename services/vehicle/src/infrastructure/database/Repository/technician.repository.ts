import { Repository } from "./common-repository.js";

export class TechnicianRepository extends Repository<"technicianReference"> {
  constructor() {
    super("technicianReference");
  }
}

export const technicianRep = new TechnicianRepository();
