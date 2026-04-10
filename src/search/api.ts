import { DDG_SEARCH_URL, DF_MAP, RESULTS_PER_PAGE, SAFE_SEARCH_MAP, USER_AGENT } from "../config.js";
import type { SearchConfig, SearchResponse } from "../types.js";

import { hasMoreResults, parseSearchResults } from "./parser.js";

async function fetchPage(config: SearchConfig, page: number): Promise<{ html: string; hasMore: boolean }> {
    const offset = page * RESULTS_PER_PAGE;
    const params = new URLSearchParams();
    params.set("q", config.query);
    params.set("b", "");

    if (config.region) {
        params.set("kl", config.region);
    }

    params.set("kp", SAFE_SEARCH_MAP[config.safeSearch]);

    if (config.df) {
        params.set("df", DF_MAP[config.df]);
    }

    if (page > 0) {
        params.set("s", offset.toString());
        params.set("dc", (offset + 1).toString());
        params.set("v", "l");
        params.set("o", "json");
        params.set("api", "/d.js");
    }

    const response = await fetch(DDG_SEARCH_URL, {
        method: "POST",
        headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error(`DuckDuckGo returned ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const hasMore = hasMoreResults(html);

    return { html, hasMore };
}

export async function search(config: SearchConfig): Promise<SearchResponse> {
    let allResults: SearchResponse["results"] = [];
    let page = 0;
    let hasMore = true;

    while (allResults.length < config.maxResults && hasMore) {
        const { html, hasMore: more } = await fetchPage(config, page);
        const results = parseSearchResults(html);
        allResults.push(...results);
        hasMore = more;
        page++;
    }

    return {
        results: allResults.slice(0, config.maxResults),
        hasMore: allResults.length >= config.maxResults ? hasMore : false,
    };
}
