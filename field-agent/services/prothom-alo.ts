import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import type {
    CollectionItem,
    ProthomAloCollectionResponse,
} from "./prothom-alo.type";

const BASE_URL = "https://www.prothomalo.com";
const COLLECTION_API = `${BASE_URL}/api/v1/collections/crime-bangladesh`;
const PAGE_LIMIT = 10;
const LAST_24_HOURS_MS = 24 * 60 * 60 * 1000;

export interface ProthomAloNewsBody {
    id: string;
    slug: string;
    url: string;
    headline: string;
    publishedAt: number;
    body: string;
}

function getPublishedAt(item: CollectionItem): number | null {
    const publishedAt = item.story["published-at"];
    const firstPublishedAt = item.story["first-published-at"];

    if (typeof publishedAt === "number") {
        return publishedAt;
    }

    if (typeof firstPublishedAt === "number") {
        return firstPublishedAt;
    }

    return null;
}

function getHeadline(item: CollectionItem): string {
    const fromStory = Array.isArray(item.story.headline)
        ? item.story.headline.join(" ")
        : "";
    const fromItem = Array.isArray(item.item.headline)
        ? item.item.headline.join(" ")
        : "";

    return (fromStory || fromItem).trim();
}

function extractFallbackBody(html: string): string {
    const $ = cheerio.load(html);
    const selectors = [
        "article p",
        "[data-testid='story-element-text'] p",
        ".story-element-text p",
        ".story-elements p",
        "main p",
    ];

    for (const selector of selectors) {
        const text = $(selector)
            .map((_, el) => $(el).text().trim())
            .get()
            .filter(Boolean)
            .join("\n\n")
            .trim();

        if (text) {
            return text;
        }
    }

    return "";
}

function extractBodyWithReadability(html: string, url: string): string {
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, svg").remove();

    const cleanedHtml = $.html();
    const dom = new JSDOM(cleanedHtml, { url });
    const article = new Readability(dom.window.document).parse();

    const readableText = article?.textContent?.trim() ?? "";
    if (readableText) {
        return readableText;
    }

    return extractFallbackBody(cleanedHtml);
}

function getArticleUrl(item: CollectionItem): string | null {
    if (typeof item.story.url === "string" && item.story.url.trim()) {
        return item.story.url;
    }

    if (typeof item.story.slug === "string" && item.story.slug.trim()) {
        return `${BASE_URL}/${item.story.slug.replace(/^\/+/, "")}`;
    }

    return null;
}

async function fetchCrimeNewsPage(
    offset: number,
    limit: number = PAGE_LIMIT,
): Promise<ProthomAloCollectionResponse> {
    const url = `${COLLECTION_API}?limit=${limit}&offset=${offset}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch collection page: ${response.status}`);
    }

    const data = (await response.json()) as ProthomAloCollectionResponse;
    return data;
}

export async function fetchTodaysCrimeNewsItems(): Promise<CollectionItem[]> {
    const now = Date.now();
    const windowStart = now - LAST_24_HOURS_MS;
    const recentItems: CollectionItem[] = [];

    let offset = 0;
    let reachedOlderNews = false;

    while (!reachedOlderNews) {
        const pageData = await fetchCrimeNewsPage(offset);
        if (!Array.isArray(pageData.items) || pageData.items.length === 0) {
            break;
        }

        for (const item of pageData.items) {
            const publishedAt = getPublishedAt(item);
            if (publishedAt === null) {
                continue;
            }

            if (publishedAt >= windowStart && publishedAt <= now) {
                recentItems.push(item);
                continue;
            }

            if (publishedAt < windowStart) {
                reachedOlderNews = true;
                break;
            }
        }

        offset += PAGE_LIMIT;
    }

    return recentItems;
}

export async function fetchTodaysCrimeNewsBodies(): Promise<
    ProthomAloNewsBody[]
> {
    const todaysItems = await fetchTodaysCrimeNewsItems();

    console.log(
        `Prothom Alo: Found ${todaysItems.length} crime news items in last 24 hours.`,
    );

    const articles = await Promise.all(
        todaysItems.map(async (item): Promise<ProthomAloNewsBody | null> => {
            const url = getArticleUrl(item);
            const publishedAt = getPublishedAt(item);

            if (!url || publishedAt === null) {
                return null;
            }

            const response = await fetch(url);
            if (!response.ok) {
                return null;
            }

            const html = await response.text();
            const body = extractBodyWithReadability(html, url);

            if (!body) {
                return null;
            }

            return {
                id: item.id,
                slug:
                    item.story.slug ??
                    new URL(url).pathname.replace(/^\/+/, ""),
                url,
                headline: getHeadline(item),
                publishedAt,
                body,
            };
        }),
    );

    return articles.filter((article): article is ProthomAloNewsBody => {
        return article !== null;
    });
}
