import { VehicleServiceRepository } from "../infrastructure/database/Repository/vehicle-service.repository.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { CreateVehicleService } from "../schemas/vehicle-service/request/create-vehicle-service.schema.js";
import { UpdateVehicleService } from "../schemas/vehicle-service/request/update-vehicle-service.schema.js";
import { buildFindManyArgs } from "../utils/prisma.utils.js";

const vehicleServiceRep = new VehicleServiceRepository();

function getMany(query: GetManyQuery<"VehicleService">) {
  const predicate = buildFindManyArgs(query, { searchableFields: ["technicianName", "description"] });
  return vehicleServiceRep.findMany(predicate);
}

function getById(id: number) {
  return vehicleServiceRep.findUnique({ where: { id } });
}

async function create(payload: CreateVehicleService) {
  return vehicleServiceRep.create({ data: payload });
}

async function update(id: number, payload: UpdateVehicleService) {
  await vehicleServiceRep.findAndCheckExistsBy({ where: { id }, select: { id: true } }, "id", id);
  return vehicleServiceRep.update({ where: { id }, data: payload });
}

async function deleteById(id: number) {
  await vehicleServiceRep.findAndCheckExistsBy({ where: { id }, select: { id: true } }, "id", id);
  await vehicleServiceRep.remove({ where: { id } });
}

export const vehicleServiceEntityService = { getMany, getById, create, update, deleteById };
