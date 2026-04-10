import { describe, expect, test } from "@jest/globals";

import { parseSearchResults, hasMoreResults } from "../../src/search/parser.js";

const SAMPLE_HTML = `
<html><body>
<div class="result">
    <h2 class="result__title"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2F1">Result One</a></h2>
    <div class="result__snippet">This is snippet one.</div>
</div>
<div class="result">
    <h2 class="result__title"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2F2">Result Two</a></h2>
    <div class="result__snippet">This is snippet two.</div>
</div>
<div class="result">
    <h2 class="result__title"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fads.example.com%2Fy.js%3Fad">Ad Result</a></h2>
    <div class="result__snippet">This is an ad.</div>
</div>
</body></html>
`;

describe("parseSearchResults", () => {
    test("parses search results from HTML", () => {
        const results = parseSearchResults(SAMPLE_HTML);
        expect(results).toHaveLength(2);
        expect(results[0].title).toBe("Result One");
        expect(results[0].url).toBe("https://example.com/1");
        expect(results[0].snippet).toBe("This is snippet one.");
        expect(results[1].title).toBe("Result Two");
        expect(results[1].url).toBe("https://example.com/2");
    });

    test("filters out ads containing y.js", () => {
        const results = parseSearchResults(SAMPLE_HTML);
        expect(results.find((r) => r.title === "Ad Result")).toBeUndefined();
    });

    test("returns empty array for no results", () => {
        const results = parseSearchResults("<html><body></body></html>");
        expect(results).toHaveLength(0);
    });
});

describe("hasMoreResults", () => {
    test("returns true when nav-link form exists", () => {
        const html = '<html><body><div class="nav-link"><form><input name="s" value="30"/></form></div></body></html>';
        expect(hasMoreResults(html)).toBe(true);
    });

    test("returns false when no nav-link form", () => {
        const html = "<html><body><div>no pagination</div></body></html>";
        expect(hasMoreResults(html)).toBe(false);
    });
});
