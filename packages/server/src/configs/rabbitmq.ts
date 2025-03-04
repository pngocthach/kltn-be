import { env } from "@/utils/envConfig";
import amqplib from "amqplib";

const RABBITMQ_URL = env.RABBITMQ_URI; // Change if needed
const QUEUE_NAME = "crawl_queue";

async function connectRabbitMQ() {
  const connection = await amqplib.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return { connection, channel };
}

async function sendToQueue(channel, message) {
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
}

export { connectRabbitMQ, sendToQueue, QUEUE_NAME };
