// DebugOverlayPure - Real-time debug overlay for MIFF engine bridges
// Schema Version: v1

import { BridgeSchemaValidator, RenderData, RenderPayload } from '../BridgeSchemaPure/schema';
import fs from 'fs';
import path from 'path';

export interface DebugConfig {
  showOp: boolean;
  showStatus: boolean;
  showIssues: boolean;
  showTimestamps: boolean;
  showRenderData: boolean;
  showEngineHints: boolean;
  showSignals: boolean;
  showMetadata: boolean;
  colorize: boolean;
  compact: boolean;
  maxRenderDataItems: number;
  maxIssueLength: number;
  outputFormat: 'text' | 'json' | 'html';
}

export interface DebugInfo {
  op: string;
  status: string;
  issues?: string[];
  timestamp: string;
  renderDataCount: number;
  engineHints?: string[];
  signalsCount: number;
  metadata?: { [key: string]: any };
  performance?: {
    duration: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
}

export interface DebugOverlay {
  debugInfo: DebugInfo;
  renderData: RenderData[];
  issues: string[];
  annotations: string[];
}

export interface DebugOverlayOutput {
  op: 'debug';
  status: 'ok' | 'error';
  overlay: DebugOverlay;
  issues?: string[];
}

export class DebugOverlayManager {
  private config: DebugConfig;
  private startTime: number;

  constructor(config: DebugConfig) {
    this.config = config;
    this.startTime = Date.now();
  }

  /**
   * Create debug overlay from renderData payload
   */
  createOverlay(payload: RenderPayload): DebugOverlayOutput {
    try {
      // Validate payload
      const validationIssues = BridgeSchemaValidator.validateRenderPayload(payload);
      if (validationIssues.length > 0) {
        return {
          op: 'debug',
          status: 'error',
          overlay: this.createEmptyOverlay(),
          issues: validationIssues
        };
      }

      // Extract debug information
      const debugInfo = this.extractDebugInfo(payload);
      const renderData = this.extractRenderData(payload);
      const issues = payload.issues || [];
      const annotations = this.generateAnnotations(payload);

      const overlay: DebugOverlay = {
        debugInfo,
        renderData,
        issues,
        annotations
      };

      return {
        op: 'debug',
        status: 'ok',
        overlay,
        issues: []
      };
    } catch (error) {
      return {
        op: 'debug',
        status: 'error',
        overlay: this.createEmptyOverlay(),
        issues: [`Debug overlay failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Create debug overlay from live CLI output
   */
  createOverlayFromCLI(cliOutput: string): DebugOverlayOutput {
    try {
      // Parse CLI output
      const lines = cliOutput.split('\n');
      const payloads: RenderPayload[] = [];

      lines.forEach(line => {
        try {
          const parsed = JSON.parse(line.trim());
          if (parsed.renderData && Array.isArray(parsed.renderData)) {
            payloads.push(parsed);
          }
        } catch (error) {
          // Skip non-JSON lines
        }
      });

      if (payloads.length === 0) {
        return {
          op: 'debug',
          status: 'error',
          overlay: this.createEmptyOverlay(),
          issues: ['No renderData found in CLI output']
        };
      }

      // Create overlay from first payload (or combine multiple)
      return this.createOverlay(payloads[0]);
    } catch (error) {
      return {
        op: 'debug',
        status: 'error',
        overlay: this.createEmptyOverlay(),
        issues: [`CLI debug overlay failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Create debug overlay from golden test
   */
  createOverlayFromGoldenTest(testPath: string): DebugOverlayOutput {
    try {
      // Load golden test data
      const testData = this.loadGoldenTest(testPath);
      if (!testData) {
        return {
          op: 'debug',
          status: 'error',
          overlay: this.createEmptyOverlay(),
          issues: [`Failed to load golden test: ${testPath}`]
        };
      }

      // Extract renderData from test
      const renderPayloads = this.extractRenderPayloads(testData);
      if (renderPayloads.length === 0) {
        return {
          op: 'debug',
          status: 'error',
          overlay: this.createEmptyOverlay(),
          issues: ['No renderData found in golden test']
        };
      }

      // Create overlay from first payload
      return this.createOverlay(renderPayloads[0]);
    } catch (error) {
      return {
        op: 'debug',
        status: 'error',
        overlay: this.createEmptyOverlay(),
        issues: [`Golden test debug overlay failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Export debug overlay to specified format
   */
  exportOverlay(overlay: DebugOverlay, outputPath: string): { success: boolean; issues?: string[] } {
    try {
      let content: string;

      switch (this.config.outputFormat) {
        case 'text':
          content = this.generateTextReport(overlay);
          break;
        case 'json':
          content = JSON.stringify(overlay, null, 2);
          break;
        case 'html':
          content = this.generateHTMLReport(overlay);
          break;
        default:
          throw new Error(`Unsupported output format: ${this.config.outputFormat}`);
      }

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(outputPath, content, 'utf-8');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        issues: [`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Generate real-time debug display
   */
  generateDebugDisplay(overlay: DebugOverlay): string {
    const lines: string[] = [];
    
    // Header
    if (this.config.colorize) {
      lines.push('🔍 \x1b[36mDEBUG OVERLAY\x1b[0m');
    } else {
      lines.push('🔍 DEBUG OVERLAY');
    }
    lines.push('');

    // Debug Info
    if (this.config.showOp) {
      const opLine = `Operation: ${overlay.debugInfo.op}`;
      lines.push(this.config.colorize ? `\x1b[33m${opLine}\x1b[0m` : opLine);
    }

    if (this.config.showStatus) {
      const statusColor = overlay.debugInfo.status === 'ok' ? '\x1b[32m' : '\x1b[31m';
      const statusLine = `Status: ${overlay.debugInfo.status}`;
      lines.push(this.config.colorize ? `${statusColor}${statusLine}\x1b[0m` : statusLine);
    }

    if (this.config.showTimestamps) {
      const timestampLine = `Timestamp: ${overlay.debugInfo.timestamp}`;
      lines.push(this.config.colorize ? `\x1b[90m${timestampLine}\x1b[0m` : timestampLine);
    }

    if (this.config.showRenderData) {
      const renderDataLine = `RenderData: ${overlay.debugInfo.renderDataCount} items`;
      lines.push(this.config.colorize ? `\x1b[34m${renderDataLine}\x1b[0m` : renderDataLine);
    }

    if (this.config.showEngineHints && overlay.debugInfo.engineHints) {
      const hintsLine = `Engine Hints: ${overlay.debugInfo.engineHints.join(', ')}`;
      lines.push(this.config.colorize ? `\x1b[35m${hintsLine}\x1b[0m` : hintsLine);
    }

    if (this.config.showSignals) {
      const signalsLine = `Signals: ${overlay.debugInfo.signalsCount}`;
      lines.push(this.config.colorize ? `\x1b[36m${signalsLine}\x1b[0m` : signalsLine);
    }

    if (this.config.showPerformance && overlay.debugInfo.performance) {
      const perfLine = `Duration: ${overlay.debugInfo.performance.duration}ms`;
      lines.push(this.config.colorize ? `\x1b[90m${perfLine}\x1b[0m` : perfLine);
    }

    lines.push('');

    // Issues
    if (this.config.showIssues && overlay.issues.length > 0) {
      if (this.config.colorize) {
        lines.push('\x1b[31m⚠️ ISSUES:\x1b[0m');
      } else {
        lines.push('⚠️ ISSUES:');
      }
      
      overlay.issues.forEach(issue => {
        const truncatedIssue = this.config.maxIssueLength > 0 
          ? issue.substring(0, this.config.maxIssueLength) + (issue.length > this.config.maxIssueLength ? '...' : '')
          : issue;
        const issueLine = `  - ${truncatedIssue}`;
        lines.push(this.config.colorize ? `\x1b[31m${issueLine}\x1b[0m` : issueLine);
      });
      lines.push('');
    }

    // Annotations
    if (overlay.annotations.length > 0) {
      if (this.config.colorize) {
        lines.push('\x1b[32m📝 ANNOTATIONS:\x1b[0m');
      } else {
        lines.push('📝 ANNOTATIONS:');
      }
      
      overlay.annotations.forEach(annotation => {
        const annotationLine = `  - ${annotation}`;
        lines.push(this.config.colorize ? `\x1b[32m${annotationLine}\x1b[0m` : annotationLine);
      });
      lines.push('');
    }

    // RenderData Preview
    if (this.config.showRenderData && overlay.renderData.length > 0) {
      if (this.config.colorize) {
        lines.push('\x1b[34m🎨 RENDERDATA PREVIEW:\x1b[0m');
      } else {
        lines.push('🎨 RENDERDATA PREVIEW:');
      }
      
      const maxItems = this.config.maxRenderDataItems > 0 ? this.config.maxRenderDataItems : overlay.renderData.length;
      const itemsToShow = overlay.renderData.slice(0, maxItems);
      
      itemsToShow.forEach((data, index) => {
        const dataLine = `  ${index + 1}. ${data.type} (${data.id})`;
        lines.push(this.config.colorize ? `\x1b[34m${dataLine}\x1b[0m` : dataLine);
        
        if (data.position) {
          const posLine = `     Position: ${JSON.stringify(data.position)}`;
          lines.push(this.config.colorize ? `\x1b[90m${posLine}\x1b[0m` : posLine);
        }
        
        if (data.asset) {
          const assetLine = `     Asset: ${data.asset}`;
          lines.push(this.config.colorize ? `\x1b[90m${assetLine}\x1b[0m` : assetLine);
        }
      });
      
      if (overlay.renderData.length > maxItems) {
        const moreLine = `  ... and ${overlay.renderData.length - maxItems} more items`;
        lines.push(this.config.colorize ? `\x1b[90m${moreLine}\x1b[0m` : moreLine);
      }
    }

    return lines.join('\n');
  }

  private extractDebugInfo(payload: RenderPayload): DebugInfo {
    const duration = Date.now() - this.startTime;
    
    const engineHints = payload.renderData
      ?.map(data => data.engineHints)
      .filter(hints => hints)
      .map(hints => Object.keys(hints || {}))
      .flat() || [];

    const uniqueEngineHints = [...new Set(engineHints)];

    const signalsCount = payload.renderData
      ?.reduce((total, data) => total + (data.signals?.length || 0), 0) || 0;

    return {
      op: payload.op,
      status: payload.status,
      issues: payload.issues,
      timestamp: new Date().toISOString(),
      renderDataCount: payload.renderData?.length || 0,
      engineHints: uniqueEngineHints,
      signalsCount,
      metadata: payload.metadata,
      performance: {
        duration,
        memoryUsage: process.memoryUsage?.()?.heapUsed,
        cpuUsage: process.cpuUsage?.()
      }
    };
  }

  private extractRenderData(payload: RenderPayload): RenderData[] {
    return payload.renderData || [];
  }

  private generateAnnotations(payload: RenderPayload): string[] {
    const annotations: string[] = [];

    // Add operation annotation
    annotations.push(`Operation: ${payload.op}`);

    // Add status annotation
    annotations.push(`Status: ${payload.status}`);

    // Add renderData count annotation
    if (payload.renderData) {
      annotations.push(`RenderData Count: ${payload.renderData.length}`);
    }

    // Add engine-specific annotations
    if (payload.renderData && payload.renderData.length > 0) {
      const engineHints = payload.renderData
        .map(data => data.engineHints)
        .filter(hints => hints)
        .map(hints => Object.keys(hints || {}))
        .flat();

      const uniqueEngines = [...new Set(engineHints)];
      if (uniqueEngines.length > 0) {
        annotations.push(`Engine Hints: ${uniqueEngines.join(', ')}`);
      }
    }

    // Add metadata annotations
    if (payload.metadata) {
      if (payload.metadata.schemaVersion) {
        annotations.push(`Schema Version: ${payload.metadata.schemaVersion}`);
      }
      if (payload.metadata.module) {
        annotations.push(`Module: ${payload.metadata.module}`);
      }
      if (payload.metadata.engine) {
        annotations.push(`Engine: ${payload.metadata.engine}`);
      }
    }

    // Add performance annotations
    const duration = Date.now() - this.startTime;
    annotations.push(`Duration: ${duration}ms`);

    return annotations;
  }

  private createEmptyOverlay(): DebugOverlay {
    return {
      debugInfo: {
        op: 'unknown',
        status: 'error',
        timestamp: new Date().toISOString(),
        renderDataCount: 0,
        engineHints: [],
        signalsCount: 0
      },
      renderData: [],
      issues: [],
      annotations: []
    };
  }

  private loadGoldenTest(testPath: string): any {
    try {
      if (!fs.existsSync(testPath)) {
        return null;
      }

      const content = fs.readFileSync(testPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private extractRenderPayloads(testData: any): RenderPayload[] {
    const payloads: RenderPayload[] = [];

    // Extract from various test data structures
    if (testData.renderData) {
      payloads.push(testData);
    }

    if (testData.expected_output) {
      if (Array.isArray(testData.expected_output)) {
        payloads.push(...testData.expected_output);
      } else {
        payloads.push(testData.expected_output);
      }
    }

    if (testData.examples) {
      Object.values(testData.examples).forEach((example: any) => {
        if (example.unified) {
          payloads.push(example.unified);
        }
        if (example.renderData) {
          payloads.push(example);
        }
      });
    }

    return payloads.filter(payload => 
      payload.renderData && Array.isArray(payload.renderData)
    );
  }

  private generateTextReport(overlay: DebugOverlay): string {
    return this.generateDebugDisplay(overlay);
  }

  private generateHTMLReport(overlay: DebugOverlay): string {
    const lines: string[] = [];
    
    lines.push('<!DOCTYPE html>');
    lines.push('<html>');
    lines.push('<head>');
    lines.push('<title>Debug Overlay Report</title>');
    lines.push('<style>');
    lines.push('body { font-family: monospace; margin: 20px; background: #1e1e1e; color: #ffffff; }');
    lines.push('.header { color: #00ffff; font-size: 18px; font-weight: bold; margin-bottom: 20px; }');
    lines.push('.info { margin: 10px 0; }');
    lines.push('.op { color: #ffff00; }');
    lines.push('.status-ok { color: #00ff00; }');
    lines.push('.status-error { color: #ff0000; }');
    lines.push('.timestamp { color: #888888; }');
    lines.push('.renderdata { color: #0080ff; }');
    lines.push('.hints { color: #ff00ff; }');
    lines.push('.signals { color: #00ffff; }');
    lines.push('.performance { color: #888888; }');
    lines.push('.issues { color: #ff0000; }');
    lines.push('.annotations { color: #00ff00; }');
    lines.push('.section { margin: 20px 0; }');
    lines.push('.section-title { font-weight: bold; margin-bottom: 10px; }');
    lines.push('.item { margin: 5px 0; padding-left: 20px; }');
    lines.push('</style>');
    lines.push('</head>');
    lines.push('<body>');
    
    lines.push('<div class="header">🔍 DEBUG OVERLAY</div>');
    
    // Debug Info
    lines.push('<div class="section">');
    lines.push('<div class="section-title">Debug Information:</div>');
    lines.push(`<div class="info op">Operation: ${overlay.debugInfo.op}</div>`);
    lines.push(`<div class="info status-${overlay.debugInfo.status}">Status: ${overlay.debugInfo.status}</div>`);
    lines.push(`<div class="info timestamp">Timestamp: ${overlay.debugInfo.timestamp}</div>`);
    lines.push(`<div class="info renderdata">RenderData: ${overlay.debugInfo.renderDataCount} items</div>`);
    
    if (overlay.debugInfo.engineHints && overlay.debugInfo.engineHints.length > 0) {
      lines.push(`<div class="info hints">Engine Hints: ${overlay.debugInfo.engineHints.join(', ')}</div>`);
    }
    
    lines.push(`<div class="info signals">Signals: ${overlay.debugInfo.signalsCount}</div>`);
    
    if (overlay.debugInfo.performance) {
      lines.push(`<div class="info performance">Duration: ${overlay.debugInfo.performance.duration}ms</div>`);
    }
    lines.push('</div>');
    
    // Issues
    if (overlay.issues.length > 0) {
      lines.push('<div class="section">');
      lines.push('<div class="section-title issues">⚠️ ISSUES:</div>');
      overlay.issues.forEach(issue => {
        lines.push(`<div class="item issues">- ${issue}</div>`);
      });
      lines.push('</div>');
    }
    
    // Annotations
    if (overlay.annotations.length > 0) {
      lines.push('<div class="section">');
      lines.push('<div class="section-title annotations">📝 ANNOTATIONS:</div>');
      overlay.annotations.forEach(annotation => {
        lines.push(`<div class="item annotations">- ${annotation}</div>`);
      });
      lines.push('</div>');
    }
    
    // RenderData Preview
    if (overlay.renderData.length > 0) {
      lines.push('<div class="section">');
      lines.push('<div class="section-title renderdata">🎨 RENDERDATA PREVIEW:</div>');
      
      const maxItems = this.config.maxRenderDataItems > 0 ? this.config.maxRenderDataItems : overlay.renderData.length;
      const itemsToShow = overlay.renderData.slice(0, maxItems);
      
      itemsToShow.forEach((data, index) => {
        lines.push(`<div class="item renderdata">${index + 1}. ${data.type} (${data.id})</div>`);
        
        if (data.position) {
          lines.push(`<div class="item timestamp">   Position: ${JSON.stringify(data.position)}</div>`);
        }
        
        if (data.asset) {
          lines.push(`<div class="item timestamp">   Asset: ${data.asset}</div>`);
        }
      });
      
      if (overlay.renderData.length > maxItems) {
        lines.push(`<div class="item timestamp">... and ${overlay.renderData.length - maxItems} more items</div>`);
      }
      lines.push('</div>');
    }
    
    lines.push('</body>');
    lines.push('</html>');
    
    return lines.join('\n');
  }
}