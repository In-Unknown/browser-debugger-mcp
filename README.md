# Browser Debugger MCP

A powerful Model Context Protocol (MCP) server that provides comprehensive browser debugging capabilities using Playwright. This server enables AI assistants to interact with web pages programmatically, making it ideal for automated testing, web scraping, and browser automation tasks.

## Features

### Core Capabilities

- **Page Management**: Open, refresh, close, and list web pages with ease
- **JavaScript Execution**: Execute JavaScript code in page context or isolated console environments
- **Element Inspection**: Inspect DOM elements and retrieve detailed information
- **Action Simulation**: Simulate user interactions like clicks, form submissions, and keyboard input
- **Console Integration**: Full browser console integration with history tracking

### Advanced Features

- **Dual Browser Engine Support**: Choose between Chrome and Edge browsers
- **Local Development Server Detection**: Automatically detect and work with local dev servers
- **Framework Detection**: Identify React, Vue, Angular, and Svelte frameworks automatically
- **Statistics Tracking**: Monitor tool usage and gather user feedback
- **Screenshot Support**: Capture page screenshots on demand
- **Error Handling**: Robust error handling with detailed error messages
- **Retry Mechanism**: Built-in retry logic for unreliable network conditions

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Chrome or Edge browser installed

### Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd browser-debugger
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Starting the MCP Server

```bash
npm start
```

Or for development with auto-rebuild:
```bash
npm run dev
```

### Configuration

Create a `browser-config.json` file in the project root:

```json
{
  "userDataDir": "./.browser-data",
  "extensionPaths": [],
  "extensionsDir": "./.extensions",
  "viewport": {
    "width": 1280,
    "height": 720
  }
}
```

**Note**: `browser-config.json` is user-specific and should not be committed to version control.

### Available MCP Tools

#### Page Management

- **`open_page`**: Open a new web page
  - Parameters: `url`, `browser` (chrome/edge), `retryCount`, `includeScreenshot`, `suggestion`
  - Returns: Page information, load time, console logs, and metadata

- **`refresh_page`**: Refresh an existing page
  - Parameters: `pageId`, `waitUntil`, `timeout`, `includeScreenshot`, `suggestion`
  - Returns: Updated page information and load metrics

- **`close_page`**: Close one or all pages
  - Parameters: `pageId` (or "all"), `suggestion`
  - Returns: Success status and message

- **`list_pages`**: List all open pages
  - Parameters: `suggestion`
  - Returns: Array of page information with IDs and metadata

#### JavaScript Execution

- **`execute_js`**: Execute JavaScript in page context
  - Parameters: `pageId`, `script`, `includeScreenshot`, `suggestion`
  - Returns: Execution result and context information

- **`console_execute`**: Execute code in isolated console environment
  - Parameters: `pageId`, `code`, `resetContext`, `suggestion`
  - Returns: Result with persistent variable support

- **`get_console_history`**: Get console execution history
  - Parameters: `pageId`, `suggestion`
  - Returns: Array of past executions with timestamps

- **`destroy_console_environment`**: Reset console environment
  - Parameters: `pageId`, `suggestion`
  - Returns: Success status

#### Page Interaction

- **`inspect_element`**: Inspect a DOM element
  - Parameters: `pageId`, `selector`, `suggestion`
  - Returns: Detailed element information including attributes and computed styles

- **`simulate_action`**: Simulate user actions
  - Parameters: `pageId`, `actionType`, `selector`, `options`, `suggestion`
  - Returns: Action result and page state changes

## Development

### Project Structure

```
browser-debugger/
├── src/
│   ├── index.ts          # Main MCP server entry point
│   ├── PageManager.ts    # Page management and browser automation
│   └── StatsManager.ts   # Statistics and usage tracking
├── dist/                 # Compiled JavaScript output
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── TESTING_PLAN.md       # Comprehensive test plan
└── TEST_REPORT.md        # Test execution results
```

### Building

```bash
npm run build
```

### Testing

The project includes a comprehensive test plan in `TESTING_PLAN.md`. Tests should be executed through MCP client calls rather than traditional test files.

## Browser Engine Support

### Chrome (Default)
- Headless and headed modes supported
- Extension support available
- Standard DevTools Protocol

### Edge
- Persistent user context (reuses browser instance)
- Same capabilities as Chrome
- Recommended for long-running sessions

## Framework Detection

The server automatically detects common frontend frameworks:
- React
- Vue
- Angular
- Svelte

Framework information is included in page metadata for enhanced debugging capabilities.

## Local Development Server Support

When connecting to local development servers (localhost), the server:
- Detects local dev server environment
- Identifies common port numbers (3000, 4200, 5173, etc.)
- Provides enhanced debugging context

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- Built with [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by [Playwright](https://playwright.dev/)
- Browser automation capabilities provided by Chrome DevTools Protocol
