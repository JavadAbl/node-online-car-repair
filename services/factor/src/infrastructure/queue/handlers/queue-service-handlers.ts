import Queue from "bee-queue";
import { InboxEvent } from "../../database/generated/prisma/client.js";
import { queueInboxEventHandler } from "./queue-event-inbox-handler.js";
import { serviceEntityService } from "../../../services/event-services/service-entity-service.js";

export async function queueServiceCreateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, serviceEntityService.createService);
}

export async function queueServiceUpdateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, serviceEntityService.updateService);
}
