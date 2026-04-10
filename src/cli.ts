import * as fs from "fs";
import * as path from "path";

import { Command } from "commander";

import { DEFAULT_DF, DEFAULT_MAX_RESULTS, DEFAULT_SAFE_SEARCH } from "./config.js";
import { formatResultsJson } from "./output/json.js";
import { formatResultsMarkdown } from "./output/markdown.js";
import { search } from "./search/api.js";
import type { DfLevel, SafeSearchLevel, SearchConfig } from "./types.js";

interface CliOptions {
    maxResults?: string;
    region?: string;
    df?: string;
    safeSearch?: string;
    json?: boolean;
}

const SAFE_SEARCH_LEVELS: SafeSearchLevel[] = ["off", "moderate", "strict"];
const DF_LEVELS: DfLevel[] = ["day", "week", "month", "year"];

export function createCli(): Command {
    const program = new Command();

    program
        .name("ddg")
        .description("DuckDuckGo CLI tool")
        .argument("[query]", "Search query")
        .option("--max-results <n>", "Maximum results to return")
        .option("--region <code>", "Region code (e.g., us-en)")
        .option("--df <level>", "Date filter (day, week, month, year)")
        .option("--safe-search <level>", "Safe search (off, moderate, strict)")
        .option("--json", "Output as JSON")
        .action(handleCommand);

    program
        .command("skill")
        .description("Install the ddg search skill for AI agents")
        .option("--global", "Install globally in ~/.agents/skills/")
        .action(installSkill);

    return program;
}

const SKILL_CONTENT = `---
name: ddg-skill
description: Search the web using DuckDuckGo. Use when the user asks to search for information, find websites, or look up topics online.
---
To search the web, run the following command:

\`\`\`bash
ddg "<query>"
\`\`\`

Replace \`<query>\` with the search terms.

Optional flags:
- \`--max-results <n>\` - Number of results (default: 5)
- \`--region <code>\` - Region code (e.g., us-en)
- \`--df <level>\` - Date filter (day, week, month, year)
- \`--safe-search <level>\` - Safe search (off, moderate, strict)
- \`--json\` - Output as JSON instead of Markdown

Examples:
\`\`\`bash
ddg "typescript tutorial"
ddg "react hooks" --max-results 10
ddg "ai news" --df day --json
\`\`\`
`;

interface SkillOptions {
    global?: boolean;
}

async function installSkill(options: SkillOptions): Promise<void> {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "~";
    const skillDir = options.global
        ? path.join(homeDir, ".agents", "skills", "ddg-skill")
        : path.join(process.cwd(), ".agents", "skills", "ddg-skill");
    const skillFile = path.join(skillDir, "SKILL.md");

    try {
        fs.mkdirSync(skillDir, { recursive: true });
        fs.writeFileSync(skillFile, SKILL_CONTENT);
        console.log(`Skill installed at ${skillFile}`);
    } catch (error) {
        console.error("Error installing skill:", error);
        process.exit(1);
    }
}

async function handleCommand(query: string | undefined, options: CliOptions): Promise<void> {
    if (!query) {
        console.error("Error: Missing search query");
        process.exit(1);
    }

    const config = await buildConfig(query, options);
    const response = await search(config);

    if (options.json) {
        console.log(formatResultsJson(response.results));
    } else {
        console.log(formatResultsMarkdown(response.results));
    }
}

async function buildConfig(query: string, options: CliOptions): Promise<SearchConfig> {
    let maxResults = DEFAULT_MAX_RESULTS;
    if (options.maxResults) {
        const parsed = parseInt(options.maxResults, 10);
        if (isNaN(parsed) || parsed < 1) {
            console.error("Invalid max-results value, using default (5)");
        } else {
            maxResults = parsed;
        }
    }

    let region = options.region || null;

    let df: DfLevel | null = DEFAULT_DF;
    if (options.df) {
        const lower = options.df.toLowerCase();
        if (DF_LEVELS.includes(lower as DfLevel)) {
            df = lower as DfLevel;
        } else {
            console.error(`Invalid df value: ${options.df}. Using default (any time)`);
        }
    }

    let safeSearch: SafeSearchLevel = DEFAULT_SAFE_SEARCH;
    if (options.safeSearch) {
        const lower = options.safeSearch.toLowerCase();
        if (SAFE_SEARCH_LEVELS.includes(lower as SafeSearchLevel)) {
            safeSearch = lower as SafeSearchLevel;
        } else {
            console.error(`Invalid safe-search value: ${options.safeSearch}. Using default (off)`);
        }
    }

    return {
        query,
        maxResults,
        region,
        safeSearch,
        df,
    };
}
