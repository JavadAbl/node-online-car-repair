import Queue from "bee-queue";
import { InboxEvent } from "../../database/generated/prisma/client.js";
import { queueInboxEventHandler } from "./queue-event-inbox-handler.js";
import { authService } from "../../auth/auth.service.js";

export async function queueRolePermissionCreateHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, authService.createRolePermission);
}

export async function queueRolePermissionDeleteHandler(job: Queue.Job<InboxEvent>) {
  queueInboxEventHandler(job, authService.deleteRolePermission);
}
