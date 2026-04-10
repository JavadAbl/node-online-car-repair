import { useApi } from "@/lib/hooks/use-api";
import { getCustomerVehiclesAction } from "@/lib/features/vehicle/actions/get-customer-vehicles.action";

export default function Test() {
  const { data } = useApi(() => getCustomerVehiclesAction());
  return <div>T</div>;
}
