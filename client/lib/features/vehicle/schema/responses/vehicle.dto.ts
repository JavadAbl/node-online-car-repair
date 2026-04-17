import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  VEHICLE_STATUS,
} from "../../vehicle-enums";

export interface VehicleDto {
  id: number;
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  fuelType: FUEL_TYPES | null;
  transmission: TRANSMISSION_TYPES | null;
  engine: string | null;
  color: string | null;
  mileage: number | null;
  licensePlate: string | null;
  state: string | null;
  customerId: number;
  status: VEHICLE_STATUS;
  createdAt: string;
  updatedAt: string | null;
}
