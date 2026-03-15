import { VehicleRepository } from "../infrastructure/database/Repository/vehicle.repository.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { CreateVehicle } from "../schemas/vehicle/request/create-vehicle.schema.js";
import { UpdateVehicle } from "../schemas/vehicle/request/update-vehicle.schema.js";
import { buildFindManyArgs } from "../utils/prisma.utils.js";

const vehicleRep = new VehicleRepository();

function getMany(query: GetManyQuery<"Vehicle">) {
  const predicate = buildFindManyArgs(query, { searchableFields: ["vin", "make", "model", "year"] });
  return vehicleRep.findMany(predicate);
}

function getById(id: number) {
  return vehicleRep.findUnique({ where: { id } });
}

async function create(payload: CreateVehicle) {
  const { vin } = payload;
  await vehicleRep.checkDuplicateBy({ where: { vin } }, "vin", vin);
  return vehicleRep.create({ data: payload });
}

async function update(id: number, payload: UpdateVehicle) {
  await vehicleRep.findAndCheckExistsBy({ where: { id }, select: { id: true } }, "id", id);
  await vehicleRep.update({ where: { id }, data: payload });
}

async function deleteById(id: number) {
  await vehicleRep.findAndCheckExistsBy({ where: { id }, select: { id: true } }, "id", id);
  await vehicleRep.remove({ where: { id } });
}

export const vehicleService = { getMany, getById, create, update, deleteById };
