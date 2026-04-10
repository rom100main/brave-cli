export type SafeSearchLevel = "off" | "moderate" | "strict";
export type FreshnessLevel = "day" | "week" | "month" | "year";
export type OutputFormat = "markdown" | "json";

export interface SearchConfig {
    query: string;
    maxResults: number;
    country: string | null;
    freshness: FreshnessLevel | null;
    safeSearch: SafeSearchLevel;
}

export interface SearchResult {
    title: string;
    url: string;
    description: string;
}

export interface SearchResponse {
    results: SearchResult[];
    hasMore: boolean;
}
