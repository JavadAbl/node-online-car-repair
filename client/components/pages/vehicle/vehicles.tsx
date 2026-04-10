"use client";
import { useGetCustomerVehiclesQuery } from "@/lib/features/vehicle/vehicle-api";

export default function Vehicles() {
  const { data } = useGetCustomerVehiclesQuery();
  console.log("data", data);

  return <div>vehicles</div>;
}
