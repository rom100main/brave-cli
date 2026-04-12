import { rgb, ui } from "@rezi-ui/core";

import type { TuiState } from "../state.js";

const BLUE = rgb(100, 149, 237);

export function resultView(state: TuiState) {
    if (!state.selectedResult) {
        return ui.text("No result selected");
    }

    const lines = (state.resultContent || "No content available.").split("\n");

    const content = state.resultLoading
        ? ui.spinner({ label: "Loading page..." })
        : ui.virtualList({
              id: "result-content",
              items: lines,
              itemHeight: 1,
              renderItem: (line: string, index: number, focused: boolean) =>
                  ui.text(line || " ", {
                      key: String(index),
                      style: focused ? { bold: true } : {},
                  }),
          });

    return ui.page({
        body: ui.column({ gap: 0 }, [
            ui.text(state.selectedResult.title, { style: { bold: true } }),
            ui.text(state.selectedResult.url, { style: { fg: BLUE } }),
            ui.divider(),
            content,
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
