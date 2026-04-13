import { rgb, ui } from "@rezi-ui/core";
import he from "he";
import { NodeHtmlMarkdown } from "node-html-markdown";

import type { SearchResult } from "../../types.js";
import { COUNTRIES, type Country } from "../../utils/countries.js";
import type { TuiState } from "../state.js";
import { FRESHNESS_LABELS } from "../state.js";

const CYAN = rgb(0, 255, 255);
const RED = rgb(255, 0, 0);

function cleanText(text: string): string {
    const decoded = he.decode(text);
    return NodeHtmlMarkdown.translate(decoded);
}

function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 3) + "…"; // -1 for … char and -2 for virtual list
}

export function searchView(state: TuiState, callbacks: SearchViewCallbacks) {
    const filterBar = ui.row({ gap: 1 }, [
        ui.text(state.country ? `Country: ${state.country.label}` : "Country: all", { style: { dim: true } }),
        ui.text("|", { style: { dim: true } }),
        ui.text(`Freshness: ${FRESHNESS_LABELS[String(state.freshness)]}`, { style: { dim: true } }),
        ui.text("|", { style: { dim: true } }),
        ui.text(`Safe search: ${state.safeSearch}`, { style: { dim: true } }),
    ]);

    const body = state.loading
        ? ui.spinner({ label: "Searching..." })
        : state.error
          ? ui.text(`Error: ${state.error}`, { style: { fg: RED } })
          : state.results.length === 0 && state.query !== ""
            ? ui.text("No results found.", { style: { dim: true } })
            : ui.virtualList({
                  id: "results-list",
                  items: state.results,
                  itemHeight: 4,
                  focusConfig: { contentStyle: { underline: false } },
                  renderItem: (result: SearchResult, index: number, focused: boolean) =>
                      ui.column({ gap: 0 }, [
                          ui.text(focused ? `> ${result.title}` : `  ${result.title}`, {
                              key: `title-${index}`,
                              style: focused ? { bold: true, fg: CYAN } : {},
                          }),
                          ui.text(`  ${result.url}`, {
                              key: `url-${index}`,
                              style: { dim: true },
                          }),
                          ui.text(`  ${truncate(cleanText(result.description), process.stdout.columns ?? 80)}`, {
                              key: `desc-${index}`,
                              style: { dim: true },
                          }),
                      ]),
                  onSelect: (result: SearchResult) => callbacks.openResult(result),
              });

    const statusBar = ui.statusBar({
        left: [
            ui.kbd("↑↓"),
            ui.text("navigate", { style: { dim: true } }),
            ui.kbd("enter"),
            ui.text("open", { style: { dim: true } }),
            ui.kbd("ctrl+o"),
            ui.text("browser", { style: { dim: true } }),
        ],
        right: [
            ui.kbd("ctrl+r"),
            ui.text("country", { style: { dim: true } }),
            ui.kbd("ctrl+f"),
            ui.text("freshness", { style: { dim: true } }),
            ui.kbd("ctrl+s"),
            ui.text("safe search", { style: { dim: true } }),
            ui.kbd("esc"),
            ui.text("quit", { style: { dim: true } }),
        ],
    });

    return ui.layers([
        ui.page({
            body: ui.focusTrap({ id: "search-trap", active: true, initialFocus: "results-list" }, [
                ui.column({ gap: 0 }, [
                    ui.input({
                        id: "search-input",
                        value: state.query,
                        focusable: false,
                        placeholder: "Search the web...",
                        onInput: (value: string) => callbacks.onQueryChange(value),
                    }),
                    filterBar,
                    ui.divider(),
                    body,
                ]),
            ]),
            footer: statusBar,
        }),
        state.showCountryModal ? countryModal(state, callbacks) : null,
    ]);
}

function countryModal(state: TuiState, callbacks: SearchViewCallbacks) {
    const filtered = COUNTRIES.filter(
        (c) =>
            c.label.toLowerCase().includes(state.countryFilter.toLowerCase()) ||
            c.code.toLowerCase().includes(state.countryFilter.toLowerCase()),
    );

    return ui.dialog({
        id: "country-dialog",
        title: "Select Country",
        backdrop: { variant: "opaque" },
        message: ui.column({ gap: 1 }, [
            ui.text(
                state.countryFilter
                    ? `Filter: ${state.countryFilter}`
                    : "Type to filter, ↑↓ to navigate, enter to select",
                { style: { dim: true } },
            ),
            ui.virtualList({
                id: "country-list",
                items: filtered,
                itemHeight: 1,
                focusConfig: { contentStyle: {} },
                renderItem: (country: Country, index: number, focused: boolean) =>
                    ui.text(focused ? `> ${country.label} (${country.code})` : `  ${country.label} (${country.code})`, {
                        key: country.code,
                        style: focused ? { bold: true } : {},
                    }),
                onSelect: (country: Country) => callbacks.selectCountry(country),
            }),
        ]),
        actions: [
            { label: "Clear", intent: "danger", onPress: () => callbacks.clearCountry() },
            { label: "Cancel", onPress: () => callbacks.closeCountryModal() },
        ],
        onClose: () => callbacks.closeCountryModal(),
    });
}

export interface SearchViewCallbacks {
    onQueryChange: (value: string) => void;
    performSearch: () => void;
    openResult: (result: SearchResult) => void;
    onCountryFilterChange: (value: string) => void;
    selectCountry: (country: Country) => void;
    clearCountry: () => void;
    closeCountryModal: () => void;
}
