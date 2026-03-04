import { fetch } from "bun";
import * as cheerio from 'cheerio';

const URLS = ["https://www.prothomalo.com", "https://www.bbc.com/bengali"]

async function loadURL(url: string) {
    const response = await fetch(url);
    const page = await response.text();
    const $ = cheerio.load(page);
    const links = $("a");
    
    return links;
}

async function main() {
    for (const url of URLS) {
        const links = await loadURL(url);
        console.log(links.text()+"\n");
    }
}

main();