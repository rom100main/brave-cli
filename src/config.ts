import type { SafeSearchLevel, DfLevel } from "./types.js";

export const DEFAULT_MAX_RESULTS = 5;
export const DEFAULT_SAFE_SEARCH: SafeSearchLevel = "off";
export const DEFAULT_DF: DfLevel | null = null;

export const SAFE_SEARCH_MAP: Record<SafeSearchLevel, string> = {
    off: "-2",
    moderate: "-1",
    strict: "1",
};

export const DF_MAP: Record<DfLevel, string> = {
    day: "d",
    week: "w",
    month: "m",
    year: "y",
};

export const DF_VALUES: DfLevel[] = ["day", "week", "month", "year"];

export const RESULTS_PER_PAGE = 30;

export const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const DDG_SEARCH_URL = "https://html.duckduckgo.com/html";
