import { Type } from "@sinclair/typebox";
import { RouteGenericInterface } from "fastify";
import { StatusCodes } from "http-status-codes";
import { GetManyQuerySchema, GetManyQuery } from "../../common/get-many-request.schema.js";
import { VehicleDtoSchema, VehicleDto } from "../reply/vehicle.schema.js";
import { GetManyReply, GetManyReplySchema } from "../../common/get-many-reply.schema.js";

export const GetVehiclesSchema = {
  Querystring: GetManyQuerySchema,
  description: "Get multiple vehicles with pagination, sorting, and searching",
  tags: ["Vehicles"],
  response: { [StatusCodes.OK]: GetManyReplySchema(VehicleDtoSchema) },
};

export interface GetVehiclesRouteType extends RouteGenericInterface {
  Querystring: GetManyQuery<"Vehicle">;
  Reply: GetManyReply<VehicleDto>;
}
