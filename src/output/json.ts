import type { SearchResult } from "../types.js";

export function formatResultsJson(results: SearchResult[]): string {
    return JSON.stringify(results, null, 2);
}
