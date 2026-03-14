import { ConflictError, NotFoundError } from "../../../utils/app-error.js";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../prisma-provider.js";

export class Repository<TModel extends keyof typeof prisma> {
  constructor(private readonly model: TModel) {}

  private get entityName(): string {
    return String(this.model);
  }

  // --- READ ---

  async findMany<TArgs extends Prisma.Args<(typeof prisma)[TModel], "findMany">>(
    args?: TArgs,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "findMany">> {
    return (prisma[this.model] as any).findMany(args);
  }

  async findUnique<TArgs extends Prisma.Args<(typeof prisma)[TModel], "findUnique">>(
    args: TArgs,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "findUnique"> | null> {
    return (prisma[this.model] as any).findUnique(args);
  }

  async findFirst<TArgs extends Prisma.Args<(typeof prisma)[TModel], "findFirst">>(
    args: TArgs,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "findFirst"> | null> {
    return (prisma[this.model] as any).findFirst(args);
  }

  async findBy<TArgs extends Prisma.Args<(typeof prisma)[TModel], "findFirst">>(
    args: TArgs,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "findFirst"> | null> {
    return this.findFirst(args);
  }

  async findAndCheckExistsBy<TArgs extends Prisma.Args<(typeof prisma)[TModel], "findFirst">>(
    args: TArgs,
    fieldName: string,
    value: unknown,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "findFirst"> | null> {
    const entity = await (prisma[this.model] as any).findFirst(args);
    if (!entity) throw new NotFoundError(this.entityName, fieldName, value);
    return entity;
  }

  async checkDuplicateBy<TArgs extends Prisma.Args<(typeof prisma)[TModel], "findFirst">>(
    args: TArgs,
    fieldName: string,
    value: unknown,
  ): Promise<void> {
    const entity = await (prisma[this.model] as any).findFirst(args);
    if (entity) throw new ConflictError(this.entityName, fieldName, value);
  }

  // --- WRITE ---

  async create<TArgs extends Prisma.Args<(typeof prisma)[TModel], "create">>(
    args: TArgs,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "create">> {
    return (prisma[this.model] as any).create(args);
  }

  async update<TArgs extends Prisma.Args<(typeof prisma)[TModel], "update">>(
    args: TArgs,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "update">> {
    return (prisma[this.model] as any).update(args);
  }

  async upsert<TArgs extends Prisma.Args<(typeof prisma)[TModel], "upsert">>(
    args: TArgs,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "upsert">> {
    return (prisma[this.model] as any).upsert(args);
  }

  // 'delete' is a reserved keyword in JS/TS, so we use 'remove' or 'deleteOne'
  async remove<TArgs extends Prisma.Args<(typeof prisma)[TModel], "delete">>(
    args: TArgs,
  ): Promise<Prisma.Result<(typeof prisma)[TModel], TArgs, "delete">> {
    return (prisma[this.model] as any).delete(args);
  }
}
