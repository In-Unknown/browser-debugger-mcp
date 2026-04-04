// StatsManager.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ToolStat {
  toolName: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  lastCalledAt: number | null;
  suggestions: Array<{
    text: string;
    timestamp: number;
  }>;
}

export interface ToolCallRecord {
  toolName: string;
  success: boolean;
  executionTime: number;
  timestamp: number;
  suggestion?: string;
}

export interface StatsData {
  toolStats: Array<{ key: string; value: ToolStat }>;
  callHistory: ToolCallRecord[];
  exportedAt: number;
  version: string;
}

export class StatsManager {
  private toolStats: Map<string, ToolStat> = new Map();
  private callHistory: ToolCallRecord[] = [];
  private maxHistorySize = 1000;
  private autoSaveCounter = 0;
  private autoSaveThreshold = 1;
  private filePath: string;
  
  constructor(filePath?: string) {
    this.filePath = filePath || join(__dirname, '..', 'stats.json');
  }

  recordCall(
    toolName: string,
    success: boolean,
    executionTime: number,
    suggestion?: string
  ): void {
    const timestamp = Date.now();
    
    let stat = this.toolStats.get(toolName);
    if (!stat) {
      stat = {
        toolName,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        lastCalledAt: null,
        suggestions: []
      };
      this.toolStats.set(toolName, stat);
    }

    stat.totalCalls++;
    if (success) {
      stat.successfulCalls++;
    } else {
      stat.failedCalls++;
    }
    
    stat.totalExecutionTime += executionTime;
    stat.averageExecutionTime = stat.totalExecutionTime / stat.totalCalls;
    stat.lastCalledAt = timestamp;

    if (suggestion && suggestion.trim()) {
      stat.suggestions.push({
        text: suggestion.trim(),
        timestamp
      });
      
      if (stat.suggestions.length > 100) {
        stat.suggestions = stat.suggestions.slice(-50);
      }
    }

    this.callHistory.push({
      toolName,
      success,
      executionTime,
      timestamp,
      suggestion
    });

    if (this.callHistory.length > this.maxHistorySize) {
      this.callHistory = this.callHistory.slice(-500);
    }

    this.autoSaveIfNeeded().catch((error) => {
      console.error('Auto-save failed:', error);
    });
  }

  getStats(): Map<string, ToolStat> {
    return new Map(this.toolStats);
  }

  getToolStats(toolName: string): ToolStat | null {
    return this.toolStats.get(toolName) || null;
  }

  getAllStats(): ToolStat[] {
    return Array.from(this.toolStats.values()).sort((a, b) => b.totalCalls - a.totalCalls);
  }

  getCallHistory(limit?: number): ToolCallRecord[] {
    const history = [...this.callHistory].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? history.slice(0, limit) : history;
  }

  getMostUsedTools(limit: number = 5): ToolStat[] {
    return this.getAllStats()
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, limit);
  }

  getLeastUsedTools(limit: number = 5): ToolStat[] {
    const allStats = this.getAllStats();
    return allStats
      .sort((a, b) => a.totalCalls - b.totalCalls)
      .slice(0, limit);
  }

  getSuccessRate(toolName?: string): number {
    if (toolName) {
      const stat = this.toolStats.get(toolName);
      if (!stat || stat.totalCalls === 0) return 0;
      return (stat.successfulCalls / stat.totalCalls) * 100;
    }

    const allStats = this.getAllStats();
    if (allStats.length === 0) return 0;

    let totalCalls = 0;
    let totalSuccess = 0;
    
    allStats.forEach(stat => {
      totalCalls += stat.totalCalls;
      totalSuccess += stat.successfulCalls;
    });

    return totalCalls === 0 ? 0 : (totalSuccess / totalCalls) * 100;
  }

  clearStats(): void {
    this.toolStats.clear();
    this.callHistory = [];
  }

  clearToolStats(toolName: string): boolean {
    return this.toolStats.delete(toolName);
  }

  async saveToFile(filePath?: string): Promise<void> {
    const path = filePath || this.filePath;
    try {
      const data: StatsData = {
        toolStats: Array.from(this.toolStats.entries()).map(([key, value]) => ({ key, value })),
        callHistory: this.callHistory,
        exportedAt: Date.now(),
        version: '1.0'
      };
      
      await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save stats to ${path}:`, error);
      // Don't rethrow - we don't want to crash the MCP server
    }
  }

  async loadFromFile(filePath?: string): Promise<boolean> {
    const path = filePath || this.filePath;
    try {
      const content = await fs.readFile(path, 'utf-8');
      const data: StatsData = JSON.parse(content);
      
      this.toolStats.clear();
      data.toolStats.forEach(({ key, value }) => {
        this.toolStats.set(key, value);
      });
      
      this.callHistory = data.callHistory;
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to load stats file:', error);
      }
      return false;
    }
  }

  async autoSaveIfNeeded(): Promise<void> {
    this.autoSaveCounter++;
    if (this.autoSaveCounter >= this.autoSaveThreshold) {
      await this.saveToFile();
      this.autoSaveCounter = 0;
    }
  }

  getFilePath(): string {
    return this.filePath;
  }

  setAutoSaveThreshold(threshold: number): void {
    this.autoSaveThreshold = Math.max(1, threshold);
  }

  exportStats(): {
    stats: ToolStat[];
    summary: {
      totalTools: number;
      totalCalls: number;
      overallSuccessRate: number;
      mostUsedTools: ToolStat[];
      leastUsedTools: ToolStat[];
      recentCalls: ToolCallRecord[];
    };
  } {
    const allStats = this.getAllStats();
    const totalCalls = allStats.reduce((sum, stat) => sum + stat.totalCalls, 0);
    
    return {
      stats: allStats,
      summary: {
        totalTools: allStats.length,
        totalCalls,
        overallSuccessRate: this.getSuccessRate(),
        mostUsedTools: this.getMostUsedTools(3),
        leastUsedTools: this.getLeastUsedTools(3),
        recentCalls: this.getCallHistory(10)
      }
    };
  }
}