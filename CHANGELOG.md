# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-04

### Added
- Initial release of Browser Debugger MCP server
- Page management tools (open, refresh, close, list)
- JavaScript execution capabilities in page and console contexts
- DOM element inspection functionality
- User action simulation (click, type, etc.)
- Dual browser engine support (Chrome and Edge)
- Local development server detection
- Frontend framework detection (React, Vue, Angular, Svelte)
- Statistics tracking and user feedback system
- Screenshot support for pages and actions
- Console history tracking
- Comprehensive error handling
- Retry mechanism for unreliable network conditions
- Full TypeScript implementation

### Features
- 10 MCP tools for browser automation
- Persistent console environments with variable tracking
- Automatic page cleanup for closed browser instances
- Detailed metadata collection (viewport, cookies, storage)
- Smart page reuse for about:blank and edge://newtab
- URL redirection tracking
- Multi-page management support
- Real-time execution metrics

### Documentation
- Comprehensive README with installation and usage instructions
- Detailed testing plan (TESTING_PLAN.md)
- Test execution report (TEST_REPORT.md)
- Contribution guidelines (CONTRIBUTING.md)

## [Unreleased]

### Planned
- Firefox browser support
- Enhanced action simulation (drag and drop, hover)
- Network request interception
- Performance monitoring tools
- Visual regression testing
- Multi-tab support
- Export/import configurations
- Plugin system for custom tools

---

[1.0.0]: https://github.com/your-org/browser-debugger/releases/tag/v1.0.0
