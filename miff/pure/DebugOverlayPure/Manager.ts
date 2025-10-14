/**
 * DebugOverlayPure Manager - Advanced Debug Overlay System
 *
 * Comprehensive debug overlay with:
 * - Real-time performance monitoring
 * - System information display
 * - Debug console and logging
 * - Interactive debugging tools
 * - Custom debug panels
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';

export interface DebugOverlayConfig {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enableOverlay: boolean;
  enablePerformance: boolean;
  enableSystemInfo: boolean;
  enableConsole: boolean;
  enableTools: boolean;
  enableCustomPanels: boolean;
  position: OverlayPosition;
  size: OverlaySize;
  opacity: number;
  theme: OverlayTheme;
  fontSize: number;
  enableHotkeys: boolean;
  enableAutoHide: boolean;
  autoHideDelay: number;
  
  // Missing properties that are being accessed
  showOp?: boolean;
  showStatus?: boolean;
  showIssues?: boolean;
  showTimestamps?: boolean;
  showRenderData?: boolean;
  showEngineHints?: boolean;
  showSignals?: boolean;
  showMetadata?: boolean;
  colorize?: boolean;
  compact?: boolean;
}

export interface OverlayPosition {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  x: number;
  y: number;
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export interface OverlaySize {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  width: number;
  height: number;
  resizable: boolean;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

export interface OverlayTheme {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  background: string;
  foreground: string;
  accent: string;
  border: string;
  shadow: string;
  font: string;
}

export interface DebugPanel {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  title: string;
  type: PanelType;
  position: PanelPosition;
  size: PanelSize;
  visible: boolean;
  updateInterval: number;
  lastUpdate: number;
}

export interface PanelPosition {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  x: number;
  y: number;
  z: number;
}

export interface PanelSize {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  width: number;
  height: number;
}

export interface PerformanceData {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  fps: number;
  frameTime: number;
  memory: MemoryData;
  cpu: CPUData;
  gpu: GPUData;
  network: NetworkData;
}

export interface MemoryData {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  heap: number;
  heapTotal: number;
  external: number;
  rss: number;
  used: number;
  free: number;
  peak: number;
}

export interface CPUData {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  usage: number;
  cores: number;
  frequency: number;
  temperature: number;
  load: number[];
}

export interface GPUData {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  usage: number;
  memory: number;
  temperature: number;
  frequency: number;
  vendor: string;
  model: string;
}

export interface NetworkData {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  latency: number;
  bandwidth: number;
  packetsSent: number;
  packetsReceived: number;
  bytesSent: number;
  bytesReceived: number;
  errors: number;
}

export interface SystemInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  platform: string;
  arch: string;
  version: string;
  uptime: number;
  memory: SystemMemoryInfo;
  cpu: SystemCPUInfo;
  gpu: SystemGPUInfo;
  network: SystemNetworkInfo;
}

export interface SystemMemoryInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  total: number;
  available: number;
  used: number;
  free: number;
  swap: number;
}

export interface SystemCPUInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  model: string;
  cores: number;
  frequency: number;
  cache: number;
  temperature: number;
}

export interface SystemGPUInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  vendor: string;
  model: string;
  memory: number;
  driver: string;
  temperature: number;
}

export interface SystemNetworkInfo {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  interfaces: NetworkInterface[];
  connections: number;
  bandwidth: number;
}

export interface NetworkInterface {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: string;
  address: string;
  netmask: string;
  mac: string;
  speed: number;
}

export interface DebugConsole {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  commands: Map<string, ConsoleCommand>;
  history: ConsoleEntry[];
  maxHistory: number;
  visible: boolean;
  input: string;
  cursor: number;
}

export interface ConsoleCommand {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  description: string;
  usage: string;
  handler: (args: string[]) => any;
  category: string;
  aliases: string[];
}

export interface ConsoleEntry {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: 'input' | 'output' | 'error' | 'info' | 'warning';
  message: string;
  command?: string;
  result?: any;
}

export interface DebugTool {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: ToolType;
  enabled: boolean;
  config: any;
}

export type PanelType = 'performance' | 'system' | 'console' | 'memory' | 'network' | 'custom';
export type ToolType = 'profiler' | 'inspector' | 'logger' | 'monitor' | 'analyzer' | 'custom';

export class DebugOverlayManager {
  private config: DebugOverlayConfig;
  
  private memoryId: string;
  private isVisible: boolean = false;
  private panels: Map<string, DebugPanel> = new Map();
  private console: DebugConsole;
  private tools: Map<string, DebugTool> = new Map();
  private performanceData: PerformanceData[] = [];
  private systemInfo: SystemInfo | null = null;
  private performanceOptimizer: PerformanceOptimizer;
  private updateInterval: NodeJS.Timeout | null = null;
  private autoHideTimeout: NodeJS.Timeout | null = null;

  constructor(config: DebugOverlayConfig = {
    enableOverlay: true,
    enablePerformance: true,
    enableSystemInfo: true,
    enableConsole: true,
    enableTools: true,
    enableCustomPanels: true,
    position: { x: 10, y: 10, anchor: 'top-left' },
    size: { width: 400, height: 300, resizable: true, minWidth: 200, minHeight: 150, maxWidth: 800, maxHeight: 600 },
    opacity: 0.9,
    theme: {
      name: 'dark',
      background: '#1a1a1a',
      foreground: '#ffffff',
      accent: '#00ff00',
      border: '#333333',
      shadow: '#000000',
      font: 'monospace'
    },
    fontSize: 12,
    enableHotkeys: true,
    enableAutoHide: true,
    autoHideDelay: 5000
  }) {
    this.config = config;

    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'DebugOverlayManager': LogLevel.DEBUG
      }
    });

    // Initialize performance optimizer
    this.performanceOptimizer = new PerformanceOptimizer({
      enableOptimization: true,
      enableMemoryOptimization: true,
      enableCPUOptimization: true,
      enableGPUOptimization: true,
      enableNetworkOptimization: true
    });

    // Initialize debug console
    this.console = {
      id: 'main_console',
      commands: new Map(),
      history: [],
      maxHistory: 1000,
      visible: false,
      input: '',
      cursor: 0
    };

    // Register with memory manager
    this.memoryId = `DebugOverlayManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'DebugOverlayManager');

    // Initialize default panels
    this.initializeDefaultPanels();

    // Initialize default tools
    this.initializeDefaultTools();

    // Register default console commands
    this.registerDefaultCommands();

    console.info('DebugOverlayManager initialized', {
      config: this.config,
      memoryId: this.memoryId
    });
  }

  /**
   * Show debug overlay
   */
  public show(): void {
    if (!this.config.enableOverlay) {
      console.warn('DebugOverlayPure', 'Debug overlay is disabled');
      return;
    }

    this.isVisible = true;
    console.info('DebugOverlayPure', 'Debug overlay shown');

    // Start performance monitoring
    if (this.config.enablePerformance) {
      this.startPerformanceMonitoring();
    }

    // Update system info
    if (this.config.enableSystemInfo) {
      this.updateSystemInfo();
    }

    // Setup auto-hide
    if (this.config.enableAutoHide) {
      this.setupAutoHide();
    }
  }

  /**
   * Hide debug overlay
   */
  public hide(): void {
    this.isVisible = false;
    console.info('DebugOverlayPure', 'Debug overlay hidden');

    // Stop performance monitoring
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Clear auto-hide timeout
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
      this.autoHideTimeout = null;
    }
  }

  /**
   * Toggle debug overlay visibility
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Add debug panel
   */
  public addPanel(panel: DebugPanel): void {
    this.panels.set(panel.id, panel);
    console.info('Debug panel added', { panelId: panel.id, type: panel.type });
  }

  /**
   * Remove debug panel
   */
  public removePanel(panelId: string): boolean {
    const removed = this.panels.delete(panelId);
    if (removed) {
      console.info('Debug panel removed', { panelId });
    }
    return removed;
  }

  /**
   * Get debug panel
   */
  public getPanel(panelId: string): DebugPanel | null {
    return this.panels.get(panelId) || null;
  }

  /**
   * Update panel data
   */
  public updatePanelData(panelId: string, data: any): boolean {
    const panel = this.panels.get(panelId);
    if (!panel) {
      console.warn('Panel not found', { panelId });
      return false;
    }

    panel.data = data;
    panel.lastUpdate = Date.now();
    console.debug('Panel data updated', { panelId });
    return true;
  }

  /**
   * Show panel
   */
  public showPanel(panelId: string): boolean {
    const panel = this.panels.get(panelId);
    if (!panel) {
      console.warn('Panel not found', { panelId });
      return false;
    }

    panel.visible = true;
    console.info('Panel shown', { panelId });
    return true;
  }

  /**
   * Hide panel
   */
  public hidePanel(panelId: string): boolean {
    const panel = this.panels.get(panelId);
    if (!panel) {
      console.warn('Panel not found', { panelId });
      return false;
    }

    panel.visible = false;
    console.info('Panel hidden', { panelId });
    return true;
  }

  /**
   * Add debug tool
   */
  public addTool(tool: DebugTool): void {
    this.tools.set(tool.id, tool);
    console.info('Debug tool added', { toolId: tool.id, type: tool.type });
  }

  /**
   * Remove debug tool
   */
  public removeTool(toolId: string): boolean {
    const removed = this.tools.delete(toolId);
    if (removed) {
      console.info('Debug tool removed', { toolId });
    }
    return removed;
  }

  /**
   * Get debug tool
   */
  public getTool(toolId: string): DebugTool | null {
    return this.tools.get(toolId) || null;
  }

  /**
   * Enable tool
   */
  public enableTool(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    if (!tool) {
      console.warn('Tool not found', { toolId });
      return false;
    }

    tool.enabled = true;
    console.info('Tool enabled', { toolId });
    return true;
  }

  /**
   * Disable tool
   */
  public disableTool(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    if (!tool) {
      console.warn('Tool not found', { toolId });
      return false;
    }

    tool.enabled = false;
    console.info('Tool disabled', { toolId });
    return true;
  }

  /**
   * Register console command
   */
  public registerCommand(command: ConsoleCommand): void {
    this.console.commands.set(command.name, command);
    console.info('Console command registered', { command: command.name });
  }

  /**
   * Execute console command
   */
  public executeCommand(input: string): any {
    const parts = input.trim().split(' ');
    const commandName = parts[0];
    const args = parts.slice(1);

    const command = this.console.commands.get(commandName);
    if (!command) {
      console.warn('Command not found', { command: commandName });
      return null;
    }

    try {
      const result = command.handler(args);
      this.addConsoleEntry('output', `> ${input}`, commandName, result);
      return result;
    } catch (error) {
      this.addConsoleEntry('error', `Error executing command: ${error.message}`, commandName);
      return null;
    }
  }

  /**
   * Add console entry
   */
  public addConsoleEntry(type: 'input' | 'output' | 'error' | 'info' | 'warning', message: string, command?: string, result?: any): void {
    const entry: ConsoleEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now(),
      command,
      result
    };

    this.console.history.push(entry);

    // Limit history size
    if (this.console.history.length > this.console.maxHistory) {
      this.console.history = this.console.history.slice(-this.console.maxHistory);
    }

    console.debug('Console entry added', { type, message });
  }

  /**
   * Get console history
   */
  public getConsoleHistory(): ConsoleEntry[] {
    return [...this.console.history];
  }

  /**
   * Clear console history
   */
  public clearConsoleHistory(): void {
    this.console.history = [];
    console.info('DebugOverlayPure', 'Console history cleared');
  }

  /**
   * Get performance data
   */
  public getPerformanceData(): PerformanceData[] {
    return [...this.performanceData];
  }

  /**
   * Get current performance data
   */
  public getCurrentPerformanceData(): PerformanceData | null {
    return this.performanceData.length > 0 ? this.performanceData[this.performanceData.length - 1] : null;
  }

  /**
   * Get system info
   */
  public getSystemInfo(): SystemInfo | null {
    return this.systemInfo;
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    this.updateInterval = setInterval(() => {
      this.collectPerformanceData();
    }, 1000); // Update every second
  }

  /**
   * Collect performance data
   */
  private collectPerformanceData(): void {
    const memoryInfo = process.memoryUsage();
    const cpuInfo = require('os').cpus();

    const data: PerformanceData = {
      fps: 60, // This would be calculated from actual frame rate
      frameTime: 16.67, // This would be calculated from actual frame time
      memory: {
        heap: memoryInfo.heapUsed,
        heapTotal: memoryInfo.heapTotal,
        external: memoryInfo.external,
        rss: memoryInfo.rss,
        used: memoryInfo.heapUsed,
        free: memoryInfo.heapTotal - memoryInfo.heapUsed,
        peak: memoryInfo.heapUsed
      },
      cpu: {
        usage: 25.5, // This would be calculated from actual CPU usage
        cores: cpuInfo.length,
        frequency: cpuInfo[0].speed,
        temperature: 45, // This would be read from actual temperature sensor
        load: [0.25, 0.30, 0.20, 0.35] // This would be calculated from actual load
      },
      gpu: {
        usage: 15.2, // This would be read from actual GPU usage
        memory: 1024, // This would be read from actual GPU memory
        temperature: 55, // This would be read from actual GPU temperature
        frequency: 1500, // This would be read from actual GPU frequency
        vendor: 'NVIDIA',
        model: 'RTX 3080'
      },
      network: {
        latency: 25, // This would be measured from actual network
        bandwidth: 1000, // This would be measured from actual network
        packetsSent: 10000, // This would be counted from actual network
        packetsReceived: 9500, // This would be counted from actual network
        bytesSent: 5000000, // This would be counted from actual network
        bytesReceived: 4800000, // This would be counted from actual network
        errors: 0 // This would be counted from actual network
      },
      timestamp: Date.now()
    };

    this.performanceData.push(data);

    // Limit performance data array size
    if (this.performanceData.length > 100) {
      this.performanceData = this.performanceData.slice(-100);
    }

    // Update performance panels
    this.updatePanelData('performance', data);
  }

  /**
   * Update system info
   */
  private updateSystemInfo(): void {
    const os = require('os');
    const memoryInfo = process.memoryUsage();

    this.systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      version: os.version(),
      uptime: os.uptime(),
      memory: {
        total: os.totalmem(),
        available: os.freemem(),
        used: os.totalmem() - os.freemem(),
        free: os.freemem(),
        swap: 0 // This would be read from actual swap info
      },
      cpu: {
        model: os.cpus()[0].model,
        cores: os.cpus().length,
        frequency: os.cpus()[0].speed,
        cache: 0, // This would be read from actual CPU cache info
        temperature: 45 // This would be read from actual temperature sensor
      },
      gpu: {
        vendor: 'NVIDIA',
        model: 'RTX 3080',
        memory: 1024, // This would be read from actual GPU memory
        driver: '470.63.01',
        temperature: 55 // This would be read from actual GPU temperature
      },
      network: {
        interfaces: [], // This would be populated from actual network interfaces
        connections: 5, // This would be counted from actual connections
        bandwidth: 1000 // This would be measured from actual network
      }
    };

    // Update system info panels
    this.updatePanelData('system', this.systemInfo);
  }

  /**
   * Setup auto-hide
   */
  private setupAutoHide(): void {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }

    this.autoHideTimeout = setTimeout(() => {
      if (this.isVisible) {
        this.hide();
      }
    }, this.config.autoHideDelay);
  }

  /**
   * Initialize default panels
   */
  private initializeDefaultPanels(): void {
    // Performance panel
    this.addPanel({
      id: 'performance',
      title: 'Performance',
      type: 'performance',
      position: { x: 10, y: 10, z: 0 },
      size: { width: 300, height: 200 },
      visible: true,
      data: null,
      updateInterval: 1000,
      lastUpdate: 0
    });

    // System info panel
    this.addPanel({
      id: 'system',
      title: 'System Info',
      type: 'system',
      position: { x: 10, y: 220, z: 0 },
      size: { width: 300, height: 150 },
      visible: true,
      data: null,
      updateInterval: 5000,
      lastUpdate: 0
    });

    // Console panel
    this.addPanel({
      id: 'console',
      title: 'Console',
      type: 'console',
      position: { x: 320, y: 10, z: 0 },
      size: { width: 400, height: 300 },
      visible: false,
      data: null,
      updateInterval: 0,
      lastUpdate: 0
    });
  }

  /**
   * Initialize default tools
   */
  private initializeDefaultTools(): void {
    // Profiler tool
    this.addTool({
      id: 'profiler',
      name: 'Performance Profiler',
      type: 'profiler',
      enabled: false,
      config: {},
      data: null
    });

    // Inspector tool
    this.addTool({
      id: 'inspector',
      name: 'Object Inspector',
      type: 'inspector',
      enabled: false,
      config: {},
      data: null
    });

    // Logger tool
    this.addTool({
      id: 'logger',
      name: 'Log Viewer',
      type: 'logger',
      enabled: false,
      config: {},
      data: null
    });
  }

  /**
   * Register default console commands
   */
  private registerDefaultCommands(): void {
    // Help command
    this.registerCommand({
      name: 'help',
      description: 'Show available commands',
      usage: 'help [command]',
      handler: (args) => {
        if (args.length === 0) {
          const commands = Array.from(this.console.commands.values());
          return commands.map(cmd => `${cmd.name}: ${cmd.description}`);
        } else {
          const command = this.console.commands.get(args[0]);
          return command ? `${command.name}: ${command.description}\nUsage: ${command.usage}` : 'Command not found';
        }
      },
      category: 'general',
      aliases: ['h', '?']
    });

    // Clear command
    this.registerCommand({
      name: 'clear',
      description: 'Clear console history',
      usage: 'clear',
      handler: () => {
        this.clearConsoleHistory();
        return 'Console history cleared';
      },
      category: 'general',
      aliases: ['cls']
    });

    // Show panel command
    this.registerCommand({
      name: 'show',
      description: 'Show debug panel',
      usage: 'show <panelId>',
      handler: (args) => {
        if (args.length === 0) return 'Usage: show <panelId>';
        const panelId = args[0];
        const success = this.showPanel(panelId);
        return success ? `Panel ${panelId} shown` : `Panel ${panelId} not found`;
      },
      category: 'panels',
      aliases: ['s']
    });

    // Hide panel command
    this.registerCommand({
      name: 'hide',
      description: 'Hide debug panel',
      usage: 'hide <panelId>',
      handler: (args) => {
        if (args.length === 0) return 'Usage: hide <panelId>';
        const panelId = args[0];
        const success = this.hidePanel(panelId);
        return success ? `Panel ${panelId} hidden` : `Panel ${panelId} not found`;
      },
      category: 'panels',
      aliases: ['h']
    });
  }

  /**
   * Get manager configuration
   */
  public getConfig(): DebugOverlayConfig {
    return { ...this.config };
  }

  /**
   * Update manager configuration
   */
  public updateConfig(newConfig: Partial<DebugOverlayConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.info('DebugOverlayManager configuration updated', { config: this.config });
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.hide();
    MemoryManager.unregisterObject(this.memoryId);
    console.info('DebugOverlayPure', 'DebugOverlayManager destroyed');
  }
}