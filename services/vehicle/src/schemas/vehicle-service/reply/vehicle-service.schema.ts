import { Static, Type } from "@sinclair/typebox";

export const VehicleServiceDtoSchema = Type.Object({
  id: Type.Integer({ description: "Unique identifier for the service history record" }),
  serviceDate: Type.String({ format: "date-time", description: "Date when the service was performed" }),
  mileageAtService: Type.Integer({ description: "Mileage of the vehicle at the time of service" }),
  technicianName: Type.String({ description: "Name of the technician who performed the service" }),
  description: Type.Optional(Type.String({ description: "Description of the service performed" })),
  createdAt: Type.String({ format: "date-time", description: "Creation timestamp" }),
  updatedAt: Type.Optional(Type.String({ format: "date-time", description: "Last update timestamp" })),
  vehicleId: Type.Integer({ description: "ID of the vehicle that received the service" }),
  serviceId: Type.Integer({ description: "ID of the service reference" }),
});

export type VehicleServiceDto = Static<typeof VehicleServiceDtoSchema>;
