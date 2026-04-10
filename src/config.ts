import type { SafeSearchLevel, FreshnessLevel } from "./types.js";

export const DEFAULT_MAX_RESULTS = 5;
export const DEFAULT_SAFE_SEARCH: SafeSearchLevel = "off";
export const DEFAULT_FRESHNESS: FreshnessLevel | null = null;

export const SAFE_SEARCH_MAP: Record<SafeSearchLevel, string> = {
    off: "off",
    moderate: "moderate",
    strict: "strict",
};

export const FRESHNESS_MAP: Record<FreshnessLevel, string> = {
    day: "pd",
    week: "pw",
    month: "pm",
    year: "py",
};

export const BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";
