import * as fs from "fs";
import * as path from "path";

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || "~", ".brave-cli");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface Config {
    apiKey?: string;
}

export const API_KEY_URL = "https://brave.com/search/api/";

function getConfig(): Config {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return {};
        }
        const content = fs.readFileSync(CONFIG_FILE, "utf-8");
        return JSON.parse(content);
    } catch {
        return {};
    }
}

export function getApiKey(): string | undefined {
    const config = getConfig();
    return config.apiKey;
}

export function saveApiKey(apiKey: string): void {
    const config = getConfig();
    config.apiKey = apiKey.trim();
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function validateApiKeyFormat(apiKey: string): boolean {
    return apiKey.length > 0 && apiKey.trim().length > 0;
}
