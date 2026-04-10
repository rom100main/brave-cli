import { describe, expect, test } from "@jest/globals";

import { formatResultsJson } from "../../src/output/json.js";
import type { SearchResult } from "../../src/types.js";

describe("formatResultsJson", () => {
    test("formats results as JSON", () => {
        const results: SearchResult[] = [
            { title: "Title 1", url: "https://example.com/1", snippet: "Snippet 1" },
            { title: "Title 2", url: "https://example.com/2", snippet: "Snippet 2" },
        ];
        const output = formatResultsJson(results);
        const parsed = JSON.parse(output);
        expect(parsed).toHaveLength(2);
        expect(parsed[0]).toEqual({ title: "Title 1", url: "https://example.com/1", snippet: "Snippet 1" });
        expect(parsed[1]).toEqual({ title: "Title 2", url: "https://example.com/2", snippet: "Snippet 2" });
    });

    test("returns empty array for empty results", () => {
        const output = formatResultsJson([]);
        const parsed = JSON.parse(output);
        expect(parsed).toEqual([]);
    });
});
