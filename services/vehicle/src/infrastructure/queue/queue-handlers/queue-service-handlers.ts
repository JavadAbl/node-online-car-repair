import Queue from "bee-queue";
import { InboxEvent } from "../../database/generated/prisma/client.js";
import { serviceService } from "../../../services/event-services/service-service.js";
import { queueInboxEventHandler } from "./queue-event-inbox-handler.js";

export async function queueServiceCreateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, serviceService.createService);
}

export async function queueServiceUpdateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, serviceService.updateService);
}
