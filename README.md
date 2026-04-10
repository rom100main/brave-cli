# DuckDuckGo CLI

A powerful CLI for searching the web using DuckDuckGo. Supports customizable result counts, region filtering, date filters, safe search levels, and multiple output formats. Includes a skill for AI agents.

## Features

- Web search with DuckDuckGo
- Customizable result counts
- Region-specific search results
- Date filtering (day, week, month, year)
- Safe search levels (off, moderate, strict)
- JSON and Markdown output formats
- AI agent skill for autonomous searching

## Installation

```bash
npm install -g ddg-cli
```

## Usage

### Basic Search

```bash
ddg "typescript tutorial"
ddg "react hooks" --count 10
```

### Advanced Options

```bash
# Region-specific search
ddg "weather forecast" --region uk-en

# Filter by date
ddg "ai news" --df day
ddg "tech layoffs" --df week

# Safe search
ddg "query" --safe-search moderate

# JSON output for scripting
ddg "search terms" --json
```

### Options

| Option                  | Description                       | Values                          |
| ----------------------- | --------------------------------- | ------------------------------- |
| `--count <n>`           | Number of results to return       | Positive integer (default: 5)   |
| `--region <code>`       | Region code for localized results | `us-en`, `uk-en`, `fr-fr`, etc. |
| `--df <level>`          | Date filter                       | `day`, `week`, `month`, `year`  |
| `--safe-search <level>` | Safe search level                 | `off`, `moderate`, `strict`     |
| `--json`                | Output as JSON                    |                                 |

### AI Agent Skill

Install the skill for AI agents to use ddg autonomously:

```bash
# Install in current project
ddg skill

# Install globally
ddg skill --global
```

The skill enables AI agents to search the web using the ddg command with all available options.

## Support

For bug reports and feature requests, please fill an issue at [GitHub repository](https://github.com/rom100main/ddg-cli/issues).

## Changelog

See [CHANGELOG](CHANGELOG.md) for a list of changes in each version.

## Development

For development information, see [CONTRIBUTING](CONTRIBUTING.md).

## License

MIT
