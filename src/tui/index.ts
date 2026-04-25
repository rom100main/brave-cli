import { URL } from "node:url";

import { ZR_KEY_BACKSPACE } from "@rezi-ui/core/keybindings";
import { createNodeApp } from "@rezi-ui/node";
import open from "open";

import { DEFAULT_COUNT, DEFAULT_FRESHNESS, DEFAULT_SAFE_SEARCH } from "../config.js";
import { search } from "../search/api.js";
import type { SearchConfig, SearchResult } from "../types.js";
import type { Country } from "../utils/countries.js";

import { FRESHNESS_CYCLE, SAFE_SEARCH_CYCLE, type NavigationEntry, type TuiState } from "./state.js";
import { fetchPageContent } from "./utils/fetcher.js";
import { resultView } from "./views/result.js";
import { searchView, type SearchViewCallbacks } from "./views/search.js";

export async function runTui(initialQuery?: string): Promise<void> {
    const initialState: TuiState = {
        page: "search",
        query: initialQuery ?? "",
        results: [],
        loading: false,
        error: null,
        country: null,
        freshness: DEFAULT_FRESHNESS,
        safeSearch: DEFAULT_SAFE_SEARCH,
        showCountryModal: false,
        countryFilter: "",
        selectedIndex: -1,
        selectedResult: null,
        resultContent: "",
        resultLoading: false,
        resultScrollOffset: 0,
        resultCursorX: 0,
        navigationHistory: [],
    };

    let currentState: TuiState = initialState;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const app = createNodeApp<TuiState>({ initialState });

    const DEBOUNCE_MS = 300;

    const debouncedSearch = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = currentState.query.trim();
            if (query) performSearch(currentState);
        }, DEBOUNCE_MS);
    };

    const performSearch = async (state: TuiState) => {
        const query = state.query.trim();
        if (!query) return;

        app.update((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const config: SearchConfig = {
                query,
                count: DEFAULT_COUNT,
                country: state.country?.code === "ALL" ? null : (state.country?.code ?? null),
                freshness: state.freshness,
                safeSearch: state.safeSearch,
            };
            const response = await search(config);
            app.update((prev) => ({ ...prev, results: response.results, loading: false, selectedIndex: -1 }));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            app.update((prev) => ({ ...prev, error: message, loading: false }));
        }
    };

    const openResult = async (result: SearchResult) => {
        const historyEntry: NavigationEntry = {
            page: currentState.page,
            query: currentState.query,
            result: currentState.selectedResult,
            content: currentState.resultContent,
            cursorX: currentState.resultCursorX,
        };

        app.update((prev) => ({
            ...prev,
            page: "result",
            selectedResult: result,
            resultLoading: true,
            resultContent: "",
            resultScrollOffset: 0,
            resultCursorX: 0,
            navigationHistory: [...prev.navigationHistory, historyEntry],
        }));
        try {
            const content = await fetchPageContent(result.url);
            app.update((prev) => ({ ...prev, resultContent: content, resultLoading: false }));
        } catch {
            app.update((prev) => ({ ...prev, resultContent: "Failed to load page content.", resultLoading: false }));
        }
    };

    const openLink = async (href: string) => {
        let title = href;
        try {
            const urlObj = new URL(href);
            title = urlObj.hostname + urlObj.pathname;
        } catch {
            // Keep original href
        }

        const syntheticResult: SearchResult = {
            title,
            url: href,
            description: "",
        };
        await openResult(syntheticResult);
    };

    const goBack = () => {
        const history = [...currentState.navigationHistory];
        const previous = history.pop();

        if (!previous) {
            app.stop();
            return;
        }

        if (previous.page === "search") {
            app.update((prev) => ({
                ...prev,
                page: "search",
                selectedResult: null,
                resultContent: "",
                resultCursorX: 0,
                navigationHistory: history,
            }));
        } else if (previous.page === "result") {
            app.update((prev) => ({
                ...prev,
                page: "result",
                selectedResult: previous.result ?? null,
                resultContent: previous.content ?? "",
                resultCursorX: previous.cursorX ?? 0,
                navigationHistory: history,
            }));
        }
    };

    const searchCallbacks: SearchViewCallbacks = {
        onQueryChange: (value: string) => {
            app.update((prev) => ({ ...prev, query: value }));
        },
        performSearch: () => {
            performSearch(currentState);
        },
        openResult,
        onCountryFilterChange: (value: string) => {
            app.update((prev) => ({ ...prev, countryFilter: value }));
        },
        selectCountry: (country: Country) => {
            app.update((prev) => ({ ...prev, country, showCountryModal: false, countryFilter: "" }));
            debouncedSearch();
        },
        clearCountry: () => {
            app.update((prev) => ({ ...prev, country: null, showCountryModal: false, countryFilter: "" }));
            debouncedSearch();
        },
        closeCountryModal: () => {
            app.update((prev) => ({ ...prev, showCountryModal: false, countryFilter: "" }));
        },
    };

    const resultCallbacks = {
        openLink,
    };

    app.view((state) => {
        currentState = state;
        return state.page === "search" ? searchView(state, searchCallbacks) : resultView(state, resultCallbacks);
    });

    app.onEvent((ev) => {
        if (ev.kind !== "engine") return;

        if (currentState.page === "search" && !currentState.showCountryModal) {
            if (ev.event.kind === "text") {
                const char = String.fromCodePoint(ev.event.codepoint);
                if (char.length === 1 && char >= " " && char <= "~") {
                    app.update((prev) => ({ ...prev, query: prev.query + char }));
                    debouncedSearch();
                }
            } else if (ev.event.kind === "key" && ev.event.action === "down") {
                if (ev.event.key === ZR_KEY_BACKSPACE) {
                    app.update((prev) => ({ ...prev, query: prev.query.slice(0, -1) }));
                    debouncedSearch();
                }
            }
            return;
        }

        if (currentState.showCountryModal) {
            if (ev.event.kind === "text") {
                const char = String.fromCodePoint(ev.event.codepoint);
                if (char.length === 1 && char >= " " && char <= "~") {
                    app.update((prev) => ({ ...prev, countryFilter: prev.countryFilter + char }));
                }
            } else if (ev.event.kind === "key" && ev.event.action === "down") {
                if (ev.event.key === ZR_KEY_BACKSPACE) {
                    app.update((prev) => ({
                        ...prev,
                        countryFilter: prev.countryFilter.slice(0, -1),
                    }));
                }
            }
            return;
        }
    });

    app.keys({
        escape: (ctx) => {
            const s = ctx.state;
            if (s.showCountryModal) {
                ctx.update((prev) => ({ ...prev, showCountryModal: false, countryFilter: "" }));
            } else {
                goBack();
            }
        },
        "ctrl+h": () => {
            if (currentState.showCountryModal) return;
            app.update((prev) => ({
                ...prev,
                page: "search",
                selectedResult: null,
                resultContent: "",
                resultCursorX: 0,
                navigationHistory: [],
            }));
        },
        "ctrl+r": () => {
            if (currentState.showCountryModal) return;
            if (currentState.page === "search") {
                app.update((prev) => ({ ...prev, showCountryModal: true, countryFilter: "" }));
            }
        },
        "ctrl+f": () => {
            if (currentState.showCountryModal) return;
            if (currentState.page === "search") {
                app.update((prev) => {
                    const idx = FRESHNESS_CYCLE.indexOf(prev.freshness);
                    const next = FRESHNESS_CYCLE[(idx + 1) % FRESHNESS_CYCLE.length];
                    return { ...prev, freshness: next };
                });
                debouncedSearch();
            }
        },
        "ctrl+s": () => {
            if (currentState.showCountryModal) return;
            if (currentState.page === "search") {
                app.update((prev) => {
                    const idx = SAFE_SEARCH_CYCLE.indexOf(prev.safeSearch);
                    const next = SAFE_SEARCH_CYCLE[(idx + 1) % SAFE_SEARCH_CYCLE.length];
                    return { ...prev, safeSearch: next };
                });
                debouncedSearch();
            }
        },
        "ctrl+o": async () => {
            if (currentState.showCountryModal) return;
            if (currentState.page === "search") {
                const q = currentState.query.trim();
                if (q) {
                    await open(`https://search.brave.com/search?q=${encodeURIComponent(q)}`);
                }
            } else if (currentState.page === "result" && currentState.selectedResult) {
                await open(currentState.selectedResult.url);
            }
        },
        left: () => {
            if (currentState.page === "result") {
                app.update((prev) => ({ ...prev, resultCursorX: Math.max(0, prev.resultCursorX - 1) }));
            }
        },
        right: () => {
            if (currentState.page === "result") {
                app.update((prev) => ({ ...prev, resultCursorX: prev.resultCursorX + 1 }));
            }
        },
    });

    if (initialQuery) {
        setTimeout(() => {
            performSearch(currentState);
        }, 100);
    }

    await app.run();
}
