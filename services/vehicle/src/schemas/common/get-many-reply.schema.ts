import { TSchema, Type } from "@sinclair/typebox";

export interface GetManyReply<T> {
  totalCount: number;
  items: T[];
}

export const GetManyReplySchema = <T extends TSchema>(itemSchema: T) =>
  Type.Object({ totalCount: Type.Number({ minimum: 0 }), items: Type.Array(itemSchema) });
