import { FastifySchema, RouteGenericInterface } from "fastify";
import { VehicleServiceDto, VehicleServiceDtoSchema } from "../reply/vehicle-service.schema.js";
import { StatusCodes } from "http-status-codes";
import { GetManyReply, GetManyReplySchema } from "../../common/get-many-reply.schema.js";
import { GetManyQuery, GetManyQuerySchema } from "../../common/get-many-request.schema.js";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";

export const GetVehicleServicesByVehicleIdSchema: FastifySchema = {
  querystring: GetManyQuerySchema,
  params: IdParamsSchema,
  tags: ["VehicleService"],
  response: { [StatusCodes.OK]: GetManyReplySchema(VehicleServiceDtoSchema) },
};

export interface GetVehicleServicesByVehicleIdRouteType extends RouteGenericInterface {
  Querystring: GetManyQuery<"VehicleService">;
  Params: IdParams;
  Reply: GetManyReply<VehicleServiceDto>;
}
