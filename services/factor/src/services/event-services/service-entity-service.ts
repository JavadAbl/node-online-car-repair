import { ServiceRepository } from "../../infrastructure/database/Repository/service.repository.js";
import { CreateServiceEvent } from "../../schemas/event-schemas/service/create-service.schema.js";
import { UpdateServiceEvent } from "../../schemas/event-schemas/service/update-service.schema.js";

const serviceRep = new ServiceRepository();

async function createService(payload: CreateServiceEvent) {
  const { id } = payload;
  await serviceRep.checkDuplicateBy({ select: { id: true }, where: { id } }, "id", id);
  return await serviceRep.create({ select: { id: true }, data: payload });
}

async function updateService(payload: UpdateServiceEvent) {
  const { id, ...body } = payload;
  await serviceRep.findAndCheckExistsBy({ select: { id: true }, where: { id } }, "id", id);
  return await serviceRep.update({ select: { id: true }, where: { id }, data: body });
}

export const serviceService = { createService, updateService };
