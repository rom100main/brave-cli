import { ui } from "@rezi-ui/core";

import { BLUE } from "../colors.js";
import { parseAndWrapMarkdown, type MdToken } from "../markdown.js";
import type { TuiState } from "../state.js";

export function resultView(state: TuiState) {
    if (!state.selectedResult) {
        return ui.text("No result selected");
    }

    const cols = process.stdout.columns ?? 80;
    const lines = parseAndWrapMarkdown(state.resultContent || "No content available.", cols);

    const content = state.resultLoading
        ? ui.spinner({ label: "Loading page..." })
        : ui.virtualList({
              id: "result-content",
              items: lines,
              itemHeight: 1,
              focusConfig: { contentStyle: { underline: false } },
              renderItem: (tokens: MdToken[], index: number, focused: boolean) =>
                  ui.row(
                      { gap: 0, key: String(index) },
                      tokens.map((t, i) =>
                          ui.text(t.text || " ", {
                              key: `t-${i}`,
                              style: focused ? { ...t.style, bold: true } : t.style,
                          }),
                      ),
                  ),
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
