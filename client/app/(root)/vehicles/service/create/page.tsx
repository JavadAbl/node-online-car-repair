import CreateVehicleServiceForm from "@/components/pages/vehicle-service/create-vehicle-service-form";

export default function page() {
  return (
    <>
      <CreateVehicleServiceForm vehicleId={1} services={[]} />
    </>
  );
}
