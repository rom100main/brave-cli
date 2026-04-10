import { describe, expect, test } from "@jest/globals";

import { cleanDdgUrl } from "../../src/utils/url.js";

describe("cleanDdgUrl", () => {
    test("cleans DDG redirect URLs", () => {
        const input = "//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fpage&rut=abc123";
        expect(cleanDdgUrl(input)).toBe("https://example.com/page");
    });

    test("handles URLs without extra params", () => {
        const input = "//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com";
        expect(cleanDdgUrl(input)).toBe("https://example.com");
    });

    test("returns non-DDG URLs unchanged", () => {
        const input = "https://example.com/page";
        expect(cleanDdgUrl(input)).toBe("https://example.com/page");
    });

    test("handles malformed redirect URLs", () => {
        const input = "//duckduckgo.com/l/?uddg=";
        expect(cleanDdgUrl(input)).toBe("//duckduckgo.com/l/?uddg=");
    });

    test("handles URLs with special characters", () => {
        const input = "//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%26lang%3Den";
        expect(cleanDdgUrl(input)).toBe("https://example.com/search?q=hello&lang=en");
    });
});
