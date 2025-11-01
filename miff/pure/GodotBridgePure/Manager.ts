import { GodotBridge, GodotBridgeConfig, GodotBridgeOperation, GodotBridgeOutput } from './Bridge';

export enum GodotBridgeType {
  NODE = 'node',
  SCENE = 'scene',
  HYBRID = 'hybrid'
}

export interface GodotBridgeStatistics {
  totalMessages: number;
  errorRate: number;
  activeConnections: number;
  queueDepth: number;
}

export interface GodotBridgePerformanceMetrics {
  frameRate: number;
  targetFrameRate: number;
  vsyncEnabled: boolean;
  droppedFrames: number;
  lastFrameTime: number;
}

export interface GodotBridgeConfiguration {
  bridgeType: GodotBridgeType;
  communicationProtocol: string;
  godotVersion: string;
  targetPlatform: string;
  enableDebugLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
  maxMessageSize: number;
  timeout: number;
  retryAttempts: number;
  connectionPoolSize: number;
  serializationFormat: string;
  compression: string;
  encryption: boolean;
  heartbeatInterval: number;
  reconnectInterval: number;
  bufferSize: number;
  queueSize: number;
  batchSize: number;
  threadPoolSize: number;
  customSettings: Record<string, unknown>;
  language?: 'gdscript' | 'csharp';
  useSignals?: boolean;
  useAnimations?: boolean;
}

export class GodotBridgeManager {
  private readonly bridge: GodotBridge;
  private readonly configuration: GodotBridgeConfiguration;
  private readonly statistics: GodotBridgeStatistics = {
    totalMessages: 0,
    errorRate: 0,
    activeConnections: 0,
    queueDepth: 0
  };
  private readonly performance: GodotBridgePerformanceMetrics = {
    frameRate: 0,
    targetFrameRate: 60,
    vsyncEnabled: false,
    droppedFrames: 0,
    lastFrameTime: 0
  };
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  constructor(config: GodotBridgeConfiguration) {
    this.configuration = {
      ...config,
      bridgeType: config.bridgeType || GodotBridgeType.NODE,
      communicationProtocol: config.communicationProtocol?.toLowerCase?.() || 'gdnative',
      serializationFormat: config.serializationFormat || 'json',
      compression: config.compression || 'none'
    } as GodotBridgeConfiguration;
    this.bridge = new GodotBridge();
  }

  getConfiguration(): GodotBridgeConfiguration {
    return { ...this.configuration, customSettings: { ...this.configuration.customSettings } };
  }

  getStatistics(): GodotBridgeStatistics {
    return { ...this.statistics };
  }

  getPerformanceMetrics(): GodotBridgePerformanceMetrics {
    return { ...this.performance };
  }

  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionStatus;
  }

  connect(): void {
    this.connectionStatus = 'connected';
    this.statistics.activeConnections = 1;
  }

  disconnect(): void {
    this.connectionStatus = 'disconnected';
    this.statistics.activeConnections = 0;
  }

  simulate(module: string, data: any): GodotBridgeOutput {
    this.incrementMessages();
    return this.bridge.simulate(module, data, this.toBridgeConfig());
  }

  render(module: string, data: any): GodotBridgeOutput {
    this.incrementMessages();
    return this.bridge.render(module, data, this.toBridgeConfig());
  }

  interop(module: string, data: any): GodotBridgeOutput {
    this.incrementMessages();
    return this.bridge.interop(module, data, this.toBridgeConfig());
  }

  execute(operation: GodotBridgeOperation): GodotBridgeOutput {
    switch (operation.op) {
      case 'simulate':
        return this.simulate(operation.module, operation.data);
      case 'render':
        return this.render(operation.module, operation.data);
      case 'interop':
        return this.interop(operation.module, operation.data);
      case 'dump':
        return this.dump(operation.module);
      default:
        return {
          op: operation.op,
          status: 'error',
          issues: [`Unsupported operation: ${operation.op}`]
        } as GodotBridgeOutput;
    }
  }

  dump(module: string): GodotBridgeOutput {
    const render = this.render(module, {});
    return {
      op: 'dump',
      status: render.status,
      renderData: render.renderData,
      issues: render.issues,
      result: {
        info: {
          module,
          configuration: this.getConfiguration(),
          connectionStatus: this.connectionStatus
        }
      }
    } as GodotBridgeOutput;
  }

  private incrementMessages(): void {
    this.statistics.totalMessages += 1;
    if (this.statistics.activeConnections > 0 && this.statistics.queueDepth > 0) {
      this.statistics.queueDepth = Math.max(0, this.statistics.queueDepth - 1);
    }
  }

  private toBridgeConfig(): GodotBridgeConfig {
    const settings = this.configuration.customSettings || {};
    const language = (this.configuration.language || settings.language || 'gdscript') as 'gdscript' | 'csharp';
    const useSignals = Boolean(settings.useSignals ?? this.configuration.useSignals ?? true);
    const useAnimations = Boolean(settings.useAnimations ?? this.configuration.useAnimations ?? true);

    return {
      language,
      targetVersion: String(settings.targetVersion || this.configuration.godotVersion || '4.0'),
      projectPath: String(settings.projectPath || 'res://miff'),
      scriptPath: String(settings.scriptPath || 'res://miff/scripts'),
      scenePath: String(settings.scenePath || 'res://miff/scenes'),
      resourcePath: String(settings.resourcePath || 'res://miff/resources'),
      useSignals,
      useAnimations
    };
  }
}

export type { GodotBridgeOutput };
