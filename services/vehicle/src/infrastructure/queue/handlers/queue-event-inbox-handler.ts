import { InboxEvent } from "../../database/generated/prisma/client.js";
import Queue from "bee-queue";
import { prisma } from "../../database/prisma-provider.js";

export async function queueInboxEventHandler(
  job: Queue.Job<InboxEvent>,
  handlerFn: (payload: any) => Promise<any>,
) {
  const { payload, id } = job.data;
  try {
    await handlerFn(JSON.parse(payload as string));
    await prisma.inboxEvent.update({
      select: { id: true },
      where: { id },
      data: { status: "Handled", handledAt: new Date() },
    });
  } catch (error) {
    console.error(error);
    await prisma.inboxEvent.update({
      select: { id: true },
      where: { id },
      data: { status: "Error", error: error?.message },
    });
  }
}
