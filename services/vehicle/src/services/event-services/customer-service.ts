import { CustomerRepository } from "../../infrastructure/database/Repository/customer.repository.js";
import { CreateCustomer, UpdateCustomer } from "../../types/event-types/customer-types.js";

const customerRep = new CustomerRepository();

async function createCustomer(payload: CreateCustomer) {
  const { id } = payload;
  await customerRep.checkDuplicateBy({ select: { id: true }, where: { id } }, "id", id);
  return await customerRep.create({ select: { id: true }, data: payload });
}

async function updateCustomer(payload: UpdateCustomer) {
  const { id } = payload;
  await customerRep.findAndCheckExistsBy({ select: { id: true }, where: { id } }, "id", id);
  delete payload.id;
  return await customerRep.update({ select: { id: true }, where: { id }, data: payload });
}

export const customerService = { createCustomer, updateCustomer };
