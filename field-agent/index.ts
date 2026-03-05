import { fetchTodaysCrimeNewsBodies } from "./services/prothom-alo";

const URLS = ["https://www.prothomalo.com", "https://www.bbc.com/bengali"];

async function main() {
    const articles = await fetchTodaysCrimeNewsBodies();
    console.log(articles);
}

main();
