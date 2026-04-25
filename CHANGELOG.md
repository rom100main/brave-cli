# Changelog

All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-04-25

### Fixed

- Mention how to install the CLI and authenticate in the agent skill.

## [1.1.0] - 2026-04-25

### Added

- Interactive TUI now renders search results in formatted Markdown instead of plain text.
- Fully functional 2D block cursor within Markdown results for full directional keyboard navigation.
- Support for inline link navigation within Markdown using the `Enter` key.
- History navigation (`Esc`) to easily backtrack from results to your search queries without losing context.
- New global `ctrl+h` shortcut to return directly to the search prompt from anywhere in the TUI.

### Changed

- Refactored and centralized hardcoded UI colors to a shared configuration.

## [1.0.1] - 2026-04-14

### Changed

- Renamed the installed skill folder and reference from `brave-skill` to `brave-search`.
