import { FastifyPluginAsync } from "fastify";
import { vehicleServiceEntityService } from "../services/vehicle-service-entity.service.js";
import {
  CreateVehicleServiceRouteType,
  CreateVehicleServiceSchema,
} from "../schemas/vehicle-service/request/create-vehicle-service.schema.js";
import {
  DeleteVehicleServiceRouteType,
  DeleteVehicleServiceSchema,
} from "../schemas/vehicle-service/request/delete-vehicle-service.schema.js";
import {
  GetVehicleServiceByIdRouteType,
  GetVehicleServiceByIdSchema,
} from "../schemas/vehicle-service/request/get-by-id-vehicle-service.schema.js";
import {
  GetVehicleServiceHistoriesRouteType,
  GetVehicleServiceHistoriesSchema,
} from "../schemas/vehicle-service/request/get-vehicle-services.schema.js";
import {
  UpdateVehicleServiceRouteType,
  UpdateVehicleServiceSchema,
} from "../schemas/vehicle-service/request/update-vehicle-service.schema.js";
import { VehicleServiceDto } from "../schemas/vehicle-service/reply/vehicle-service.schema.js";

export const vehicleServiceRoutes: FastifyPluginAsync = async (app) => {
  // Get all vehicle service histories----------------------------------------------
  app.get<GetVehicleServiceHistoriesRouteType>(
    "/",
    { schema: GetVehicleServiceHistoriesSchema },
    (request, reply) => vehicleServiceEntityService.getMany(request.query) as unknown as VehicleServiceDto[],
  );

  // Get vehicle service history by id---------------------------------------------
  app.get<GetVehicleServiceByIdRouteType>(
    "/:id",
    { schema: GetVehicleServiceByIdSchema },
    (request, reply) =>
      vehicleServiceEntityService.getById(request.params.id) as unknown as VehicleServiceDto,
  );

  // Create vehicle service history ------------------------------------------------
  app.post<CreateVehicleServiceRouteType>(
    "",
    { schema: CreateVehicleServiceSchema },
    (request, reply) => vehicleServiceEntityService.create(request.body) as unknown as VehicleServiceDto,
  );

  // Update vehicle service history ------------------------------------------------
  app.put<UpdateVehicleServiceRouteType>(
    "/:id",
    { schema: UpdateVehicleServiceSchema },
    (request, reply) =>
      vehicleServiceEntityService.update(request.params.id, request.body) as unknown as VehicleServiceDto,
  );

  // Delete vehicle service history ------------------------------------------------
  app.delete<DeleteVehicleServiceRouteType>(
    "/:id",
    { schema: DeleteVehicleServiceSchema },
    (request, reply) => vehicleServiceEntityService.deleteById(request.params.id),
  );
};
