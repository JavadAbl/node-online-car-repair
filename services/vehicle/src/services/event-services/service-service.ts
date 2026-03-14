import { ServiceRepository } from "../../infrastructure/database/Repository/service.repository.js";
import { CreateService, UpdateService } from "../../types/event-types/service-types.js";

const serviceRep = new ServiceRepository();

async function createService(payload: CreateService) {
  const { id } = payload;
  await serviceRep.checkDuplicateBy({ select: { id: true }, where: { id } }, "id", id);
  return await serviceRep.create({ select: { id: true }, data: payload });
}

async function updateService(payload: UpdateService) {
  const { id } = payload;
  await serviceRep.findAndCheckExistsBy({ select: { id: true }, where: { id } }, "id", id);
  delete payload.id;
  return await serviceRep.update({ select: { id: true }, where: { id }, data: payload });
}

export const serviceService = { createService, updateService };
