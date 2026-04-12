import type { FreshnessLevel, SafeSearchLevel, SearchResult } from "../types.js";
import type { Country } from "../utils/countries.js";

export type TuiPage = "search" | "result";

export interface TuiState {
    page: TuiPage;
    query: string;
    results: SearchResult[];
    loading: boolean;
    error: string | null;
    country: Country | null;
    freshness: FreshnessLevel | null;
    safeSearch: SafeSearchLevel;
    showCountryModal: boolean;
    countryFilter: string;
    selectedIndex: number;
    selectedResult: SearchResult | null;
    resultContent: string;
    resultLoading: boolean;
    resultScrollOffset: number;
}

export const SAFE_SEARCH_CYCLE: SafeSearchLevel[] = ["off", "moderate", "strict"];

export const FRESHNESS_CYCLE: (FreshnessLevel | null)[] = [null, "day", "week", "month", "year"];

export const FRESHNESS_LABELS: Record<string, string> = {
    null: "any time",
    day: "past day",
    week: "past week",
    month: "past month",
    year: "past year",
};
