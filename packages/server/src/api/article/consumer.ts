import { connectRabbitMQ, QUEUE_NAME } from "@/configs/rabbitmq";
import { crawl } from "./crawl"; // Your crawl function
import { authorModel } from "@/api/author/author.model";
import { ObjectId } from "mongodb";

async function startConsumer(channel) {
  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const { url, authorId } = JSON.parse(msg.content.toString());
    console.log(`Processing crawl for: ${url}`);

    try {
      const articles = await crawl(url);
      const articleIds = articles.map((article) => article["_id"]);

      await authorModel.updateOne(
        { _id: new ObjectId(authorId) },
        { $addToSet: { articles: { $each: articleIds } } }
      );

      console.log(`Crawling done for ${url}`);
      channel.ack(msg);
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      channel.nack(msg, false, true); // Requeue message on failure
    }
  });

  console.log("RabbitMQ consumer started...");
}

export { startConsumer };
