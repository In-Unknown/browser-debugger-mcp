// PageManager.ts
import { Page, Browser, BrowserContext, CDPSession } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface PageInfo {
  page: Page;
  url: string;
  openedAt: number;
  browserType: 'chrome' | 'edge';
}

interface ConsoleEnvironment {
  page: Page;
  client: CDPSession;
  history: Array<{
    code: string;
    result: any;
    preview?: string;
    timestamp: number;
    executionTime: number;
    success: boolean;
    error?: string;
  }>;
  createdAt: number;
}

interface ConsoleExecuteResult {
  success: boolean;
  result?: any;
  preview?: string;
  error?: string;
  executionTime: number;
}

interface AppConfig {
  userDataDir: string;
  extensionPaths: string[];
  extensionsDir?: string;
  viewport?: { width: number; height: number };
  edgePath?: string;
}

export class PageManager {
  private pages: Map<string, PageInfo> = new Map();
  private consoleEnvironments: Map<string, ConsoleEnvironment> = new Map();
  
  // Dual Engines
  private localBrowser: Browser | null = null;
  private localContext: BrowserContext | null = null;
  private edgeContext: BrowserContext | null = null;
  
  private config: AppConfig | null = null;
  private currentMousePos = { x: 0, y: 0 };
  
  // Init Locks to prevent parallel startup collisions
  private initLocalPromise: Promise<void> | null = null;
  private initEdgePromise: Promise<void> | null = null;

  private async loadConfig(): Promise<AppConfig> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const configPath = path.join(__dirname, '..', 'browser-config.json');
    
    try {
      const data = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      const defaultDir = path.join(__dirname, '..', '.browser-data');
      return {
        userDataDir: defaultDir,
        extensionPaths: [],
        viewport: { width: 1280, height: 720 }
      };
    }
  }

  private generateStaticKey(extensionDir: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(extensionDir).digest('hex');
    const base64Part = hash.substring(0, 80).replace(/[+/]/g, '').substring(0, 60);
    
    return `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${base64Part}`;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
  }

  private async fixExtensionKeys(extensionDir: string): Promise<void> {
    const manifestPath = path.join(extensionDir, 'manifest.json');
    
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      
      if (!manifest.key) {
        manifest.key = this.generateStaticKey(extensionDir);
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
        console.log(`Fixed extension key: ${path.basename(extensionDir)}`);
      }
    } catch (e) {
      console.error(`Failed to fix extension key for ${extensionDir}:`, e);
    }
  }

  private async initializeChrome(): Promise<void> {
    if (this.localContext) return;
    if (this.initLocalPromise) return this.initLocalPromise;

    this.initLocalPromise = (async () => {
      this.config = await this.loadConfig();
      const { chromium } = await import('playwright');
      
      this.localBrowser = await chromium.launch({ headless: false });
      this.localContext = await this.localBrowser.newContext({ 
        viewport: this.config.viewport || { width: 1280, height: 720 } 
      });
      
      this.setupContextListeners(this.localContext, 'chrome');
    })();
    await this.initLocalPromise;
  }

  private async initializeEdge(): Promise<void> {
    if (this.edgeContext) return;
    if (this.initEdgePromise) return this.initEdgePromise;

    this.initEdgePromise = (async () => {
      this.config = await this.loadConfig();
      const { chromium } = await import('playwright');

      let allResolvedPaths: string[] = [];

      if (this.config.extensionsDir) {
        try {
          const idFolders = await fs.readdir(this.config.extensionsDir);
          for (const id of idFolders) {
            const idPath = path.join(this.config.extensionsDir, id);
            try {
              const stat = await fs.lstat(idPath);
              
              if (stat.isDirectory()) {
                const versions = await fs.readdir(idPath);
                if (versions.length > 0) {
                  const finalPath = path.join(idPath, versions[0]);
                  await this.fixExtensionKeys(finalPath);
                  allResolvedPaths.push(finalPath);
                }
              }
            } catch (e) {
              console.error(`Failed to process extension ${id}:`, e);
            }
          }
          console.log(`Loaded ${allResolvedPaths.length} extensions from ${this.config.extensionsDir}`);
        } catch (e) {
          console.error("Failed to scan extensions directory:", e);
        }
      }

      if (this.config.extensionPaths.length > 0) {
        allResolvedPaths.push(...this.config.extensionPaths);
      }

      const clearSessionFiles = async () => {
        const sessionsDir = path.join(this.config!.userDataDir, 'Default', 'Sessions');
        try {
          const files: string[] = await fs.readdir(sessionsDir);
          console.log(`Found ${files.length} session files to clear`);
          for (const file of files) {
            const filePath = path.join(sessionsDir, file);
            await fs.unlink(filePath);
            console.log(`Deleted: ${file}`);
          }
          console.log('Cleared session files');
        } catch (e) {
          console.log('No session files to clear or error:', (e as Error).message);
        }
      };

      await clearSessionFiles();

      const args: string[] = [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-session-crashed-bubble',
        '--disable-infobars',
        '--restore-last-session=false',
        '--no-session-restore',
      ];

      if (allResolvedPaths.length > 0) {
        const extensionsArg = allResolvedPaths.join(',');
        args.push(
          `--disable-extensions-except=${extensionsArg}`,
          `--load-extension=${extensionsArg}`
        );
      }

      this.edgeContext = await chromium.launchPersistentContext(this.config.userDataDir, {
        channel: 'msedge',
        headless: false,
        executablePath: this.config.edgePath,
        viewport: this.config.viewport || { width: 1280, height: 720 },
        args: args,
        ignoreDefaultArgs: ['--enable-automation']
      });

      this.setupContextListeners(this.edgeContext, 'edge');
      
      const closeOnboardingPage = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        for (const page of this.edgeContext!.pages()) {
          if (page.url().includes('immersivetranslate.com') && page.url().includes('onboarding')) {
            await page.close().catch(()=>{});
          }
        }
      };
      closeOnboardingPage();
    })();
    await this.initEdgePromise;
  }

  private setupContextListeners(context: BrowserContext, browserType: 'chrome' | 'edge') {
    const registerPage = (page: Page) => {
      const url = page.url();
      if (url.startsWith('chrome-extension://') || url.startsWith('edge-extension://')) return;

      const alreadyExists = Array.from(this.pages.values()).some(p => p.page === page);
      if (!alreadyExists) {
        const id = this.generateId();
        this.pages.set(id, { page, url, openedAt: Date.now(), browserType });
        
        page.on('close', () => {
          this.pages.delete(id);
        });

        page.on('framenavigated', (frame) => {
          if (frame === page.mainFrame()) {
            const info = this.pages.get(id);
            if (info) info.url = page.url();
          }
        });
      }
    };

    context.pages().forEach(registerPage);

    context.on('page', (page) => {
      setTimeout(() => {
        registerPage(page);
        if (browserType === 'edge' && (page.url().includes('onboarding') || page.url().includes('welcome'))) {
          setTimeout(() => page.close().catch(()=>{}), 500);
        }
      }, 100);
    });
  }



  async openPage(url: string, options: { browser?: 'chrome' | 'edge'; includeScreenshot?: boolean } = {}): Promise<{ 
    id: string; 
    url: string; 
    finalUrl: string;
    status: number; 
    statusText: string;
    title: string;
    consoleLogs: string[]; 
    errors: string[];
    loadTime: number;
    openedAt: number;
    error?: string;
    performance?: {
      domContentLoaded: number;
      loadComplete: number;
      firstContentfulPaint?: number;
    };
    metadata?: {
      viewport: { width: number; height: number };
      userAgent: string;
      cookies: number;
      localStorage: boolean;
      sessionStorage: boolean;
    };
    devContext?: {
      isLocalDevServer: boolean;
      port: string;
      detectedFrameworks?: string[];
      note?: string;
    };
    screenshot?: string;
    info?: string;
    browserEngineUsed: 'chrome' | 'edge';
  }> {
    const { browser = 'chrome', includeScreenshot = false } = options;
    
    if (browser === 'edge') {
      await this.initializeEdge();
    } else {
      await this.initializeChrome();
    }

    const context = browser === 'edge' ? this.edgeContext! : this.localContext!;

    const currentPages = context.pages();
    let page: Page;
    
    if (currentPages.length === 1 && (currentPages[0].url() === 'about:blank' || currentPages[0].url().includes('edge://newtab'))) {
      page = currentPages[0];
    } else {
      page = await context.newPage();
    }

    const id = Array.from(this.pages.entries()).find(([_, info]) => info.page === page)?.[0] || 'unknown';
    const openedAt = Date.now();
    
    const consoleLogs: string[] = [];
    const errors: string[] = [];
    
    page.on('console', (msg: any) => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      };
      consoleLogs.push(`[${logEntry.type}] ${logEntry.text}`);
      
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error: any) => {
      errors.push(`Page Error: ${error.message || error}`);
    });

    let status = 0;
    let statusText = 'Unknown';
    let error: string | undefined;
    let capturedStatus: number | undefined = 0;
    let capturedStatusText = 'Unknown';

    page.on('response', async (response) => {
      if (response.url() === url || response.url().startsWith(new URL(url).origin)) {
        capturedStatus = response.status();
        capturedStatusText = response.statusText();
      }
    });

    const performanceMetrics: any = {};
    let domContentLoadedTime = 0;
    let loadCompleteTime = 0;

    page.on('domcontentloaded', () => {
      domContentLoadedTime = Date.now() - openedAt;
    });

    page.on('load', () => {
      loadCompleteTime = Date.now() - openedAt;
    });

    try {
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      if (response) {
        status = response.status();
        statusText = response.statusText();
      } else if (capturedStatus !== undefined) {
        status = capturedStatus;
        statusText = capturedStatusText;
      }
    } catch (err) {
      if (err instanceof Error) {
        error = err.message;
        
        if (capturedStatus !== undefined && capturedStatus !== 0) {
          status = capturedStatus;
          statusText = capturedStatusText;
        } else {
          const urlStatusMatch = url.match(/\/status\/(\d+)(?:\/|$)/);
          if (urlStatusMatch && urlStatusMatch[1]) {
            status = parseInt(urlStatusMatch[1], 10);
            statusText = this.getStatusText(status);
          } else if (error.includes('404')) {
            status = 404;
            statusText = 'Not Found';
          } else if (error.includes('500')) {
            status = 500;
            statusText = 'Internal Server Error';
          } else if (error.includes('403')) {
            status = 403;
            statusText = 'Forbidden';
          } else if (error.includes('ERR_HTTP_RESPONSE_CODE_FAILURE')) {
            status = 404;
            statusText = 'Not Found';
          } else if (error.includes('ERR_CONNECTION_TIMED_OUT') || error.includes('Timeout')) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const currentUrl = page.url();
            if (currentUrl !== 'about:blank' && !currentUrl.includes('edge://newtab')) {
              console.log(`Page loaded despite timeout: ${currentUrl}`);
              status = 200;
              statusText = 'OK';
            }
          }
        }
      }
    }

    const finalUrl = page.url();
    const title = await page.title().catch(() => 'Unknown');
    const loadTime = Date.now() - openedAt;

    const viewport = page.viewportSize() || { width: 1280, height: 720 };
    const userAgent = await page.evaluate(() => navigator.userAgent);
    const cookies = await page.context().cookies();
    
    const urlObj = new URL(finalUrl);
    const isLocalDevServer = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
    const devPort = urlObj.port;
    
    const detectedFrameworks = await page.evaluate(() => {
      const frameworks: string[] = [];
      const win = window as any;
      
      if (typeof window !== 'undefined') {
        if (win.React || win.ReactDOM || document.querySelector('[data-reactroot]')) {
          frameworks.push('React');
        }
        if (win.Vue || document.querySelector('[data-v-]')) {
          frameworks.push('Vue');
        }
        if (win.angular || document.querySelector('[ng-version]') || document.querySelector('[ng-app]')) {
          frameworks.push('Angular');
        }
        if (win.svelte || document.querySelector('[data-svelte-h]')) {
          frameworks.push('Svelte');
        }
        if (win.__NEXT_DATA__) {
          frameworks.push('Next.js');
        }
        if (win.__NUXT__) {
          frameworks.push('Nuxt.js');
        }
        if (win.electronAPI || typeof win.require === 'function') {
          frameworks.push('Electron');
        }
        if (win.preact) {
          frameworks.push('Preact');
        }
        if (win.solidJS) {
          frameworks.push('SolidJS');
        }
        if (win.alpine) {
          frameworks.push('Alpine.js');
        }
      }
      
      return frameworks;
    });
    const hasLocalStorage = await page.evaluate(() => {
      try {
        return !!window.localStorage;
      } catch {
        return false;
      }
    });
    const hasSessionStorage = await page.evaluate(() => {
      try {
        return !!window.sessionStorage;
      } catch {
        return false;
      }
    });

    let screenshot: string | undefined;
    if (includeScreenshot) {
      try {
        const screenshotBuffer = await page.screenshot({ 
          type: 'png',
          fullPage: false 
        });
        screenshot = screenshotBuffer.toString('base64');
      } catch (err) {
        console.error('Failed to take screenshot:', err);
      }
    }

    performanceMetrics.domContentLoaded = domContentLoadedTime;
    performanceMetrics.loadComplete = loadCompleteTime;

    const sameUrlCount = Array.from(this.pages.values()).filter(p => p.url === url).length;
    const info = sameUrlCount >= 2 ? 
      `You have created ${sameUrlCount + 1} identical pages with this URL. If you need to refresh the page, please use the refresh_page tool instead.  If a refresh is required please close any unnecessary pages.` : 
      undefined;

    const finalId = Array.from(this.pages.entries()).find(([pid, p]) => p.page === page)?.[0] || id;

    return {
      id: finalId,
      url,
      finalUrl,
      status,
      statusText,
      title,
      consoleLogs,
      errors,
      loadTime,
      openedAt,
      error,
      performance: performanceMetrics,
      metadata: {
        viewport,
        userAgent,
        cookies: cookies.length,
        localStorage: hasLocalStorage,
        sessionStorage: hasSessionStorage
      },
      devContext: {
        isLocalDevServer,
        port: devPort,
        detectedFrameworks,
        note: isLocalDevServer ? `This is a local development server serving a web page${detectedFrameworks.length > 0 ? `. Detected frameworks: ${detectedFrameworks.join(', ')}` : ''}. The page is accessible via browser and can be interacted with normally.` : undefined
      },
      screenshot,
      info,
      browserEngineUsed: browser
    };
  }

  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable'
    };
    return statusTexts[status] || 'Unknown';
  }

  async executeJs(pageId: string, script: string, options: { includeScreenshot?: boolean } = {}): Promise<{ 
    success: boolean; 
    result?: any; 
    error?: string;
    executionTime: number;
    context?: {
      pageTitle?: string;
      pageUrl?: string;
      timestamp: number;
      scriptLength: number;
      scriptType: 'expression' | 'statement' | 'function' | 'unknown';
    };
    screenshot?: string;
  }> {
    const pageInfo = this.pages.get(pageId);
    if (!pageInfo) {
      return {
        success: false,
        error: `Page with id ${pageId} not found`,
        executionTime: 0,
        context: {
          timestamp: Date.now(),
          scriptLength: script.length,
          scriptType: 'unknown'
        }
      };
    }

    const { includeScreenshot = false } = options;
    const startTime = Date.now();
    let result: any;
    let error: string | undefined;

    const scriptType = this.detectScriptType(script);

    try {
      result = await pageInfo.page.evaluate(script);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    const executionTime = Date.now() - startTime;

    let pageTitle: string | undefined;
    let pageUrl: string | undefined;
    let screenshot: string | undefined;

    try {
      pageTitle = await pageInfo.page.title();
      pageUrl = pageInfo.page.url();
    } catch (err) {
      console.error('Failed to get page context:', err);
    }

    if (includeScreenshot && result !== undefined) {
      try {
        const screenshotBuffer = await pageInfo.page.screenshot({ 
          type: 'png',
          fullPage: false 
        });
        screenshot = screenshotBuffer.toString('base64');
      } catch (err) {
        console.error('Failed to take screenshot:', err);
      }
    }

    return {
      success: error === undefined,
      result,
      error,
      executionTime,
      context: {
        pageTitle,
        pageUrl,
        timestamp: Date.now(),
        scriptLength: script.length,
        scriptType
      },
      screenshot
    };
  }

  private detectScriptType(script: string): 'expression' | 'statement' | 'function' | 'unknown' {
    const trimmed = script.trim();
    
    if (trimmed.startsWith('function ') || trimmed.includes('=>')) {
      return 'function';
    }
    
    if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || 
        trimmed.startsWith('var ') || trimmed.startsWith('if ') || 
        trimmed.startsWith('for ') || trimmed.startsWith('while ') ||
        trimmed.startsWith('return ') || trimmed.startsWith('try ') ||
        trimmed.startsWith('{') || trimmed.endsWith('}')) {
      return 'statement';
    }
    
    if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('===')) {
      return 'statement';
    }
    
    return 'expression';
  }

  async closePage(pageId: string): Promise<{ success: boolean; message: string; id?: string }> {
    const pageInfo = this.pages.get(pageId);
    if (!pageInfo) {
      return {
        success: false,
        message: `Page with id ${pageId} not found`
      };
    }

    try {
      await this.withTimeout(this.destroyConsoleEnvironment(pageId), 5000, 'Destroy console environment');
    } catch (error) {
      console.error(`Failed to destroy console environment for ${pageId}:`, error);
    }

    try {
      await this.withTimeout(pageInfo.page.close(), 10000, 'Close page');
    } catch (error) {
      console.error(`Failed to close page ${pageId}:`, error);
      return {
        success: false,
        message: `Failed to close page ${pageId}: ${error instanceof Error ? error.message : String(error)}`
      };
    }

    if (pageInfo.browserType === 'edge' && this.edgeContext?.pages().length === 1) {
      await this.edgeContext.newPage();
    }

    this.pages.delete(pageId);
    return {
      success: true,
      message: `Page ${pageId} closed successfully`,
      id: pageId
    };
  }

  async reloadPage(pageId: string, options: { 
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    timeout?: number;
    includeScreenshot?: boolean;
  } = {}): Promise<{
    success: boolean;
    pageId: string;
    url: string;
    finalUrl: string;
    status: number;
    statusText: string;
    title: string;
    loadTime: number;
    reloadedAt: number;
    error?: string;
    screenshot?: string;
  }> {
    const pageInfo = this.pages.get(pageId);
    if (!pageInfo) {
      return {
        success: false,
        pageId,
        url: '',
        finalUrl: '',
        status: 0,
        statusText: 'Page not found',
        title: '',
        loadTime: 0,
        reloadedAt: Date.now()
      };
    }

    const { waitUntil = 'domcontentloaded', timeout = 30000, includeScreenshot = false } = options;
    const startTime = Date.now();
    
    let status = 0;
    let statusText = 'Unknown';
    let error: string | undefined;
    let response: any = null;

    try {
      response = await pageInfo.page.reload({ waitUntil, timeout });
      if (response) {
        status = response.status();
        statusText = response.statusText();
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    const loadTime = Date.now() - startTime;
    const reloadedAt = Date.now();

    let finalUrl = pageInfo.page.url();
    let title = '';
    let screenshot: string | undefined;

    try {
      title = await pageInfo.page.title();
    } catch (err) {
      console.error('Failed to get page title:', err);
    }

    if (includeScreenshot) {
      try {
        const screenshotBuffer = await pageInfo.page.screenshot({ 
          type: 'png',
          fullPage: false 
        });
        screenshot = screenshotBuffer.toString('base64');
      } catch (err) {
        console.error('Failed to take screenshot:', err);
      }
    }

    return {
      success: error === undefined,
      pageId,
      url: pageInfo.url,
      finalUrl,
      status,
      statusText,
      title,
      loadTime,
      reloadedAt,
      error,
      screenshot
    };
  }

  async listPages(): Promise<Array<{ 
    id: string; 
    url: string; 
    openedAt: number; 
    age: number;
    browserType: 'chrome' | 'edge';
  }>> {
    const now = Date.now();
    
    for (const [id, info] of this.pages.entries()) {
      if (info.page.isClosed()) {
        this.pages.delete(id);
      }
    }

    const pages = [];
    for (const [id, info] of this.pages.entries()) {
      pages.push({
        id,
        url: info.page.url(),
        openedAt: info.openedAt,
        age: now - info.openedAt,
        browserType: info.browserType
      });
    }

    return pages;
  }

  async closeAllPages(): Promise<number> {
    let closedCount = 0;
    
    const pageIds = Array.from(this.pages.keys());

    for (const id of pageIds) {
      const pageInfo = this.pages.get(id);
      if (pageInfo) {
        await this.destroyConsoleEnvironment(id);
        
        await pageInfo.page.close();
        this.pages.delete(id);
        closedCount++;
      }
    }

    if (this.edgeContext && this.edgeContext.pages().length === 0) {
      await this.edgeContext.newPage();
    }

    return closedCount;
  }

  async consoleExecute(
    pageId: string,
    code: string,
    options: { resetContext?: boolean } = {}
  ): Promise<ConsoleExecuteResult> {
    const { resetContext = false } = options;
    const environmentId = `console_${pageId}`;
    
    const pageInfo = this.pages.get(pageId);
    if (!pageInfo) {
      return { success: false, error: `Page with id ${pageId} not found`, executionTime: 0 };
    }

    if (resetContext && this.consoleEnvironments.has(environmentId)) {
      await this.destroyConsoleEnvironment(pageId);
    }

    if (!this.consoleEnvironments.has(environmentId)) {
      try {
        const client = await pageInfo.page.context().newCDPSession(pageInfo.page);
        this.consoleEnvironments.set(environmentId, {
          page: pageInfo.page,
          client,
          history:[],
          createdAt: Date.now()
        });
      } catch (err) {
        return { success: false, error: `Failed to init console CDP session: ${err instanceof Error ? err.message : String(err)}`, executionTime: 0 };
      }
    }

    const consoleEnv = this.consoleEnvironments.get(environmentId)!;
    const startTime = Date.now();
    let result: any;
    let error: string | undefined;
    let success = false;

    try {
      const response = await consoleEnv.client.send('Runtime.evaluate', {
        expression: code,
        includeCommandLineAPI: true,
        returnByValue: true,
        awaitPromise: true,
        replMode: true
      });

      if (response.exceptionDetails) {
        success = false;
        error = response.exceptionDetails.exception?.description || response.exceptionDetails.text;
      } else {
        success = true;
        result = response.result.value !== undefined ? response.result.value : response.result.description;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      success = false;
    }

    const executionTime = Date.now() - startTime;
    const preview = success ? this.generatePreview(result) : undefined;

    consoleEnv.history.push({ code, result, preview, timestamp: Date.now(), executionTime, success, error });
    if (consoleEnv.history.length > 100) {
      consoleEnv.history.shift();
    }

    return {
      success, result, preview, error, executionTime
    };
  }

  async getConsoleHistory(pageId: string): Promise<{ success: boolean; history?: Array<any>; error?: string; }> {
    const consoleEnv = this.consoleEnvironments.get(`console_${pageId}`);
    if (!consoleEnv) {
      return { success: false, error: `Console environment not found for page ${pageId}`, history:[] };
    }
    return { success: true, history: consoleEnv.history };
  }

  async destroyConsoleEnvironment(pageId: string): Promise<{ success: boolean; message: string }> {
    const environmentId = `console_${pageId}`;
    const consoleEnv = this.consoleEnvironments.get(environmentId);
    
    if (consoleEnv) {
      try {
        await consoleEnv.client.detach();
      } catch (e) {
        console.error(`Failed to detach CDP session for ${pageId}:`, e);
      }
      this.consoleEnvironments.delete(environmentId);
      return { success: true, message: `Console environment destroyed for page ${pageId}` };
    }
    return { success: false, message: `Console environment not found for page ${pageId}` };
  }

  async inspectElement(pageId: string, selector: string, stylesToGet?: string[]): Promise<any> {
    const pageInfo = this.pages.get(pageId);
    if (!pageInfo) return { success: false, error: `Page with id ${pageId} not found` };

    try {
      const element = pageInfo.page.locator(selector).first();
      
      const count = await element.count();
      if (count === 0) {
        return { success: false, error: `Element matching selector "${selector}" not found in DOM.` };
      }

      const isVisible = await element.isVisible();
      const boundingBox = await element.boundingBox();
      const html = await element.evaluate(el => el.outerHTML);

      const computedStyles = await element.evaluate((el, requestedStyles) => {
        const computed = window.getComputedStyle(el);
        const result: Record<string, string> = {};
        
        const defaultBoxModelStyles =[ 
          'display', 'position', 'box-sizing', 'visibility', 'opacity', 'z-index', 
          'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 
          'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 
          'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 
          'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 
          'border-style', 'border-color', 
          'top', 'right', 'bottom', 'left', 
          'color', 'background-color', 'font-size', 'line-height' 
        ];

        const stylesToQuery = (requestedStyles && requestedStyles.length > 0) ? requestedStyles : defaultBoxModelStyles;
        
        stylesToQuery.forEach(s => { 
          result[s] = computed.getPropertyValue(s); 
        });
        return result;
      }, stylesToGet);

      return { 
        success: true, 
        selector, 
        isVisible, 
        boundingBox: boundingBox || 'Element is not rendered or has no layout box (e.g. display: none)', 
        computedStyles, 
        htmlPreview: html.length > 800 ? html.substring(0, 800) + '...\n<!-- truncated -->' : html 
      };
    } catch (err) { 
      return { success: false, error: err instanceof Error ? err.message : String(err) }; 
    }
  }

  async simulateAction(pageId: string, selector: string, action: string, value?: string, options?: {
    x?: number;
    y?: number;
    targetSelector?: string;
    steps?: number;
    nonlinear?: boolean;
  }): Promise<any> {
    const pageInfo = this.pages.get(pageId);
    if (!pageInfo) return { success: false, error: `Page with id ${pageId} not found` };

    const { x, y, targetSelector, steps = 10, nonlinear = false } = options || {};

    try {
      switch (action) {
        case 'click':
          if (!selector) return { success: false, error: 'click action requires a selector parameter' };
          const clickElement = pageInfo.page.locator(selector).first();
          const clickCount = await clickElement.count();
          if (clickCount === 0) return { success: false, error: `Element matching selector "${selector}" not found in DOM.` };
          await clickElement.click({ timeout: 5000 });
          return { success: true, message: `Successfully clicked element matching selector "${selector}"` };

        case 'hover':
          if (!selector) return { success: false, error: 'hover action requires a selector parameter' };
          const hoverElement = pageInfo.page.locator(selector).first();
          const hoverCount = await hoverElement.count();
          if (hoverCount === 0) return { success: false, error: `Element matching selector "${selector}" not found in DOM.` };
          await hoverElement.hover({ timeout: 5000 });
          return { success: true, message: `Successfully hovered over element matching selector "${selector}"` };

        case 'fill':
          if (!selector) return { success: false, error: 'fill action requires a selector parameter' };
          const fillElement = pageInfo.page.locator(selector).first();
          const fillCount = await fillElement.count();
          if (fillCount === 0) return { success: false, error: `Element matching selector "${selector}" not found in DOM.` };
          await fillElement.fill(value || '', { timeout: 5000 });
          return { success: true, message: `Successfully filled element matching selector "${selector}" with value "${value}"` };

        case 'focus':
          if (!selector) return { success: false, error: 'focus action requires a selector parameter' };
          const focusElement = pageInfo.page.locator(selector).first();
          const focusCount = await focusElement.count();
          if (focusCount === 0) return { success: false, error: `Element matching selector "${selector}" not found in DOM.` };
          await focusElement.focus({ timeout: 5000 });
          return { success: true, message: `Successfully focused on element matching selector "${selector}"` };

        case 'pressDown':
          if (selector) {
            const element = pageInfo.page.locator(selector).first();
            const count = await element.count();
            if (count === 0) return { success: false, error: `Element matching selector "${selector}" not found in DOM.` };
            const position = await element.boundingBox();
            if (position) {
              const centerX = position.x + position.width / 2;
              const centerY = position.y + position.height / 2;
              await pageInfo.page.mouse.move(centerX, centerY);
              this.currentMousePos = { x: centerX, y: centerY };
            }
          } else if (x !== undefined && y !== undefined) {
            await pageInfo.page.mouse.move(x, y);
            this.currentMousePos = { x, y };
          } else {
            return { success: false, error: 'pressDown requires either selector or x/y coordinates' };
          }
          await pageInfo.page.mouse.down({ button: 'left' });
          return { success: true, message: 'Successfully pressed mouse down' };

        case 'release':
          await pageInfo.page.mouse.up({ button: 'left' });
          return { success: true, message: 'Successfully released mouse button' };

        case 'moveTo':
          if (targetSelector) {
            const targetElement = pageInfo.page.locator(targetSelector).first();
            const targetCount = await targetElement.count();
            if (targetCount === 0) {
              return { success: false, error: `Target element matching selector "${targetSelector}" not found in DOM.` };
            }
            const targetBox = await targetElement.boundingBox();
            if (targetBox) {
              const targetX = targetBox.x + targetBox.width / 2;
              const targetY = targetBox.y + targetBox.height / 2;
              if (nonlinear) {
                await this.moveWithNonlinearPath(pageInfo.page, targetX, targetY, steps);
              } else {
                await pageInfo.page.mouse.move(targetX, targetY, { steps });
                this.currentMousePos = { x: targetX, y: targetY };
              }
            }
          } else if (x !== undefined && y !== undefined) {
            if (nonlinear) {
              await this.moveWithNonlinearPath(pageInfo.page, x, y, steps);
            } else {
              await pageInfo.page.mouse.move(x, y, { steps });
              this.currentMousePos = { x, y };
            }
          } else {
            return { success: false, error: 'moveTo requires either x/y coordinates or targetSelector' };
          }
          return { success: true, message: 'Successfully moved mouse to target position' };

        default:
          return { success: false, error: `Unknown action: ${action}` };
      }

      return { success: true, message: `Successfully performed native '${action}' on ${selector}` };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private async moveWithNonlinearPath(page: Page, targetX: number, targetY: number, steps: number): Promise<void> {
    const startX = this.currentMousePos.x;
    const startY = this.currentMousePos.y;
    
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      
      const baseX = startX + (targetX - startX) * progress;
      const baseY = startY + (targetY - startY) * progress;
      
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;
      
      const x = baseX + offsetX;
      const y = baseY + offsetY;
      
      await page.mouse.move(x, y, { steps: 1 });
      this.currentMousePos = { x, y };
      await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
    }
    
    this.currentMousePos = { x: targetX, y: targetY };
  }

  private generatePreview(value: any, maxLength: number = 200): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    const type = typeof value;
    switch (type) {
      case 'string':
        return value.length > maxLength ? `"${value.substring(0, maxLength)}..."` : `"${value}"`;
      case 'number':
      case 'boolean':
        return value.toString();
      case 'object':
        if (Array.isArray(value)) {
          return `Array(${value.length})[${value.slice(0, 3).map(item => this.generatePreview(item, 30)).join(', ')}${value.length > 3 ? '...' : ''}]`;
        } else {
          const keys = Object.keys(value).slice(0, 3);
          const preview = keys.map(key => `${key}: ${this.generatePreview(value[key], 30)}`).join(', ');
          return `{${preview}${keys.length < Object.keys(value).length ? '...' : ''}}`;
        }
      case 'function':
        return value.toString().substring(0, maxLength);
      default:
        return String(value).substring(0, maxLength);
    }
  }

  private generateId(): string {
    return `page_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  async cleanup(): Promise<void> {
    for (const [envId, env] of this.consoleEnvironments.entries()) {
      try { await env.client.detach(); } catch (e) {}
    }
    this.consoleEnvironments.clear();

    if (this.localBrowser) {
      try {
        await this.localBrowser.close();
      } catch (e) {}
      this.localBrowser = null;
    }
    this.localContext = null;
    this.initLocalPromise = null;

    if (this.edgeContext) {
      try {
        const allPages = this.edgeContext.pages();
        for (const page of allPages) {
          try {
            await page.close();
          } catch (e) {}
        }
        await this.edgeContext.close();
      } catch (e) {}
      this.edgeContext = null;
    }
    this.initEdgePromise = null;
    
    this.pages.clear();
  }
}
