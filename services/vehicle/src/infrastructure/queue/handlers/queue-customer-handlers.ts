import Queue from "bee-queue";
import { InboxEvent } from "../../database/generated/prisma/client.js";
import { customerService } from "../../../services/event-services/customer-service.js";
import { queueInboxEventHandler } from "./queue-event-inbox-handler.js";

export async function queueCustomerCreateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, customerService.createCustomer);
}

export async function queueCustomerUpdateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, customerService.updateCustomer);
}
