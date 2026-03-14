import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';

export async function apiConsumer(
  inboxRep: InboxEventRepository,
  queue: string,
  routingKey: string,
  serviceName: string,
  payload: string,
) {
  try {
    await inboxRep.create({ data: { payload, routingKey, serviceName, queue } });
  } catch (error) {
    console.error(error);
  }
}
