import { parseHTML } from "linkedom";

import type { SearchResult } from "../types.js";
import { cleanDdgUrl } from "../utils/url.js";

export function parseSearchResults(html: string): SearchResult[] {
    const { document } = parseHTML(html);
    const results: SearchResult[] = [];

    const resultElements = document.querySelectorAll(".result");
    for (const el of resultElements) {
        const titleEl = el.querySelector(".result__title a");
        if (!titleEl) continue;

        const href = titleEl.getAttribute("href") || "";
        if (href.includes("y.js")) continue; // is a tracking script

        const title = titleEl.textContent?.trim() || "";
        const url = cleanDdgUrl(href);
        const snippetEl = el.querySelector(".result__snippet");
        const snippet = snippetEl?.textContent?.trim() || "";

        if (title && url) {
            results.push({ title, url, snippet });
        }
    }

    return results;
}

export function hasMoreResults(html: string): boolean {
    const { document } = parseHTML(html);
    const nextForm = document.querySelector(".nav-link form");
    return nextForm !== null;
}
