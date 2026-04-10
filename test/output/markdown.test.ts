import { describe, expect, test } from "@jest/globals";

import { formatResultsMarkdown } from "../../src/output/markdown.js";
import type { SearchResult } from "../../src/types.js";

describe("formatResultsMarkdown", () => {
    test("formats results as markdown", () => {
        const results: SearchResult[] = [
            { title: "Title 1", url: "https://example.com/1", description: "Snippet 1" },
            { title: "Title 2", url: "https://example.com/2", description: "Snippet 2" },
        ];
        const output = formatResultsMarkdown(results);
        expect(output).toContain("### 1. Title 1");
        expect(output).toContain("Snippet 1");
        expect(output).toContain("[https://example.com/1](https://example.com/1)");
        expect(output).toContain("### 2. Title 2");
        expect(output).toContain("---");
    });

    test("returns message for empty results", () => {
        const output = formatResultsMarkdown([]);
        expect(output).toBe("No results found.");
    });
});
