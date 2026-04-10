import type { SearchResult } from "../types.js";

export function formatResultsMarkdown(results: SearchResult[]): string {
    if (results.length === 0) {
        return "No results found.";
    }

    const lines = results.map((r, i) => {
        return `### ${i + 1}. ${r.title}\n\n${r.description}\n\n[${r.url}](${r.url})`;
    });

    return lines.join("\n\n---\n\n");
}
