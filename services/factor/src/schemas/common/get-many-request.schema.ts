import { z } from "zod";
import { Prisma } from "../../infrastructure/database/generated/prisma/client.js";

/* export type GetManyQuery = {
  page?: string | undefined;
  limit?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  search?: string | undefined;
};
 */

export type GetManyQuery<T extends keyof Prisma.TypeMap["model"]> = {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Prisma.TypeMap["model"][T]["fields"];
  sortOrder?: "asc" | "desc";
  search?: string;
};

export const GetManyQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
});
