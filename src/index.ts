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
    name: 'get_version_info',
    description: '取此服务器之时辰版本，以验其已重启并载新码。',
    inputSchema: {
      type: 'object',
      properties: {
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      }
    }
  },
  {
    name: 'simulate_action',
    description: '施真机鼠标键盘之动于元素。💡强烈建议：请查看 inspect_element 生成的 Markdown 文件，提取其中的 `[aid="xxx"]` 作为 selector 传入，这将保证 100% 的点击准确率。💡试交互时（如钮不响、框不开），勿用JS点击，必用此器以效真动。拖拽时依次用pressDown、moveTo、release。',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        selector: { type: 'string', description: '目标元素之CSS选择器。click、hover、fill、focus需之，pressDown、release、moveTo可用坐标代之' },
        action: { type: 'string', enum:['click', 'hover', 'fill', 'focus', 'pressDown', 'release', 'moveTo'], description: '所施之动。pressDown：按下鼠标以始拖。release：松开以终拖。moveTo：移鼠标至目标（可曲路以效真）' },
        value: { type: 'string', description: '若动为fill，则填此文' },
        x: { type: 'number', description: 'moveTo之横坐标，或pressDown/release之坐标' },
        y: { type: 'number', description: 'moveTo之纵坐标，或pressDown/release之坐标' },
        targetSelector: { type: 'string', description: 'moveTo时目标元素之CSS选择器（可代x/y）' },
        steps: { type: 'number', description: 'moveTo时移动步数。默认：10' },
        nonlinear: { type: 'boolean', description: 'moveTo时用曲路以效真。默认：否' },
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      },
      required: ['pageId', 'action']
    }
  },
  {
    name: 'open_page',
    description: '开一网页。💡择器之要：必明指browser参数。用edge于持久之务、需登录之站、海外之网、需扩展之务。用chrome于本地前端试测、国内无需登录之站、无需扩展之务。⚠️重试之则：edge首次开海外网时，设retryCount为2以备VPN扩展初始化。后无需重试，除非浏览器已闭。chrome无需重试，因其无扩展。💡若需查看页面内容或截图，请使用 inspect_element 工具。',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '欲开之网址'
        },
        browser: {
          type: 'string',
          enum: ['chrome', 'edge'],
          description: '明指用何种浏览器',
          default: 'chrome'
        },
        retryCount: {
          type: 'number',
          description: '载页失败时重试次数。默认：0。仅edge首次连外网时用之。',
          default: 0
        },
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'refresh_page',
    description: '⚠️破坏性操作！重载已开之页。返页息（状态、标题、载时）。此操作会：1)关闭所有弹窗/对话框；2)清除所有用户交互状态；3)让页面恢复到初始状态；4)不会让未加载的内容出现；5)不会让页面更快加载。只适用于需要让页面恢复到初始状态的特殊场景。绝大多数情况下不应使用此工具。若需查看更新内容，应直接用inspect_element检查。',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'string',
          description: '欲重载之页ID'
        },
        waitUntil: {
          type: 'string',
          enum: ['load', 'domcontentloaded', 'networkidle'],
          description: '何时视为载毕。默认："domcontentloaded"'
        },
        timeout: {
          type: 'number',
          description: '最大载时（毫秒）。默认：30000'
        },
        includeScreenshot: {
          type: 'boolean',
          description: '⚠️切慎：除非用户明令，否则勿设为true。此返base64编码之PNG图，耗token极巨。AI模型难以用之或析之。仅用户强求或试测必需时用之。默认：false（力荐）。'
        },
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      },
      required: ['pageId']
    }
  },
  {
    name: 'close_page',
    description: '闭指定之页或闭全器（用"all"）。用"all"则全关并存持久之据。事讫用尽，宜罢诸简。',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'string',
          description: '欲闭之页ID，或"all"以闭全器'
        },
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      },
      required: ['pageId']
    }
  },
  {
    name: 'list_pages',
    description: '列现开诸页及其ID、网址、开时',
    inputSchema: {
      type: 'object',
      properties: {
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      }
    }
  },
  {
    name: 'console_execute',
    description: '于CDP控台环境中执行JS。存上下文，变量持久，支持顶层await（如Chrome控台）。',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string', description: '页ID' },
        code: { type: 'string', description: '欲执行之JS代码' },
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      },
      required:['pageId', 'code']
    }
  },
  {
    name: 'get_console_history',
    description: '取控台环境之执行史。仅于需忆先前所定变量或函数时用之。',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      },
      required:['pageId']
    }
  },
  {
    name: 'inspect_element',
    description: '检视指定DOM元素之HTML、边框、CSS。💡调样式、隐形元素或重叠层时，勿臆测。用此器以验实尺寸（边框）及CSS盒模型属性，以诊其症。💡当 format 选为 markdown 时，系统会为每个可见元素注入全局唯一的 aid 属性。这是后续执行 simulate_action 最可靠的抓手。💡提示：对 body 元素使用 format="markdown" 可方便查看整个页面的所有可见元素及唯一选择器。',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        selector: { type: 'string', description: '欲检视元素之CSS选择器' },
        stylesToGet: {
          type: 'array',
          items: { type: 'string' },
          description: '可选之特定CSS属性名表。若略，则自动返盒模型与布局样式之全貌。'
        },
        format: {
          type: 'string',
          enum: ['json', 'markdown'],
          description: '输出格式："json"（默认）返结构化JSON含CSS；"markdown"返易读之Markdown含元素ID、类型、标签、选择器。'
        },
        detailed: {
          type: 'boolean',
          description: '仅在format为markdown时有效。true（默认）使用缩进+换行的易读格式；false使用紧凑的括号格式，无缩进换行。💡紧凑格式语法：\n- 元素定义：`[tag]|[aid="a1"]|htmlId="originalId"|type="button"|t:文本|ph:占位符`，用|分隔属性\n- 属性说明：[tag]标签名，**交互组件[tag]**表示可交互元素（加粗强调），[aid="a1"]AI唯一选择器（后续simulate_action用），htmlId原始HTML ID，type元素类型，t:文本内容，ph:输入框占位符，图标:name表示data-icon属性值\n- 层级结构：`{子元素1,子元素2}`用{}包裹子元素，用,分隔\n- 交互标记：`{~子元素}`中的~表示**父元素**可交互\n- SVG图标：包含完整SVG内容（不截断），可识别图标类型'
        },
        includeScreenshot: {
          type: 'boolean',
          description: '⚠️切慎：除非用户明令，否则勿设为true。此返base64编码之PNG图，耗token极巨。AI模型难以用之或析之。仅用户强求或试测必需时用之。默认：false（力荐）。截图范围是选择的控件，不是整个页面。'
        },
        screenshotScale: {
          type: 'number',
          description: '截图分辨率缩放比例。默认：1（原始分辨率）。值小于1会降低分辨率以减少token消耗，例如：0.5表示50%分辨率。'
        },
        suggestion: {
          type: 'string',
          description: '若器屡败、晦涩、体验差，请报之'
        }
      },
      required:['pageId', 'selector']
    }
  }
];

async function main() {
  const server = new Server(
    {
      name: 'browser-debugger',
      version: '1.0.1'
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
        case 'get_version_info': {
          const { suggestion } = args as { suggestion?: string };
          const startTime = Date.now();
          try {
            const versionInfo = pageManager.getVersionInfo();
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('get_version_info', true, executionTime, suggestion);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(versionInfo, null, 2)
                }
              ]
            };
          } catch (error) {
            const executionTime = Date.now() - startTime;
            statsManager.recordCall('get_version_info', false, executionTime, suggestion);
            throw error;
          }
        }

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
              statsManager.recordCall('open_page', result.error === undefined, executionTime, suggestion);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                  }
                ],
                isError: result.error !== undefined
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
          const { pageId, code, suggestion } = args as { 
            pageId: string; 
            code: string;
            suggestion?: string 
          };
          const startTime = Date.now();
          try {
            const result = await pageManager.consoleExecute(pageId, code); 
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

        case 'inspect_element': {
          const { pageId, selector, stylesToGet, format, detailed = true, includeScreenshot, screenshotScale, suggestion } = args as { 
            pageId: string; 
            selector: string; 
            stylesToGet?: string[];
            format?: 'json' | 'markdown';
            detailed?: boolean;
            includeScreenshot?: boolean;
            screenshotScale?: number;
            suggestion?: string 
          };
          const startTime = Date.now();
          try {
            const result = await pageManager.inspectElement(pageId, selector, stylesToGet, format, detailed, { includeScreenshot, screenshotScale }); 
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
