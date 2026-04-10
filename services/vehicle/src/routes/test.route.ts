import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync, RouteGenericInterface } from "fastify";
import { StatusCodes } from "http-status-codes";
import { CreateVehicle } from "../schemas/vehicle/request/create-vehicle.schema.js";
import { VehicleDto } from "../schemas/vehicle/reply/vehicle.schema.js";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Value } from "@sinclair/typebox/value";

export const testRoutes: FastifyPluginAsync = async (app) => {
  app.get("/a/a/a", (request, reply) => {
    return { x: 1 };
  });

  app.get("/a", { auth: { roles: ["Admin"] } }, (request, reply) => {
    return { x: 1 };
  });

  app.post<CreateVehicleRouteType>("/", { schema: CreateVehicleSchema }, (request, reply) => {
    console.log(request.body);
    const x = { vin: "1", x: 2 };
    Value.Clean(CreateVehicleBodySchema, x);
    return x;
  });
};

const CreateVehicleBodySchema = Type.Object({
  vin: Type.String({ description: "Vehicle Identification Number" }),
});

const CreateVehicleSchema = {
  body: CreateVehicleBodySchema,
  description: "Create a vehicle entity",
  tags: ["Vehicles"],
  response: { [StatusCodes.CREATED]: CreateVehicleBodySchema },
};

interface CreateVehicleRouteType extends RouteGenericInterface {
  Body: CreateVehicle;
  Reply: VehicleDto;
}
