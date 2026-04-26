"use client";
import { useGetCustomerVehicleServicesQuery } from "@/lib/features/vehicle/vehicle-api";

export default function CustomerVehicleServicesPage() {
  const { data } = useGetCustomerVehicleServicesQuery();
  return <div>page</div>;
}
