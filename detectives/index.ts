import { consumeFromQueue } from "./services/queue";

async function main() {
    await consumeFromQueue(async (article) => {
        console.log(article);
    });
}

main();