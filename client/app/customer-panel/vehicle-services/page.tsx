"use client";
import { useGetCustomerVehicleServicesQuery } from "@/lib/features/vehicle/vehicle-api";

export default function CustomerPanelVehicleServicesPage() {
  const {} = useGetCustomerVehicleServicesQuery();
  return <div>page</div>;
}
