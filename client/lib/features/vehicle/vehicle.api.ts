import { httpService } from "@/lib/shared/base-api-server";
import { VehicleDto } from "./vehicle.type";

export const getCustomerVehiclesByContextApi = async () => {
  console.log("getCustomerVehiclesByContextApi");

  return httpService.get<VehicleDto[]>("vehicle-api/Vehicles/CustomerVehicles");
};
