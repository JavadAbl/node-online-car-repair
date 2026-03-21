import { z } from "zod";

export const optionalNullable = <T extends z.ZodTypeAny>(schema: T) => schema.nullable().optional();
