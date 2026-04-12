import { RMQ_EXCHANGE } from './config/rmq.config';

export const generateQueueRetry = (queue: string) => `${queue}-retry`;
export const generateQueueRetryRK = (queue: string) => `${queue}-retry-rk`;
export const generateQueueDLQ = (queue: string) => `${queue}-dlq`;

export const generateQueueRetryConfig = (queueRetry: string) => ({
  exchange: RMQ_EXCHANGE,
  name: generateQueueRetry(queueRetry),
  routingKey: [generateQueueRetryRK(queueRetry)],
  options: {
    deadLetterExchange: RMQ_EXCHANGE,
    deadLetterRoutingKey: generateQueueDLQ(queueRetry),
    messageTtl: 60000,
  },
});

export const generateQueueConfig = (queueRetry: string, routingKeys: string[]) => ({
  exchange: RMQ_EXCHANGE,
  queue: queueRetry,
  routingKey: routingKeys,
  queueOptions: {
    channel: queueRetry,
    deadLetterExchange: RMQ_EXCHANGE,
    deadLetterRoutingKey: generateQueueRetryRK(queueRetry),
  },
});
