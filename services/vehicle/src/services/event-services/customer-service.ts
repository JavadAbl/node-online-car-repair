import { CustomerRepository } from "../../infrastructure/database/Repository/customer.repository.js";
import { CreateCustomer } from "../../schemas/event-schemas/customer/create-customer.schema.js";
import { UpdateCustomer } from "../../schemas/event-schemas/customer/update-customer.schema.js";

const customerRep = new CustomerRepository();

async function createCustomer(payload: CreateCustomer) {
  const { id } = payload;
  await customerRep.checkDuplicateBy({ select: { id: true }, where: { id } }, "id", id);
  return await customerRep.create({ select: { id: true }, data: payload });
}

async function updateCustomer(payload: UpdateCustomer) {
  const { id, ...body } = payload;
  await customerRep.findAndCheckExistsBy({ select: { id: true }, where: { id } }, "id", id);
  return await customerRep.update({ select: { id: true }, where: { id }, data: body });
}

export const customerService = { createCustomer, updateCustomer };
