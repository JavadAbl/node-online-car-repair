import { Static, Type } from "@sinclair/typebox";
import { Nullable } from "../../common/nullable.schema.js";

export const VehicleServiceDtoSchema = Type.Object({
  id: Type.Integer({ description: "Unique identifier for the service history record" }),
  serviceDate: Type.String({ format: "date-time", description: "Date when the service was performed" }),
  serviceName: Type.String({ format: "date-time", description: "Name of the service" }),
  vehicleModel: Type.String({ format: "date-time", description: "Model of the Vehicle" }),
  mileageAtService: Type.Integer({ description: "Mileage of the vehicle at the time of service" }),
  description: Nullable(Type.String({ description: "Description of the service performed" })),
  vehicleId: Type.Integer({ description: "ID of the vehicle that received the service" }),
  serviceId: Type.Integer({ description: "ID of the service reference" }),
  //Technician
  technicianName: Type.String({ description: "Name of the technician who performed the service" }),
  technicianNumber: Type.String({ description: "Name of the technician who performed the service" }),
});

export type VehicleServiceDto = Static<typeof VehicleServiceDtoSchema>;
