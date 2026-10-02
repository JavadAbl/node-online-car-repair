import { Type, Static } from "@sinclair/typebox";
import { RouteGenericInterface, FastifySchema } from "fastify";
import { IdParams, IdParamsSchema } from "../../common/id-params.schema.js";
import { PermissionDto, PermissionSchema } from "../../auth/reply/permission.schema.js";
import { StatusCodes } from "http-status-codes";

const SyncUserPermissionsBodySchema = Type.Object({
  permissionNames: Type.Array(Type.String({ description: "Permission name" }), {
    description:
      "The COMPLETE desired user-grant list for this user. Omitted grants are revoked. " +
      "Duplicates are ignored. Every name must exist in the permission catalog. " +
      "Grants already covered by the user's role are pointless but harmless.",
    maxItems: 500,
    uniqueItems: true,
  }),
});

export const SyncUserPermissionsSchema: FastifySchema = {
  params: IdParamsSchema,
  body: SyncUserPermissionsBodySchema,
  description: "Replace a user's personal permission grants with the submitted list (bulk sync)",
  tags: ["User"],
  response: { [StatusCodes.OK]: Type.Array(PermissionSchema) },
};

export type SyncUserPermissionsDto = Static<typeof SyncUserPermissionsBodySchema>;

export interface SyncUserPermissionsRouteType extends RouteGenericInterface {
  Params: IdParams;
  Body: SyncUserPermissionsDto;
  Reply: PermissionDto[];
}
