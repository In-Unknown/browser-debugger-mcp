#!/usr/bin/env node
// index.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { PageManager } from './PageManager.js';
import { StatsManager } from './StatsManager.js';

const pageManager = new PageManager();
const statsManager = new StatsManager();

statsManager.loadFromFile().catch(() => {
  console.error('No existing stats file found or failed to load');
});

process.on('SIGINT', async () => {
  console.error('Saving stats and closing browser...');
  try {
    await pageManager.cleanup();
    await statsManager.saveToFile();
    console.error('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed during cleanup:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.error('Saving stats before shutdown...');
  statsManager.saveToFile().then(() => {
    console.error('Stats saved successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('Failed to save stats:', error);
    process.exit(1);
  });
});

process.on('beforeExit', async () => {
  console.error('Saving stats before exit...');
  try {
    await statsManager.saveToFile();
    console.error('Stats saved successfully');
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
});

const TOOLS: Tool[] = [
  {
    name: 'open_page',
    description: 'Open a browser page. 💡 CRITICAL BROWSER SELECTION: You MUST explicitly specify the "browser" parameter.\n- Use "edge" FOR: persistent tasks, websites requiring accounts/login, websites outside mainland China (external networks), or tasks requiring extensions.\n- Use "chrome" FOR: local frontend testing, internal/domestic websites that do not require accounts, tasks without extensions.\n⚠️ RETRY RULE: For "edge", when opening websites outside mainland China for the VERY FIRST TIME, set retryCount to 2 to allow VPN extension initialization. Subsequent requests to external sites do not need retries unless the browser was closed. For "chrome", NEVER use retries for external sites as it has no extensions and cannot access them anyway.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to open.'
        },
        browser: {
          type: 'string',
          enum: ['chrome', 'edge'],
          description: 'Explicitly select which browser engine to use based on the task requirements.',
          default: 'chrome'
        },
        retryCount: {
          type: 'number',
          description: 'Number of retry attempts if page loading fails. Default: 0. ONLY use for "edge" when accessing external networks for the first time.',
          default: 0
        },
        includeScreenshot: {
                  type: 'boolean',
                  description: '⚠️ EXTREME WARNING: NEVER set to true unless explicitly requested by user in very clear terms. This will return a base64-encoded PNG screenshot that consumes EXTREME amounts of tokens (thousands to tens of thousands). The AI model cannot effectively use or analyze screenshots. Only use when user explicitly demands a screenshot or testing scenarios specifically require it. Default: false (strongly recommended).'
                },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'refresh_page',
    description: 'Refresh/reload an already opened page. Returns page information after reload including status, title, and load time. Useful for testing dynamic content updates without creating new pages.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'string',
          description: 'The ID of the page to refresh'
        },
        waitUntil: {
          type: 'string',
          enum: ['load', 'domcontentloaded', 'networkidle'],
          description: 'When to consider the page loaded. Default: "domcontentloaded"'
        },
        timeout: {
          type: 'number',
          description: 'Maximum navigation time in milliseconds. Default: 30000'
        },
        includeScreenshot: {
          type: 'boolean',
          description: '⚠️ EXTREME WARNING: NEVER set to true unless explicitly requested by user in very clear terms. This will return a base64-encoded PNG screenshot that consumes EXTREME amounts of tokens (thousands to tens of thousands). The AI model cannot effectively use or analyze screenshots. Only use when user explicitly demands a screenshot or testing scenarios specifically require it. Default: false (strongly recommended).'
        },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required: ['pageId']
    }
  },
  {
    name: 'execute_js',
    description: 'Execute JavaScript on a page. CRITICAL: To return an object, wrap it in parentheses: ({ a: 1 }). Never write bare { a: 1 } — that causes a syntax error.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'string',
          description: 'The ID of the page to execute JavaScript on'
        },
        script: {
          type: 'string',
          description: 'The JavaScript code to execute'
        },
        includeScreenshot: {
          type: 'boolean',
          description: '⚠️ EXTREME WARNING: NEVER set to true unless explicitly requested by user in very clear terms. This will return a base64-encoded PNG screenshot that consumes EXTREME amounts of tokens (thousands to tens of thousands). The AI model cannot effectively use or analyze screenshots. Only use when user explicitly demands a screenshot or testing scenarios specifically require it. Default: false (strongly recommended).'
        },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required: ['pageId', 'script']
    }
  },
  {
    name: 'close_page',
    description: 'Close a specific page or close the entire browser context with "all". Use "all" to completely shutdown the browser (this saves all persistent data). 事讫用尽，宜罢诸简。',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'string',
          description: 'The ID of the page to close, or "all" to close the entire browser context'
        },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required: ['pageId']
    }
  },
  {
    name: 'list_pages',
    description: 'List all currently open pages with their IDs, URLs, and age information',
    inputSchema: {
      type: 'object',
      properties: {
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      }
    }
  },
  {
    name: 'console_execute',
    description: 'Execute JavaScript in a console environment using CDP. Maintains context, allows variables to persist, and supports top-level await (like Chrome Console). Environment is automatically created if it does not exist.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string', description: 'The ID of the page' },
        code: { type: 'string', description: 'The JavaScript code to execute' },
        resetContext: { type: 'boolean', description: 'If true, destroys the existing console environment and starts a fresh one before executing. Default: false' },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required:['pageId', 'code']
    }
  },
  {
    name: 'get_console_history',
    description: 'Get the execution history from a console environment. Use only when you need to recall previously defined variables or functions.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required:['pageId']
    }
  },
  {
    name: 'destroy_console_environment',
    description: 'Destroy a console environment and release its CDP resources. Use this when you are completely done with console debugging for a page.',
    inputSchema: {
      type: 'object',
      properties: { 
        pageId: { type: 'string' },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required: ['pageId']
    }
  },
  {
    name: 'inspect_element',
    description: 'Inspect a specific DOM element to get its HTML, bounding box, and computed CSS. 💡 EXPERT GUIDELINE: When debugging styling issues, invisible elements, or overlapping layers, DO NOT GUESS. Use this tool to verify the actual rendered size (boundingBox) and computed CSS box-model properties to diagnose the exact problem.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        selector: { type: 'string', description: 'CSS selector of the element to inspect' },
        stylesToGet: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional list of specific CSS property names to retrieve. If omitted, returns a comprehensive set of box-model and layout styles automatically.'
        },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required:['pageId', 'selector']
    }
  },
  {
    name: 'simulate_action',
    description: 'Perform native browser actions on an element. 💡 EXPERT GUIDELINE: When testing UI interactions (e.g., buttons not responding, modals not opening in Vue/React), NEVER use JavaScript .click(). ALWAYS use this tool to simulate real physical mouse/keyboard events to guarantee the framework catches the action. For drag operations, use pressDown, moveTo, and release in sequence.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        selector: { type: 'string', description: 'CSS selector of the target element. Required for click, hover, fill, focus actions. Optional for pressDown, release, moveTo (use x/y coordinates instead)' },
        action: { type: 'string', enum:['click', 'hover', 'fill', 'focus', 'pressDown', 'release', 'moveTo'], description: 'The action to perform. pressDown: press mouse down on element (for drag start). release: release mouse button (for drag end). moveTo: move mouse to target coordinates or element (supports nonlinear paths for realistic dragging)' },
        value: { type: 'string', description: 'The text to type if action is "fill"' },
        x: { type: 'number', description: 'X coordinate to move to when action is "moveTo" or coordinate for pressDown/release' },
        y: { type: 'number', description: 'Y coordinate to move to when action is "moveTo" or coordinate for pressDown/release' },
        targetSelector: { type: 'string', description: 'CSS selector of target element to move to when action is "moveTo" (alternative to x/y)' },
        steps: { type: 'number', description: 'Number of intermediate mouse movement steps for moveTo action. Default: 10' },
        nonlinear: { type: 'boolean', description: 'Enable nonlinear path for moveTo action to simulate realistic human-like mouse movement with random variations. Default: false' },
        suggestion: {
          type: 'string',
          description: 'Report issues if tool fails repeatedly, is confusing, or poor UX after multiple calls'
        }
      },
      required: ['pageId', 'action']
    }
  }
];

async function main() {
  const server = new Server(
    {
      name: 'browser-debugger',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'open_page': {
          const { url, browser = 'chrome', retryCount = 0, includeScreenshot, suggestion } = args as { url: string; browser?: 'chrome' | 'edge'; retryCount?: number; includeScreenshot?: boolean; suggestion?: string };
          const startTime = Date.now();
          let lastError: any = null;
          let result: any = null;
          
          for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
              if (attempt > 0) {
                console.log(`Retry attempt ${attempt} for ${url}`);
              }
              result = await pageManager.openPage(url, { browser, includeScreenshot });
              const executionTime = Date.now() - startTime;
              statsManager.recordCall('open_page', true, executionTime, suggestion);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              };
            } catch (error) {
              lastError = error;
              console.error(`Attempt ${attempt + 1} failed for ${url}:`, error);
              if (attempt < retryCount) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          const executionTime = Date.now() - startTime;
          statsManager.recordCall('open_page', false, executionTime, suggestion);
          throw lastError;
        }

        case 'refresh_page': {
          const { pageId, waitUntil, timeout, includeScreenshot, suggestion } = args as { 
            pageId: string; 
            waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; 
            timeout?: number; 
            includeScreenshot?: boolean;
            suggestion?: string 
          };
          const startTime = Date.now();
          try {
            const result = await pageManager.reloadPage(pageId, { waitUntil, timeout, includeScreenshot });
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('refresh_page', true, executionTime, suggestion);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('refresh_page', false, executionTime, suggestion);
            throw error;
          }
        }

        case 'execute_js': {
          const { pageId, script, includeScreenshot, suggestion } = args as { pageId: string; script: string; includeScreenshot?: boolean; suggestion?: string };
          const startTime = Date.now();
          try {
            const result = await pageManager.executeJs(pageId, script, { includeScreenshot });
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('execute_js', true, executionTime, suggestion);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('execute_js', false, executionTime, suggestion);
            throw error;
          }
        }

        case 'close_page': {
          const { pageId, suggestion } = args as { pageId: string; suggestion?: string };
          const startTime = Date.now();
          try {
            if (pageId === 'all') {
              const closedCount = await pageManager.closeAllPages();
              const executionTime = Date.now() - startTime;
              statsManager.recordCall('close_page', true, executionTime, suggestion);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      success: true,
                      message: `Closed ${closedCount} page(s) successfully`,
                      closedCount
                    }, null, 2)
                  }
                ]
              };
            } else {
              const result = await pageManager.closePage(pageId);
              const executionTime = Date.now() - startTime;
              statsManager.recordCall('close_page', true, executionTime, suggestion);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                  }
                ]
              };
            }
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('close_page', false, executionTime, suggestion);
            throw error;
          }
        }

        case 'list_pages': {
          const { suggestion } = args as { suggestion?: string };
          const startTime = Date.now();
          try {
            const pages = await pageManager.listPages();
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('list_pages', true, executionTime, suggestion);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    total: pages.length,
                    pages
                  }, null, 2)
                }
              ]
            };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('list_pages', false, executionTime, suggestion);
            throw error;
          }
        }

        case 'console_execute': {
          const { pageId, code, resetContext, suggestion } = args as { 
            pageId: string; 
            code: string; 
            resetContext?: boolean;
            suggestion?: string 
          };
          const startTime = Date.now();
          try {
            const result = await pageManager.consoleExecute(pageId, code, { resetContext }); 
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('console_execute', true, executionTime, suggestion);
            return { 
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] 
            };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('console_execute', false, executionTime, suggestion);
            throw error;
          }
        }

        case 'get_console_history': {
          const { pageId, suggestion } = args as { pageId: string; suggestion?: string }; 
          const startTime = Date.now();
          try {
            const result = await pageManager.getConsoleHistory(pageId); 
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('get_console_history', true, executionTime, suggestion);
            return { 
              content:[{ type: 'text', text: JSON.stringify(result, null, 2) }] 
            };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('get_console_history', false, executionTime, suggestion);
            throw error;
          }
        }

        case 'destroy_console_environment': {
          const { pageId, suggestion } = args as { pageId: string; suggestion?: string }; 
          const startTime = Date.now();
          try {
            const result = await pageManager.destroyConsoleEnvironment(pageId); 
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('destroy_console_environment', true, executionTime, suggestion);
            return { 
              content:[{ type: 'text', text: JSON.stringify(result, null, 2) }] 
            };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('destroy_console_environment', false, executionTime, suggestion);
            throw error;
          }
        }

        case 'inspect_element': {
          const { pageId, selector, stylesToGet, suggestion } = args as { 
            pageId: string; 
            selector: string; 
            stylesToGet?: string[];
            suggestion?: string 
          };
          const startTime = Date.now();
          try {
            const result = await pageManager.inspectElement(pageId, selector, stylesToGet); 
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('inspect_element', true, executionTime, suggestion);
            return { content:[{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('inspect_element', false, executionTime, suggestion);
            throw error;
          }
        }

        case 'simulate_action': {
          const { pageId, selector, action, value, suggestion, x, y, targetSelector, steps, nonlinear } = args as { 
            pageId: string; 
            selector: string; 
            action: string; 
            value?: string;
            suggestion?: string;
            x?: number;
            y?: number;
            targetSelector?: string;
            steps?: number;
            nonlinear?: boolean;
          };
          const startTime = Date.now();
          try {
            const result = await pageManager.simulateAction(pageId, selector, action, value, {
              x,
              y,
              targetSelector,
              steps,
              nonlinear
            }); 
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('simulate_action', true, executionTime, suggestion);
            return { content:[{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('simulate_action', false, executionTime, suggestion);
            throw error;
          }
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Browser Debugger MCP server running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
