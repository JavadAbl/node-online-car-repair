import Queue from "bee-queue";
import { InboxEvent } from "../../database/generated/prisma/client.js";
import { queueInboxEventHandler } from "./queue-event-inbox-handler.js";
import { technicianService } from "../../../services/event-services/technician-service.js";

export async function queueTechnicianCreateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, technicianService.createTechnician);
}

export async function queueTechnicianUpdateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, technicianService.updateTechnician);
}
