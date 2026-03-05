import amqp from "amqplib";

const QUEUE_NAME = "field-agent";
const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";

export interface CrimeNewsArticle {
    id: string;
    slug: string;
    url: string;
    headline: string;
    publishedAt: number;
    body: string;
}

export async function consumeFromQueue(
    handler: (article: CrimeNewsArticle) => Promise<void>,
) {
    let connection: amqp.ChannelModel | null = null;

    try {
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // process one message at a time
        channel.prefetch(1);

        console.log(`[detectives] Waiting for messages on "${QUEUE_NAME}"...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) return;

            try {
                const article: CrimeNewsArticle = JSON.parse(
                    msg.content.toString(),
                );
                await handler(article);
                channel.ack(msg);
            } catch (error) {
                console.error("[detectives] Failed to process message:", error);
                // nack without requeue to avoid poison-pill loop
                channel.nack(msg, false, false);
            }
        });

        // keep connection open — consumers are long-lived unlike producers
        connection.on("error", (err) => {
            console.error("[detectives] RabbitMQ connection error:", err.message);
        });
        connection.on("close", () => {
            console.warn("[detectives] RabbitMQ connection closed.");
        });
    } catch (error) {
        if (connection) await connection.close();
        throw new Error(
            `Failed to consume from RabbitMQ queue "${QUEUE_NAME}": ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}