import { ui } from "@rezi-ui/core";

import { BLUE } from "../colors.js";
import { parseAndWrapMarkdown, type MdToken } from "../markdown.js";
import type { TuiState } from "../state.js";

function applyCursor(tokens: MdToken[], cursorX: number): MdToken[] {
    let currentX = 0;
    const result: MdToken[] = [];
    let cursorApplied = false;

    for (const token of tokens) {
        if (cursorApplied) {
            result.push(token);
            continue;
        }

        const len = token.text.length;
        if (currentX + len > cursorX) {
            const charIndex = cursorX - currentX;
            const before = token.text.slice(0, charIndex);
            const char = token.text[charIndex];
            const after = token.text.slice(charIndex + 1);

            if (before) result.push({ text: before, style: token.style });
            result.push({ text: char, style: { ...token.style, inverse: true } });
            if (after) result.push({ text: after, style: token.style });

            cursorApplied = true;
        } else {
            result.push(token);
            currentX += len;
        }
    }

    if (!cursorApplied) {
        const padLen = cursorX - currentX;
        if (padLen > 0) {
            result.push({ text: " ".repeat(padLen), style: {} });
        }
        result.push({ text: " ", style: { inverse: true } });
    }

    return result;
}

export interface ResultViewCallbacks {
    openLink: (href: string) => void;
}

export function resultView(state: TuiState, callbacks: ResultViewCallbacks) {
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
              renderItem: (tokens: MdToken[], index: number, focused: boolean) => {
                  const displayTokens = focused ? applyCursor(tokens, state.resultCursorX) : tokens;
                  return ui.row(
                      { gap: 0, key: String(index) },
                      displayTokens.map((t, i) =>
                          ui.text(t.text || " ", {
                              key: `t-${i}`,
                              style: focused ? { ...t.style, bold: true } : t.style,
                          }),
                      ),
                  );
              },
              onSelect: (tokens: MdToken[]) => {
                  let currentX = 0;
                  for (const token of tokens) {
                      const len = token.text.length;
                      if (currentX + len > state.resultCursorX) {
                          if (token.href) {
                              callbacks.openLink(token.href);
                          }
                          return;
                      }
                      currentX += len;
                  }
              },
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
                ui.kbd("enter"),
                ui.text("open link", { style: { dim: true } }),
                ui.kbd("ctrl+o"),
                ui.text("browser", { style: { dim: true } }),
                ui.kbd("ctrl+h"),
                ui.text("home", { style: { dim: true } }),
                ui.kbd("esc"),
                ui.text("back", { style: { dim: true } }),
            ],
        }),
    });
}
