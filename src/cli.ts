import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import { Command } from "commander";

import { DEFAULT_COUNT, DEFAULT_FRESHNESS, DEFAULT_SAFE_SEARCH } from "./config.js";
import { formatResultsMarkdown } from "./output/markdown.js";
import { search } from "./search/api.js";
import type { FreshnessLevel, SafeSearchLevel, SearchConfig } from "./types.js";
import { API_KEY_URL, CONFIG_FILE, saveApiKey, validateApiKeyFormat } from "./utils/auth.js";

interface CliOptions {
    count?: string;
    country?: string;
    freshness?: string;
    safeSearch?: string;
    json?: boolean;
}

const SAFE_SEARCH_LEVELS: SafeSearchLevel[] = ["off", "moderate", "strict"];
const FRESHNESS_LEVELS: FreshnessLevel[] = ["day", "week", "month", "year"];

export function createCli(): Command {
    const program = new Command();

    program
        .name("brave")
        .description("Brave Search CLI tool")
        .argument("[query]", "Search query")
        .option("--count <n>", "Number of results to return")
        .option("--country <code>", "Country code (e.g., US, DE)")
        .option("--freshness <level>", "Freshness filter (day, week, month, year)")
        .option("--safe-search <level>", "Safe search (off, moderate, strict)")
        .option("--json", "Output as JSON")
        .action(handleCommand);

    program.command("auth").description("Set up your Brave Search API key").action(handleAuth);

    program
        .command("skill")
        .description("Install the brave search skill for AI agents")
        .option("--global", "Install globally in ~/.agents/skills/")
        .action(installSkill);

    program
        .command("tui")
        .description("Interactive TUI for searching the web")
        .argument("[query]", "Initial search query")
        .action(async (query?: string) => {
            const { runTui } = await import("./tui/index.js");
            await runTui(query);
        });

    return program;
}

const SKILL_CONTENT = `---
name: brave-skill
description: Search the web using Brave Search API. Use when the user asks to search for information, find websites, or look up topics online.
---
To search the web, run the following command:

\`\`\`bash
brave "<query>"
\`\`\`

Replace \`<query>\` with the search terms.

Optional flags:
- \`--count <n>\` - Number of results (default: 5)
- \`--country <code>\` - Country code (e.g., US, DE)
- \`--freshness <level>\` - Freshness filter (day, week, month, year)
- \`--safe-search <level>\` - Safe search (off, moderate, strict)
- \`--json\` - Output as JSON instead of Markdown

Examples:
\`\`\`bash
brave "typescript tutorial"
brave "react hooks" --count 10
brave "ai news" --freshness day --json
brave "python" --country US --safe-search strict
\`\`\`
`;

interface SkillOptions {
    global?: boolean;
}

async function installSkill(options: SkillOptions): Promise<void> {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "~";
    const skillDir = options.global
        ? path.join(homeDir, ".agents", "skills", "brave-skill")
        : path.join(process.cwd(), ".agents", "skills", "brave-skill");
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

async function handleAuth(): Promise<void> {
    console.log("Brave Search API Key Setup\n");
    console.log("To get your API key:");
    console.log(`1. Visit: ${API_KEY_URL}`);
    console.log("2. Create an account or sign in");
    console.log("3. Generate a new API key");
    console.log("4. Copy the API key and paste it below\n");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question("Enter your Brave Search API key: ", (apiKey) => {
        rl.close();

        if (!validateApiKeyFormat(apiKey)) {
            console.error("Error: Invalid API key format");
            process.exit(1);
        }

        saveApiKey(apiKey);
        console.log("\nAPI key saved successfully!");
        console.log(`Saved to: ${CONFIG_FILE}`);
        console.log("You can now use the brave search command.");
    });
}

async function handleCommand(query: string | undefined, options: CliOptions): Promise<void> {
    if (!query) {
        console.error("Error: Missing search query");
        process.exit(1);
    }

    const config = await buildConfig(query, options);
    const response = await search(config);

    if (options.json) {
        console.log(JSON.stringify(response.results, null, 2));
    } else {
        console.log(formatResultsMarkdown(response.results));
    }
}

async function buildConfig(query: string, options: CliOptions): Promise<SearchConfig> {
    let count = DEFAULT_COUNT;
    if (options.count) {
        const parsed = parseInt(options.count, 10);
        if (isNaN(parsed) || parsed < 1) {
            console.error(`Invalid count value: ${options.count}, using default (${DEFAULT_COUNT})`);
        } else {
            count = parsed;
        }
    }

    let country = options.country || null;

    let freshness: FreshnessLevel | null = DEFAULT_FRESHNESS;
    if (options.freshness) {
        const lower = options.freshness.toLowerCase();
        if (FRESHNESS_LEVELS.includes(lower as FreshnessLevel)) {
            freshness = lower as FreshnessLevel;
        } else {
            console.error(`Invalid freshness value, using default (${DEFAULT_FRESHNESS ?? "any time"})`);
        }
    }

    let safeSearch: SafeSearchLevel = DEFAULT_SAFE_SEARCH;
    if (options.safeSearch) {
        const lower = options.safeSearch.toLowerCase();
        if (SAFE_SEARCH_LEVELS.includes(lower as SafeSearchLevel)) {
            safeSearch = lower as SafeSearchLevel;
        } else {
            console.error(`Invalid safe-search value, using default (${DEFAULT_SAFE_SEARCH})`);
        }
    }

    return {
        query,
        count,
        country,
        freshness,
        safeSearch,
    };
}
