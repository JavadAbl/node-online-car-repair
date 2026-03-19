import { TSchema, Type } from "@sinclair/typebox";

export const OptionalNullable = <T extends TSchema>(schema: T) =>
  Type.Optional(Type.Union([schema, Type.Null()]));
