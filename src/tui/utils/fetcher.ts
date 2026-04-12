import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

export async function fetchPageContent(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const { document } = parseHTML(html);
    const result = await Defuddle(document, url, { markdown: true });

    return result.content ?? "No content extracted.";
}
