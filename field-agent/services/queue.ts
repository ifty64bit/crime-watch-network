import amqp from "amqplib";
import type { ProthomAloNewsBody } from "./prothom-alo";

const QUEUE_NAME = "field-agent";
const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";


export async function sendToQueue(message: ProthomAloNewsBody[]) {
    let connection: amqp.ChannelModel | null = null;

    try {
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        for (const item of message) {
            const ok = channel.sendToQueue(
                QUEUE_NAME,
                Buffer.from(JSON.stringify(item)),
                { persistent: true },
            );
            if (!ok) {
                throw new Error(
                    `Write buffer full, failed to queue message for "${QUEUE_NAME}"`,
                );
            }
        }

        await channel.close();
    } catch (error) {
        throw new Error(
            `Failed to send to RabbitMQ queue "${QUEUE_NAME}": ${error instanceof Error ? error.message : String(error)}`,
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}
