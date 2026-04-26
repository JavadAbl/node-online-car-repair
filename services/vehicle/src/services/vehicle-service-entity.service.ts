import { VehicleServiceRepository } from "../infrastructure/database/Repository/vehicle-service.repository.js";
import { vehicleRep } from "../infrastructure/database/Repository/vehicle.repository.js";
import { GetManyReply } from "../schemas/common/get-many-reply.schema.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { VehicleServiceDto } from "../schemas/vehicle-service/reply/vehicle-service.schema.js";
import { CreateVehicleService } from "../schemas/vehicle-service/request/create-vehicle-service.schema.js";
import { UpdateVehicleService } from "../schemas/vehicle-service/request/update-vehicle-service.schema.js";
import { buildFindManyArgs } from "../utils/prisma.utils.js";

export class VehicleServiceEntityService {
  private vehicleServiceRep: VehicleServiceRepository;

  constructor() {
    this.vehicleServiceRep = new VehicleServiceRepository();
  }

  async getManyByCustomerId(
    customerId: number,
    query: GetManyQuery<"VehicleService">,
  ): Promise<GetManyReply<VehicleServiceDto>> {
    const predicate = buildFindManyArgs(query);
    const data = await this.vehicleServiceRep.findMany({
      ...predicate,
      where: { ...predicate.where, vehicle: { customerId } },
      omit: { createdAt: true, updatedAt: true },
      include: {
        service: { select: { name: true } },
        vehicle: { select: { model: true } },
        technician: true,
      },
    });
    const parsedData: GetManyReply<VehicleServiceDto> = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        serviceName: item.service.name,
        vehicleModel: item.vehicle.model,
        serviceDate: item.serviceDate.toISOString(),
        technicianName: item.technician.firstName + " " + item.technician.lastName,
        technicianNumber: item.technician.technicianNumber,
        service: undefined,
        vehicle: undefined,
        technician: undefined,
      })),
    };

    return parsedData;
  }

  async getManyByVehicleId(
    customerId: number,
    vehicleId: number,
    query: GetManyQuery<"VehicleService">,
  ): Promise<GetManyReply<VehicleServiceDto>> {
    await vehicleRep.findAndCheckExistsBy({ where: { id: vehicleId, customerId } }, "id", vehicleId);
    const predicate = buildFindManyArgs(query);
    const data = await this.vehicleServiceRep.findMany({
      ...predicate,
      where: { ...predicate.where, vehicleId, vehicle: { customerId } },
      omit: { createdAt: true, updatedAt: true },
      include: {
        service: { select: { name: true } },
        vehicle: { select: { model: true } },
        technician: true,
      },
    });
    const parsedData: GetManyReply<VehicleServiceDto> = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        serviceName: item.service.name,
        vehicleModel: item.vehicle.model,
        serviceDate: item.serviceDate.toISOString(),
        technicianName: item.technician.firstName + " " + item.technician.lastName,
        technicianNumber: item.technician.technicianNumber,
        service: undefined,
        vehicle: undefined,
        technician: undefined,
      })),
    };

    return parsedData;
  }

  getById(id: number) {
    return this.vehicleServiceRep.findUnique({ where: { id } });
  }

  async create(payload: CreateVehicleService) {
    return this.vehicleServiceRep.create({ data: payload });
  }

  async update(id: number, payload: UpdateVehicleService) {
    await this.vehicleServiceRep.findAndCheckExistsBy({ where: { id }, select: { id: true } }, "id", id);
    return this.vehicleServiceRep.update({ where: { id }, data: payload });
  }

  async deleteById(id: number) {
    await this.vehicleServiceRep.findAndCheckExistsBy({ where: { id }, select: { id: true } }, "id", id);
    await this.vehicleServiceRep.remove({ where: { id } });
  }
}

export const vehicleServiceEntityService = new VehicleServiceEntityService();
