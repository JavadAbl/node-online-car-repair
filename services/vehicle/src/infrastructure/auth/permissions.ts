// Permission name constants used by route definitions (single source of truth
// for this service's action-level permissions; the full registry including
// controller/service levels is derived from these at startup).

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
  GetVehicleServicesByVehicleId: VehicleServiceController + ".GetVehicleServicesByVehicleId",
  GetVehicleServiceById: VehicleServiceController + ".GetVehicleServiceById",
  CreateVehicleService: VehicleServiceController + ".CreateVehicleService",
  UpdateVehicleService: VehicleServiceController + ".UpdateVehicleService",
  DeleteVehicleService: VehicleServiceController + ".DeleteVehicleService",
};
