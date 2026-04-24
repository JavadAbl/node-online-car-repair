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
import { VehicleControllerPermissions } from "../infrastructure/auth/permissions.js";

export const vehicleRoutes: FastifyPluginAsync = async (app) => {
  // Get all vehicles----------------------------------------------
  app.get<GetVehiclesRouteType>(
    "/",
    { schema: GetVehiclesSchema, auth: { permission: VehicleControllerPermissions.GetAllVehicles } },
    (request, reply) => vehicleService.getMany(request.query),
  );

  // Get vehicles by context----------------------------------------------
  app.get<GetVehiclesRouteType>(
    "/CustomerVehicles",
    { schema: GetVehiclesSchema, auth: { permission: VehicleControllerPermissions.GetCustomerVehicles } },
    (request, reply) => vehicleService.getManyByCustomerId(request.user.id, request.query),
  );

  // Get vehicle by id---------------------------------------------
  app.get<GetVehicleByIdRouteType>(
    "/:id",
    { schema: GetVehicleByIdSchema, auth: { permission: VehicleControllerPermissions.GetVehicleById } },
    (request, reply) => vehicleService.getById(request.params.id) as unknown as VehicleDto,
  );

  // Create vehicle ------------------------------------------------
  app.post<CreateVehicleRouteType>(
    "/",
    { schema: CreateVehicleSchema, auth: { permission: VehicleControllerPermissions.CreateVehicle } },
    (request, reply) => vehicleService.create(request.user.id, request.body) as unknown as VehicleDto,
  );

  // Update vehicle ------------------------------------------------
  app.put<UpdateVehicleRouteType>(
    "/:id",
    { schema: UpdateVehicleSchema, auth: { permission: VehicleControllerPermissions.UpdateVehicle } },
    (request, reply) => vehicleService.update(request.params.id, request.body),
  );

  // Delete vehicle ------------------------------------------------
  app.delete<DeleteVehicleRouteType>(
    "/:id",
    { schema: DeleteVehicleSchema, auth: { permission: VehicleControllerPermissions.DeleteVehicle } },
    (request, reply) => vehicleService.deleteById(request.params.id),
  );
};
