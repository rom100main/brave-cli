import he from "he";
import { NodeHtmlMarkdown } from "node-html-markdown";

import type { SearchResult } from "../types.js";

function cleanText(text: string): string {
    const decoded = he.decode(text);
    return NodeHtmlMarkdown.translate(decoded);
}

export function formatResultsMarkdown(results: SearchResult[]): string {
    if (results.length === 0) {
        return "No results found.";
    }

    const lines = results.map((r, i) => {
        const title = cleanText(r.title);
        const description = cleanText(r.description);
        return `### ${i + 1}. ${title}\n\n${description}\n\n[${r.url}](${r.url})`;
    });

    return lines.join("\n\n---\n\n");
}
