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
  trim: string;
  fuelType: FUEL_TYPES;
  transmission: TRANSMISSION_TYPES;
  engine: string;
  color: string;
  mileage: number;
  licensePlate: string;
  state: string | null;
  customerId: number;
  status: VEHICLE_STATUS;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
