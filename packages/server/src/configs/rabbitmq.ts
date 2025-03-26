import { env } from "@/utils/envConfig";
import amqplib, { Channel, Connection } from "amqplib";

const RABBITMQ_URL = env.RABBITMQ_URI;

export const QUEUES = {
  CRAWL_SCHOLAR: "crawl_scholar_queue",
  CRAWL_SCOPUS: "crawl_scopus_queue",
  // Add other queues here
} as const;

interface QueueMessage {
  jobId: string;
  [key: string]: any;
}

class RabbitMQService {
  private static instance: RabbitMQService;
  private connection: Connection | null = null;
  private channels: Map<string, Channel> = new Map();

  private constructor() {}

  static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
    }
    return RabbitMQService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.connection = await amqplib.connect(RABBITMQ_URL);
      console.log("RabbitMQ connected successfully");

      // Setup all queues
      for (const queueName of Object.values(QUEUES)) {
        const channel = await this.connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        this.channels.set(queueName, channel);
      }

      // Handle connection errors
      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        this.handleConnectionError();
      });

      this.connection.on("close", () => {
        console.error("RabbitMQ connection closed");
        this.handleConnectionError();
      });
    } catch (error) {
      console.error("Failed to initialize RabbitMQ:", error);
      throw error;
    }
  }

  private async handleConnectionError(): Promise<void> {
    this.connection = null;
    this.channels.clear();
    console.log("Attempting to reconnect to RabbitMQ in 5 seconds...");
    setTimeout(() => {
      this.initialize().catch(console.error);
    }, 5000);
  }

  getChannel(queueName: string): Channel {
    const channel = this.channels.get(queueName);
    if (!channel) {
      throw new Error(`Channel for queue ${queueName} not found`);
    }
    return channel;
  }

  async sendToQueue(queueName: string, message: QueueMessage): Promise<void> {
    try {
      const channel = this.getChannel(queueName);
      await channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      console.error(`Error sending message to queue ${queueName}:`, error);
      throw error;
    }
  }

  async consumeQueue(
    queueName: string,
    callback: (message: QueueMessage) => Promise<void>
  ): Promise<void> {
    try {
      const channel = this.getChannel(queueName);
      await channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
          const message = JSON.parse(msg.content.toString());
          await callback(message);
          channel.ack(msg);
        } catch (error) {
          console.error(`Error processing message from ${queueName}:`, error);
          // Negative acknowledge the message
          channel.nack(msg, false, false);
        }
      });
    } catch (error) {
      console.error(`Error setting up consumer for ${queueName}:`, error);
      throw error;
    }
  }

  async closeConnection(): Promise<void> {
    for (const channel of this.channels.values()) {
      await channel.close();
    }
    this.channels.clear();
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}

// Export singleton instance
export const rabbitMQ = RabbitMQService.getInstance();
