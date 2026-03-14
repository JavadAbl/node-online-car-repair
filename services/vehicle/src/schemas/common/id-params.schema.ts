import { Type, Static } from "@sinclair/typebox";

export const IdParamsSchema = Type.Object({ id: Type.Integer({ description: "Entity Id" }) });

export type IdParams = Static<typeof IdParamsSchema>;
