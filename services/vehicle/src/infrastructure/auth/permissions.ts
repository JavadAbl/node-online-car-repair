import { PermissionType } from "../database/generated/prisma/enums.js";

export const SERVICE_PERMISSION = "vehicle" as const;

//Vehicle Controller
const VehicleController = `${SERVICE_PERMISSION}.VehicleController`;
export const VehicleControllerPermissions = {
  GetAllVehicles: VehicleController + ".GetAllVehicles",
  GetCustomerVehicles: VehicleController + ".GetCustomerVehicles",
  GetVehicleById: VehicleController + ".GetVehicleById",
  CreateVehicle: VehicleController + ".CreateVehicle",
  UpdateVehicle: VehicleController + ".UpdateVehicle",
  DeleteVehicle: VehicleController + ".DeleteVehicle",
};

//VehicleService Controller
const VehicleServiceController = `${SERVICE_PERMISSION}.VehicleServiceController`;
export const VehicleServiceControllerPermissions = {
  GetAllVehicleServices: VehicleServiceController + ".GetAllVehicleServices",
  GetVehicleServiceById: VehicleServiceController + ".GetVehicleServiceById",
  CreateVehicleService: VehicleServiceController + ".CreateVehicleService",
  UpdateVehicleService: VehicleServiceController + ".UpdateVehicleService",
  DeleteVehicleService: VehicleServiceController + ".DeleteVehicleService",
};

export const APP_PERMISSIONS: { name: string; type: PermissionType }[] = [
  { type: PermissionType.Service, name: SERVICE_PERMISSION },

  { type: PermissionType.Controller, name: VehicleController },
  { type: PermissionType.Action, name: VehicleControllerPermissions.GetAllVehicles },
  { type: PermissionType.Action, name: VehicleControllerPermissions.GetCustomerVehicles },
  { type: PermissionType.Action, name: VehicleControllerPermissions.GetVehicleById },
  { type: PermissionType.Action, name: VehicleControllerPermissions.CreateVehicle },
  { type: PermissionType.Action, name: VehicleControllerPermissions.UpdateVehicle },
  { type: PermissionType.Action, name: VehicleControllerPermissions.DeleteVehicle },

  { type: PermissionType.Controller, name: VehicleServiceController },
  { type: PermissionType.Action, name: VehicleServiceControllerPermissions.GetAllVehicleServices },
  { type: PermissionType.Action, name: VehicleServiceControllerPermissions.GetVehicleServiceById },
  { type: PermissionType.Action, name: VehicleServiceControllerPermissions.CreateVehicleService },
  { type: PermissionType.Action, name: VehicleServiceControllerPermissions.UpdateVehicleService },
  { type: PermissionType.Action, name: VehicleServiceControllerPermissions.DeleteVehicleService },
] as const;
