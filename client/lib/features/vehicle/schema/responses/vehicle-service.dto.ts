export interface VehicleServiceDto {
  id: number;
  serviceDate: string;
  mileageAtService: number;
  technicianName: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  vehicleId: number;
  serviceId: number;
}
