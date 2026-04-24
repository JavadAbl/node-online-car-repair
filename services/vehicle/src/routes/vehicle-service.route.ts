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
  UpdateVehicleServiceRouteType,
  UpdateVehicleServiceSchema,
} from "../schemas/vehicle-service/request/update-vehicle-service.schema.js";
import { VehicleServiceDto } from "../schemas/vehicle-service/reply/vehicle-service.schema.js";
import { VehicleServiceControllerPermissions } from "../infrastructure/auth/permissions.js";
import {
  GetVehicleServicesRouteType,
  GetVehicleServicesSchema,
} from "../schemas/vehicle-service/request/get-vehicle-services.schema.js";
import {
  GetVehicleServicesByVehicleIdRouteType,
  GetVehicleServicesByVehicleIdSchema,
} from "../schemas/vehicle-service/request/get-vehicle-services-by-vehicle-id.schema.js";

export const vehicleServiceRoutes: FastifyPluginAsync = async (app) => {
  // Get all vehicle service histories----------------------------------------------
  app.get<GetVehicleServicesRouteType>(
    "/",
    {
      schema: GetVehicleServicesSchema,
      auth: { permission: VehicleServiceControllerPermissions.GetAllVehicleServices },
    },
    (request, reply) => vehicleServiceEntityService.getMany(request.query),
  );

  // Get vehicle service by context----------------------------------------------
  app.get<GetVehicleServicesByVehicleIdRouteType>(
    "/Vehicle/:id",
    { schema: GetVehicleServicesByVehicleIdSchema },
    (request, reply) =>
      vehicleServiceEntityService.getManyByVehicleId(request.user.id, request.params.id, request.query),
  );

  // Get vehicle service history by id---------------------------------------------
  app.get<GetVehicleServiceByIdRouteType>(
    "/:id",
    {
      schema: GetVehicleServiceByIdSchema,
      auth: { permission: VehicleServiceControllerPermissions.GetVehicleServiceById },
    },
    (request, reply) =>
      vehicleServiceEntityService.getById(request.params.id) as unknown as VehicleServiceDto,
  );

  // Create vehicle service history ------------------------------------------------
  app.post<CreateVehicleServiceRouteType>(
    "",
    {
      schema: CreateVehicleServiceSchema,
      auth: { permission: VehicleServiceControllerPermissions.CreateVehicleService },
    },
    (request, reply) => vehicleServiceEntityService.create(request.body) as unknown as VehicleServiceDto,
  );

  // Update vehicle service history ------------------------------------------------
  app.put<UpdateVehicleServiceRouteType>(
    "/:id",
    {
      schema: UpdateVehicleServiceSchema,
      auth: { permission: VehicleServiceControllerPermissions.UpdateVehicleService },
    },
    (request, reply) =>
      vehicleServiceEntityService.update(request.params.id, request.body) as unknown as VehicleServiceDto,
  );

  // Delete vehicle service history ------------------------------------------------
  app.delete<DeleteVehicleServiceRouteType>(
    "/:id",
    {
      schema: DeleteVehicleServiceSchema,
      auth: { permission: VehicleServiceControllerPermissions.DeleteVehicleService },
    },
    (request, reply) => vehicleServiceEntityService.deleteById(request.params.id),
  );
};
