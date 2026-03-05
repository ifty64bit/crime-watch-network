import { fetchTodaysCrimeNewsBodies } from "./services/prothom-alo";
import { sendToQueue } from "./services/queue";

const URLS = ["https://www.prothomalo.com", "https://www.bbc.com/bengali"];

async function main() {
    const articles = await fetchTodaysCrimeNewsBodies();
    await sendToQueue(articles);
}

setTimeout(() => {
    main();
}, 10000);
