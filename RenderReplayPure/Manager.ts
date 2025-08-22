// RenderReplayPure - Visual replay tool for MIFF engine bridges
// Schema Version: v1

import { BridgeSchemaValidator, RenderData, RenderPayload } from '../BridgeSchemaPure/schema';
import fs from 'fs';
import path from 'path';

export interface ReplayConfig {
  engine: 'unity' | 'web' | 'godot';
  speed: number; // Replay speed multiplier
  loop: boolean; // Whether to loop the replay
  showDebug: boolean; // Show debug overlay
  outputFormat: 'json' | 'markdown' | 'html';
  timestamp: boolean; // Include timestamps in output
}

export interface ReplayStep {
  step: number;
  timestamp: string;
  renderData: RenderData[];
  issues?: string[];
  annotations?: string[];
}

export interface ReplaySession {
  sessionId: string;
  config: ReplayConfig;
  steps: ReplayStep[];
  summary: {
    totalSteps: number;
    totalRenderData: number;
    totalIssues: number;
    duration: string;
    engine: string;
  };
}

export interface RenderReplayOutput {
  op: 'replay';
  status: 'ok' | 'error';
  session: ReplaySession;
  issues?: string[];
}

export class RenderReplayManager {
  private config: ReplayConfig;

  constructor(config: ReplayConfig) {
    this.config = config;
  }

  /**
   * Replay renderData from a golden test file
   */
  replayFromGoldenTest(testPath: string): RenderReplayOutput {
    try {
      // Load golden test data
      const testData = this.loadGoldenTest(testPath);
      if (!testData) {
        return {
          op: 'replay',
          status: 'error',
          session: this.createEmptySession(),
          issues: [`Failed to load golden test: ${testPath}`]
        };
      }

      // Extract renderData from test
      const renderPayloads = this.extractRenderPayloads(testData);
      if (renderPayloads.length === 0) {
        return {
          op: 'replay',
          status: 'error',
          session: this.createEmptySession(),
          issues: ['No renderData found in golden test']
        };
      }

      // Create replay session
      const session = this.createReplaySession(renderPayloads);
      
      return {
        op: 'replay',
        status: 'ok',
        session,
        issues: []
      };
    } catch (error) {
      return {
        op: 'replay',
        status: 'error',
        session: this.createEmptySession(),
        issues: [`Replay failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Replay renderData from live CLI output
   */
  replayFromCLIOutput(cliOutput: string): RenderReplayOutput {
    try {
      // Parse CLI output
      const renderPayloads = this.parseCLIOutput(cliOutput);
      if (renderPayloads.length === 0) {
        return {
          op: 'replay',
          status: 'error',
          session: this.createEmptySession(),
          issues: ['No renderData found in CLI output']
        };
      }

      // Create replay session
      const session = this.createReplaySession(renderPayloads);
      
      return {
        op: 'replay',
        status: 'ok',
        session,
        issues: []
      };
    } catch (error) {
      return {
        op: 'replay',
        status: 'error',
        session: this.createEmptySession(),
        issues: [`Replay failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Replay renderData from JSON payload
   */
  replayFromPayload(payload: RenderPayload): RenderReplayOutput {
    try {
      // Validate payload
      const issues = BridgeSchemaValidator.validateRenderPayload(payload);
      if (issues.length > 0) {
        return {
          op: 'replay',
          status: 'error',
          session: this.createEmptySession(),
          issues
        };
      }

      // Create replay session
      const session = this.createReplaySession([payload]);
      
      return {
        op: 'replay',
        status: 'ok',
        session,
        issues: []
      };
    } catch (error) {
      return {
        op: 'replay',
        status: 'error',
        session: this.createEmptySession(),
        issues: [`Replay failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Export replay session to specified format
   */
  exportReplay(session: ReplaySession, outputPath: string): { success: boolean; issues?: string[] } {
    try {
      let content: string;

      switch (this.config.outputFormat) {
        case 'json':
          content = JSON.stringify(session, null, 2);
          break;
        case 'markdown':
          content = this.generateMarkdownReport(session);
          break;
        case 'html':
          content = this.generateHTMLReport(session);
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
   * Generate annotated replay log
   */
  generateAnnotatedLog(session: ReplaySession): string {
    const lines: string[] = [];
    
    lines.push(`# Render Replay Session: ${session.sessionId}`);
    lines.push(`Engine: ${session.summary.engine}`);
    lines.push(`Steps: ${session.summary.totalSteps}`);
    lines.push(`RenderData: ${session.summary.totalRenderData}`);
    lines.push(`Issues: ${session.summary.totalIssues}`);
    lines.push(`Duration: ${session.summary.duration}`);
    lines.push('');

    session.steps.forEach((step, index) => {
      lines.push(`## Step ${step.step} (${step.timestamp})`);
      
      if (step.annotations && step.annotations.length > 0) {
        lines.push('### Annotations:');
        step.annotations.forEach(annotation => {
          lines.push(`- ${annotation}`);
        });
        lines.push('');
      }

      if (step.issues && step.issues.length > 0) {
        lines.push('### Issues:');
        step.issues.forEach(issue => {
          lines.push(`- ⚠️ ${issue}`);
        });
        lines.push('');
      }

      lines.push('### RenderData:');
      step.renderData.forEach((data, dataIndex) => {
        lines.push(`#### ${dataIndex + 1}. ${data.type} (${data.id})`);
        lines.push(`- Position: ${JSON.stringify(data.position)}`);
        lines.push(`- Asset: ${data.asset || 'None'}`);
        
        if (data.children && data.children.length > 0) {
          lines.push(`- Children: ${data.children.length}`);
        }
        
        if (data.signals && data.signals.length > 0) {
          lines.push(`- Signals: ${data.signals.length}`);
        }
        
        if (data.engineHints) {
          const hints = Object.keys(data.engineHints).join(', ');
          lines.push(`- Engine Hints: ${hints}`);
        }
        lines.push('');
      });
    });

    return lines.join('\n');
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

  private parseCLIOutput(cliOutput: string): RenderPayload[] {
    const payloads: RenderPayload[] = [];
    const lines = cliOutput.split('\n');

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

    return payloads;
  }

  private createReplaySession(payloads: RenderPayload[]): ReplaySession {
    const sessionId = `replay_${Date.now()}`;
    const steps: ReplayStep[] = [];
    let totalRenderData = 0;
    let totalIssues = 0;

    payloads.forEach((payload, index) => {
      const step: ReplayStep = {
        step: index + 1,
        timestamp: new Date().toISOString(),
        renderData: payload.renderData || [],
        issues: payload.issues || [],
        annotations: this.generateAnnotations(payload, index)
      };

      steps.push(step);
      totalRenderData += step.renderData.length;
      totalIssues += step.issues.length;
    });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (steps.length * 1000 / this.config.speed));
    const duration = `${endTime.getTime() - startTime.getTime()}ms`;

    return {
      sessionId,
      config: this.config,
      steps,
      summary: {
        totalSteps: steps.length,
        totalRenderData,
        totalIssues,
        duration,
        engine: this.config.engine
      }
    };
  }

  private createEmptySession(): ReplaySession {
    return {
      sessionId: `replay_${Date.now()}`,
      config: this.config,
      steps: [],
      summary: {
        totalSteps: 0,
        totalRenderData: 0,
        totalIssues: 0,
        duration: '0ms',
        engine: this.config.engine
      }
    };
  }

  private generateAnnotations(payload: RenderPayload, stepIndex: number): string[] {
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
    }

    return annotations;
  }

  private generateMarkdownReport(session: ReplaySession): string {
    return this.generateAnnotatedLog(session);
  }

  private generateHTMLReport(session: ReplaySession): string {
    const lines: string[] = [];
    
    lines.push('<!DOCTYPE html>');
    lines.push('<html>');
    lines.push('<head>');
    lines.push('<title>Render Replay Report</title>');
    lines.push('<style>');
    lines.push('body { font-family: Arial, sans-serif; margin: 20px; }');
    lines.push('.step { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }');
    lines.push('.issue { color: #d32f2f; }');
    lines.push('.annotation { color: #1976d2; }');
    lines.push('.renderdata { background: #f5f5f5; padding: 10px; margin: 5px 0; }');
    lines.push('</style>');
    lines.push('</head>');
    lines.push('<body>');
    
    lines.push(`<h1>Render Replay Session: ${session.sessionId}</h1>`);
    lines.push(`<p><strong>Engine:</strong> ${session.summary.engine}</p>`);
    lines.push(`<p><strong>Steps:</strong> ${session.summary.totalSteps}</p>`);
    lines.push(`<p><strong>RenderData:</strong> ${session.summary.totalRenderData}</p>`);
    lines.push(`<p><strong>Issues:</strong> ${session.summary.totalIssues}</p>`);
    lines.push(`<p><strong>Duration:</strong> ${session.summary.duration}</p>`);

    session.steps.forEach(step => {
      lines.push(`<div class="step">`);
      lines.push(`<h2>Step ${step.step} (${step.timestamp})</h2>`);
      
      if (step.annotations && step.annotations.length > 0) {
        lines.push('<h3>Annotations:</h3>');
        lines.push('<ul>');
        step.annotations.forEach(annotation => {
          lines.push(`<li class="annotation">${annotation}</li>`);
        });
        lines.push('</ul>');
      }

      if (step.issues && step.issues.length > 0) {
        lines.push('<h3>Issues:</h3>');
        lines.push('<ul>');
        step.issues.forEach(issue => {
          lines.push(`<li class="issue">⚠️ ${issue}</li>`);
        });
        lines.push('</ul>');
      }

      lines.push('<h3>RenderData:</h3>');
      step.renderData.forEach((data, index) => {
        lines.push(`<div class="renderdata">`);
        lines.push(`<h4>${index + 1}. ${data.type} (${data.id})</h4>`);
        lines.push(`<p><strong>Position:</strong> ${JSON.stringify(data.position)}</p>`);
        lines.push(`<p><strong>Asset:</strong> ${data.asset || 'None'}</p>`);
        
        if (data.children && data.children.length > 0) {
          lines.push(`<p><strong>Children:</strong> ${data.children.length}</p>`);
        }
        
        if (data.signals && data.signals.length > 0) {
          lines.push(`<p><strong>Signals:</strong> ${data.signals.length}</p>`);
        }
        
        if (data.engineHints) {
          const hints = Object.keys(data.engineHints).join(', ');
          lines.push(`<p><strong>Engine Hints:</strong> ${hints}</p>`);
        }
        lines.push('</div>');
      });
      
      lines.push('</div>');
    });

    lines.push('</body>');
    lines.push('</html>');
    
    return lines.join('\n');
  }
}