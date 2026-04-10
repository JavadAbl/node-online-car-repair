"use server";

import { ApiResponse } from "@/lib/shared/base-api-server";
import { getCustomerVehiclesByContextApi } from "../vehicle.api";
import { VehicleDto } from "../vehicle.type";

export async function getCustomerVehiclesAction(): Promise<
  ApiResponse<VehicleDto[]>
> {
  const res = await getCustomerVehiclesByContextApi();
  return res;
}
