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

    test("decodes HTML entities", () => {
        const results: SearchResult[] = [
            {
                title: "Title &quot;with quotes&quot;",
                url: "https://example.com/1",
                description: "Snippet &amp; more &lt;stuff&gt;",
            },
        ];
        const output = formatResultsMarkdown(results);
        expect(output).toContain('Title "with quotes"');
        expect(output).toContain("Snippet & more");
    });

    test("converts HTML tags to markdown", () => {
        const results: SearchResult[] = [
            {
                title: "Title with <strong>bold</strong>",
                url: "https://example.com/1",
                description: "Snippet with <em>emphasis</em> and <a href='#'>link</a>",
            },
        ];
        const output = formatResultsMarkdown(results);
        expect(output).toContain("Title with **bold**");
        expect(output).toContain("Snippet with _emphasis_ and [link](#)");
    });

    test("handles mixed HTML entities and tags", () => {
        const results: SearchResult[] = [
            {
                title: "&quot;<strong>Important</strong>&quot; News",
                url: "https://example.com/1",
                description: "Read &nbsp;more&hellip;",
            },
        ];
        const output = formatResultsMarkdown(results);
        expect(output).toContain('"**Important**" News');
        expect(output).toContain("Read more…");
    });
});
