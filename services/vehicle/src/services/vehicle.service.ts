import { customerRep } from "../infrastructure/database/Repository/customer.repository.js";
import { vehicleRep } from "../infrastructure/database/Repository/vehicle.repository.js";
import { GetManyReply } from "../schemas/common/get-many-reply.schema.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { VehicleDto } from "../schemas/vehicle/reply/vehicle.schema.js";
import { CreateVehicle } from "../schemas/vehicle/request/create-vehicle.schema.js";
import { UpdateVehicle } from "../schemas/vehicle/request/update-vehicle.schema.js";
import { buildFindManyArgs } from "../utils/prisma.utils.js";

export class VehicleService {
  getMany(query: GetManyQuery<"Vehicle">): Promise<GetManyReply<VehicleDto>> {
    const predicate = buildFindManyArgs(query, { searchableFields: ["vin", "make", "model", "year"] });
    return vehicleRep.findMany(predicate);
  }

  async getManyByCustomerId(
    customerId: number,
    query: GetManyQuery<"Vehicle">,
  ): Promise<GetManyReply<VehicleDto>> {
    await customerRep.findAndCheckExistsBy({ where: { id: customerId } }, "id", customerId);
    const predicate = buildFindManyArgs(query, { searchableFields: ["vin", "make", "model", "year"] });
    return vehicleRep.findMany({ ...predicate, where: { ...predicate.where, customerId } });
  }

  getById(id: number) {
    return vehicleRep.findUnique({ where: { id } });
  }

  async create(customerId: number, payload: CreateVehicle) {
    const { vin } = payload;
    await vehicleRep.checkDuplicateBy({ where: { vin } }, "vin", vin);
    return vehicleRep.create({ data: { ...payload, customerId } });
  }

  async update(id: number, payload: UpdateVehicle) {
    await vehicleRep.findAndCheckExistsBy({ where: { id }, select: { id: true } }, "id", id);
    await vehicleRep.update({ where: { id }, data: payload });
  }

  async deleteById(id: number) {
    await vehicleRep.findAndCheckExistsBy({ where: { id }, select: { id: true } }, "id", id);
    await vehicleRep.remove({ where: { id } });
  }
}

export const vehicleService = new VehicleService();
