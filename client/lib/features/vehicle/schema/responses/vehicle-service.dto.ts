import { VehicleServiceStatus } from "../../vehicle-enums";

export interface VehicleServiceDto {
  description: string | null;
  id: number;
  serviceDate: string;
  mileageAtService: number;
  status: VehicleServiceStatus;
  technicianId: number;
  technicianName: string;
  technicianNumber: string;
  vehicleModel: string;
  vehicleId: number;
  serviceId: number;
  serviceName: string;
}
