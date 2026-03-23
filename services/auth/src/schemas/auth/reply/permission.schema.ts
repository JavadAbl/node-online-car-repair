import { Type, Static } from "@sinclair/typebox";

export const PermissionSchema = Type.Object({ name: Type.String({ description: "Permission" }) });

export type PermissionDto = Static<typeof PermissionSchema>;
