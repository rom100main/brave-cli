import { BRAVE_SEARCH_URL, FRESHNESS_MAP, SAFE_SEARCH_MAP } from "../config.js";
import type { SearchConfig, SearchResponse } from "../types.js";
import { getApiKey } from "../utils/auth.js";

interface BraveSearchResponse {
    web?: {
        results?: {
            title: string;
            url: string;
            description: string;
        }[];
        more_results_available?: boolean;
    };
}

export async function search(config: SearchConfig): Promise<SearchResponse> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API key not found. Run 'brave auth' to set up your API key.");
    }

    const params = new URLSearchParams();
    params.set("q", config.query);
    params.set("count", config.count.toString());
    params.set("safesearch", SAFE_SEARCH_MAP[config.safeSearch]);
    if (config.country) {
        params.set("country", config.country.toUpperCase());
    }
    if (config.freshness) {
        params.set("freshness", FRESHNESS_MAP[config.freshness]);
    }

    const url = `${BRAVE_SEARCH_URL}?${params.toString()}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-Subscription-Token": apiKey,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid API key. Run 'brave auth' to update your API key.");
        }
        if (response.status === 403) {
            throw new Error("API key quota exceeded or insufficient permissions.");
        }
        throw new Error(`Brave Search API returned ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as BraveSearchResponse;
    const results =
        data.web?.results
            ?.filter((r) => r.title && r.url)
            .map(({ title, url, description }) => ({ title, url, description })) ?? [];
    const hasMore = data.web?.more_results_available ?? false;

    return { results, hasMore };
}
