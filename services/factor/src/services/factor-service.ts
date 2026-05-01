import { StatusCodes } from "http-status-codes";
import { FactorItem, ServiceReference } from "../infrastructure/database/generated/prisma/client.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { CreateFactor } from "../schemas/factor/request/create-factor-schema.js";
import { UpdateFactor } from "../schemas/factor/request/update-factor-schema.js";
import { AppError, NotFoundError } from "../utils/app.error.js";
import { generateFactorNumber, percentOf } from "../utils/app.utils.js";
import { FactorDto } from "../schemas/factor/response/factor.schema.js";
import { serviceRep } from "../infrastructure/database/Repository/service.repository.js";
import { factorRep } from "../infrastructure/database/Repository/factor.repository.js";
import { GetManyReply } from "../schemas/common/get-many-reply.schema.js";
import { buildFindManyArgs } from "../utils/prisma.util.js";
import { customerRep } from "../infrastructure/database/Repository/customer.repository.js";

function getMany(query: GetManyQuery<"Factor">): Promise<GetManyReply<FactorDto>> {
  const predicate = buildFindManyArgs(query, { searchableFields: ["factorNumber"] });
  return factorRep.findMany(predicate);
}

async function getById(id: number): Promise<FactorDto> {
  const factor = await factorRep.findUnique({
    where: { id },
    include: { items: { omit: { factorId: true }, include: { service: { select: { name: true } } } } },
  });
  if (!factor) throw new NotFoundError("Factor", "id", id);
  return factor;
}

async function create(payload: CreateFactor) {
  const { customerId, items, description } = payload;

  await customerRep.findAndCheckExistsBy({ where: { id: customerId } }, "id", customerId);
  // Extract service IDs and validate
  const serviceIds = items.map((item) => item.serviceId);
  const serviceMap = await validateAndMapServices(serviceIds);

  // Calculate items and total price
  const {
    itemsData: factorItemsData,
    totalPrice: factorTotalPrice,
    totalDiscount,
  } = calculateFactorItems(items, serviceMap);

  // Create Factor and Items in a single transaction
  const factor = await factorRep.create({
    data: {
      factorNumber: generateFactorNumber(),
      customerId,
      totalDiscount,
      description,
      totalPrice: factorTotalPrice,
      items: { createMany: { data: factorItemsData } },
    },
  });

  return factor;
}

async function update(id: number, payload: UpdateFactor) {
  const { customerId, items, description } = payload;

  // Check if factor exists
  const existingFactor = await factorRep.findUnique({ where: { id }, include: { items: true } });

  if (!existingFactor) throw new NotFoundError("Factor", "id", id);

  // If items are being updated, process them
  if (items && items.length > 0) {
    // Extract service IDs and validate
    const serviceIds = items.map((item) => item.serviceId);
    const serviceMap = await validateAndMapServices(serviceIds);

    // Calculate new items and total price
    const { itemsData: factorItemsData, totalPrice: factorTotalPrice } = calculateFactorItems(
      items,
      serviceMap,
    );

    // Update factor with new items in a transaction
    const result = await factorRep.prismaClient.$transaction(async (tx) => {
      // Delete all existing items
      await tx.factorItem.deleteMany({ where: { factorId: id } });

      // Update the factor and create new items
      const updatedFactor = await tx.factor.update({
        where: { id },
        data: {
          customerId: customerId ?? existingFactor.customerId,
          description: description ?? existingFactor.description,
          totalPrice: factorTotalPrice,
          items: { createMany: { data: factorItemsData } },
        },
        include: { items: true },
      });

      return updatedFactor;
    });

    return result;
  } else {
    // If no items provided, just update basic factor info
    const updateData: any = {};

    if (customerId !== undefined) {
      updateData.customerId = customerId;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    const updatedFactor = await factorRep.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return updatedFactor;
  }
}

async function deleteById(id: number) {
  const factor = await factorRep.findUnique({ where: { id }, select: { id: true } });
  if (!factor) throw new NotFoundError("Factor", "id", id);
  await factorRep.remove({ where: { id } });
}

export const factorService = { getMany, getById, create, update, deleteById };

// Shared helper functions--------------------------------------------------------------
async function validateAndMapServices(serviceIds: number[]): Promise<Map<number, ServiceReference>> {
  const servicesRes = await serviceRep.findMany({ where: { id: { in: serviceIds } } });
  const services = servicesRes.items;

  if (services.length !== serviceIds.length) {
    // Find missing service IDs
    const foundIds = new Set(services.map((s) => s.id));
    const missingIds = serviceIds.filter((id) => !foundIds.has(id));
    throw new AppError(`Services with IDs ${missingIds.join(", ")} not found`, StatusCodes.NOT_FOUND);
  }

  return new Map<number, ServiceReference>(services.map((s) => [s.id, s]));
}

function calculateFactorItems(
  items: Array<{ serviceId: number; quantity: number; description: string | null }>,
  serviceMap: Map<number, ServiceReference>,
): { itemsData: FactorItem[]; totalPrice: number; totalDiscount: number } {
  let factorTotalPrice = 0;
  let factorTotalDiscount = 0;

  const factorItemsData = items.map((item) => {
    const service = serviceMap.get(item.serviceId);

    if (!service) throw new NotFoundError("Service", "id", item.serviceId);

    const itemTotalPrice = service.price * item.quantity;
    const itemTotalDiscount = percentOf(service.price, service.discountPercent) * item.quantity;
    factorTotalPrice += itemTotalPrice;
    factorTotalDiscount += itemTotalDiscount;

    return {
      quantity: item.quantity,
      description: item.description,
      serviceId: item.serviceId,
      unitPrice: service.price,
      totalPrice: itemTotalPrice,
    } as FactorItem;
  });

  return { itemsData: factorItemsData, totalPrice: factorTotalPrice, totalDiscount: factorTotalDiscount };
}
