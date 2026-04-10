import { PermissionType } from "../database/generated/prisma/enums.js";

export const SERVICE_PERMISSION = "vehicle" as const;

//Vehicle Controller
const VehicleController = `${SERVICE_PERMISSION}.VehicleController`;
export const VehicleController_GetAllVehicles = VehicleController + ".GetAllVehicles";
export const VehicleController_GetCustomerVehicles = VehicleController + ".GetCustomerVehicles";
export const VehicleController_GetVehicleById = VehicleController + ".GetVehicleById";
export const VehicleController_CreateVehicle = VehicleController + ".CreateVehicle";
export const VehicleController_UpdateVehicle = VehicleController + ".UpdateVehicle";
export const VehicleController_DeleteVehicle = VehicleController + ".DeleteVehicle";

//VehicleService Controller
const VehicleServiceController = `${SERVICE_PERMISSION}.VehicleServiceController`;
export const VehicleServiceController_GetAllVehicleServices = VehicleController + ".GetAllVehicleServices";
export const VehicleServiceController_GetVehicleServiceById = VehicleController + ".GetVehicleServiceById";
export const VehicleServiceController_CreateVehicleService = VehicleController + ".CreateVehicleService";
export const VehicleServiceController_UpdateVehicleService = VehicleController + ".UpdateVehicleService";
export const VehicleServiceController_DeleteVehicleService = VehicleController + ".DeleteVehicleService";

export const APP_PERMISSIONS: { name: string; type: PermissionType }[] = [
  { type: PermissionType.Service, name: SERVICE_PERMISSION },

  { type: PermissionType.Controller, name: VehicleController },
  { type: PermissionType.Action, name: VehicleController_GetAllVehicles },
  { type: PermissionType.Action, name: VehicleController_GetCustomerVehicles },
  { type: PermissionType.Action, name: VehicleController_GetVehicleById },
  { type: PermissionType.Action, name: VehicleController_CreateVehicle },
  { type: PermissionType.Action, name: VehicleController_UpdateVehicle },
  { type: PermissionType.Action, name: VehicleController_DeleteVehicle },

  { type: PermissionType.Controller, name: VehicleServiceController },
  { type: PermissionType.Action, name: VehicleServiceController_GetAllVehicleServices },
  { type: PermissionType.Action, name: VehicleServiceController_GetVehicleServiceById },
  { type: PermissionType.Action, name: VehicleServiceController_CreateVehicleService },
  { type: PermissionType.Action, name: VehicleServiceController_UpdateVehicleService },
  { type: PermissionType.Action, name: VehicleServiceController_DeleteVehicleService },
] as const;
