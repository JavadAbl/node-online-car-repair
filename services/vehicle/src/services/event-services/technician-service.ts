import { TechnicianRepository } from "../../infrastructure/database/Repository/technician.repository.js";
import { CreateTechnician } from "../../schemas/event-schemas/technician/create-technician.schema.js";
import { UpdateTechnician } from "../../schemas/event-schemas/technician/update-technician.schema.js";

const technicianRep = new TechnicianRepository();

async function createTechnician(payload: CreateTechnician) {
  const { id } = payload;
  await technicianRep.checkDuplicateBy({ select: { id: true }, where: { id } }, "id", id);
  return await technicianRep.create({ select: { id: true }, data: payload });
}

async function updateTechnician(payload: UpdateTechnician) {
  const { id, ...body } = payload;
  await technicianRep.findAndCheckExistsBy({ select: { id: true }, where: { id } }, "id", id);
  return await technicianRep.update({ select: { id: true }, where: { id }, data: body });
}

export const technicianService = { createTechnician, updateTechnician };
