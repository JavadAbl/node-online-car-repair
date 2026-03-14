import { Type } from "@sinclair/typebox";

export const DateToString = Type.Transform(Type.Union([Type.Date(), Type.String()]))
  .Decode((value) => value) // Keep as Date internally
  .Encode((value) => value instanceof Date && value.toISOString()); // Convert to string for output
