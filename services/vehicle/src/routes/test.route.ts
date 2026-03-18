import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { StatusCodes } from "http-status-codes";

export const testRoutes: FastifyPluginAsync = async (app) => {
  // Create vehicle ------------------------------------------------
  app.post("/", { schema: CreateVehicleSchema }, (request, reply) => {
    console.log(request.body);
    return null;
  });
};

const CreateVehicleBodySchema = Type.Object({
  vin: Type.String({ description: "Vehicle Identification Number" }),
});

const CreateVehicleSchema = {
  body: CreateVehicleBodySchema,
  description: "Create a vehicle entity",
  tags: ["Vehicles"],
  response: { [StatusCodes.CREATED]: Type.Null() },
};
