import { rgb, ui } from "@rezi-ui/core";

import type { TuiState } from "../state.js";

const BLUE = rgb(100, 149, 237);

function wrapLines(text: string, width: number): string[] {
    if (width <= 0) return text.split("\n");

    const result: string[] = [];
    for (const line of text.split("\n")) {
        if (line.length === 0) {
            result.push("");
            continue;
        }
        let remaining = line;
        while (remaining.length > width) {
            let breakAt = width;
            const spaceIdx = remaining.lastIndexOf(" ", width);
            if (spaceIdx > 0) breakAt = spaceIdx;
            result.push(remaining.slice(0, breakAt));
            remaining = remaining.slice(breakAt).trimStart();
        }
        if (remaining.length > 0) result.push(remaining);
    }
    return result;
}

export function resultView(state: TuiState) {
    if (!state.selectedResult) {
        return ui.text("No result selected");
    }

    const cols = process.stdout.columns ?? 80;
    const lines = wrapLines(state.resultContent || "No content available.", cols);

    const content = state.resultLoading
        ? ui.spinner({ label: "Loading page..." })
        : ui.virtualList({
              id: "result-content",
              items: lines,
              itemHeight: 1,
              focusConfig: { contentStyle: { underline: false } },
              renderItem: (line: string, index: number, focused: boolean) =>
                  ui.text(line || " ", {
                      key: String(index),
                      style: focused ? { bold: true } : {},
                  }),
          });

    return ui.page({
        body: ui.focusTrap({ id: "result-trap", active: true, initialFocus: "result-content" }, [
            ui.column({ gap: 0 }, [
                ui.text(state.selectedResult.title, { style: { bold: true } }),
                ui.text(state.selectedResult.url, { style: { fg: BLUE } }),
                ui.divider(),
                content,
            ]),
        ]),
        footer: ui.statusBar({
            left: [ui.kbd("↑↓"), ui.text("scroll", { style: { dim: true } })],
            right: [
                ui.kbd("ctrl+o"),
                ui.text("browser", { style: { dim: true } }),
                ui.kbd("esc"),
                ui.text("back", { style: { dim: true } }),
            ],
        }),
    });
}
