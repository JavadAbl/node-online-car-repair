import { FastifyPluginAsync } from "fastify";
import {
  CreateVehicleRouteType,
  CreateVehicleSchema,
} from "../schemas/vehicle/request/create-vehicle.schema.js";
import {
  DeleteVehicleRouteType,
  DeleteVehicleSchema,
} from "../schemas/vehicle/request/delete-vehicle.schema.js";
import { vehicleService } from "../services/vehicle.service.js";
import { GetVehiclesRouteType, GetVehiclesSchema } from "../schemas/vehicle/request/get-vehicles.schema.js";
import {
  GetVehicleByIdRouteType,
  GetVehicleByIdSchema,
} from "../schemas/vehicle/request/get-by-id-vehicle.schema.js";
import {
  UpdateVehicleRouteType,
  UpdateVehicleSchema,
} from "../schemas/vehicle/request/update-vehicle.schema.js";
import { VehicleDto } from "../schemas/vehicle/reply/vehicle.schema.js";

export const vehicleRoutes: FastifyPluginAsync = async (app) => {
  // Get all vehicles----------------------------------------------
  app.get<GetVehiclesRouteType>(
    "/",
    { schema: GetVehiclesSchema },
    (request, reply) => vehicleService.getMany(request.query) as unknown as VehicleDto[],
  );

  // Get vehicle by id---------------------------------------------
  app.get<GetVehicleByIdRouteType>(
    "/:id",
    { schema: GetVehicleByIdSchema },
    (request, reply) => vehicleService.getById(request.params.id) as unknown as VehicleDto,
  );

  // Create vehicle ------------------------------------------------
  app.post<CreateVehicleRouteType>(
    "/",
    { schema: CreateVehicleSchema },
    (request, reply) => vehicleService.create(request.body) as unknown as VehicleDto,
  );

  // Update vehicle ------------------------------------------------
  app.put<UpdateVehicleRouteType>("/:id", { schema: UpdateVehicleSchema }, (request, reply) =>
    vehicleService.update(request.params.id, request.body),
  );

  // Delete vehicle ------------------------------------------------
  app.delete<DeleteVehicleRouteType>("/:id", { schema: DeleteVehicleSchema }, (request, reply) =>
    vehicleService.deleteById(request.params.id),
  );
};
