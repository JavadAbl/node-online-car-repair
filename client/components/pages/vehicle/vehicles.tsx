"use client";
import { useApi } from "@/lib/hooks/use-api";
import { getCustomerVehiclesAction } from "@/lib/features/vehicle/actions/get-customer-vehicles.action";
import Test from "./test";

export default function Vehicles() {
  const { data } = useApi(() => getCustomerVehiclesAction());
  console.log(data);

  return (
    <div>
      vehicles
      {/* <Test /> */}
    </div>
  );
}
