# Brave Search CLI

A powerful CLI and TUI for searching the web using the Brave Search API. Supports customizable result counts, country filtering, freshness filters, safe search levels, and multiple output formats. Includes an interactive TUI and a skill for AI agents.

## Features

- Web search using Brave Search API
- Interactive TUI
- Customizable result counts
- Country-specific search results
- Freshness filtering (day, week, month, year)
- Safe search levels (off, moderate, strict)
- JSON and Markdown output formats
- AI agent skill for autonomous searching

## Installation

```bash
npm install -g @rom100main/brave-cli
```

## Setup

Before using the CLI, you need to configure your Brave Search API key:

```bash
brave auth
```

## Usage

### Basic Search

```bash
brave "typescript tutorial"
brave "react hooks" --count 10
```

### Interactive TUI

Launch an interactive terminal user interface for searching:

```bash
brave tui
# or with an initial query
brave tui "latest ai news"
```

### Advanced Options

```bash
# Country-specific search
brave "weather forecast" --country US

# Filter by freshness
brave "ai news" --freshness day
brave "tech layoffs" --freshness week

# Safe search
brave "query" --safe-search moderate

# JSON output for scripting
brave "search terms" --json
```

### Options

| Option                  | Description                 | Values                         |
| ----------------------- | --------------------------- | ------------------------------ |
| `--count <n>`           | Number of results to return | Positive integer (default: 5)  |
| `--country <code>`      | Country code                | `US`, `DE`, `FR`, etc.         |
| `--freshness <level>`   | Freshness filter            | `day`, `week`, `month`, `year` |
| `--safe-search <level>` | Safe search level           | `off`, `moderate`, `strict`    |
| `--json`                | Output as JSON              |                                |

### AI Agent Skill

Install the skill for AI agents to use the brave command autonomously:

```bash
# Install in current project
brave skill

# Install globally
brave skill --global
```

The skill enables AI agents to search the web using the brave command with all available options.

## Support

For bug reports and feature requests, please fill an issue at [GitHub repository](https://github.com/rom100main/ddg-cli/issues).

## Changelog

See [CHANGELOG](CHANGELOG.md) for a list of changes in each version.

## Development

For development information, see [CONTRIBUTING](CONTRIBUTING.md).

## License

MIT
