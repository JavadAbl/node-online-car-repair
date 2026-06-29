import { config } from "../config.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Prisma, PrismaClient } from "./generated/prisma/client.js";

const prismaAdapter = new PrismaMariaDb({
  ssl: false,
  host: config.DATABASE_HOST,
  user: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  port: config.DATABASE_PORT,
  allowPublicKeyRetrieval: true,
});

export const prisma = new PrismaClient({ adapter: prismaAdapter });

export async function startDatabase() {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  console.log("Connected to database");
}

/* const softDeleteModel = {
  async delete({ args, query }) {
    return query({ ...args, data: { isDeleted: true } });
  },
  async findMany({ args, query }) {
    args.where = { ...args.where, isDeleted: false };
    return query(args);
  },
  async findFirst({ args, query }) {
    args.where = { ...args.where, isDeleted: false };
    return query(args);
  },
  async findUnique({ args, query }) {
    args.where = { ...args.where, isDeleted: false };
    return query(args);
  },
};

prisma.$extends(
  Prisma.defineExtension({ query: { vehicle: softDeleteModel, vehicleService: softDeleteModel } }),
);
 */
