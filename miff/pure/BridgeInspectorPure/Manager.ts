// BridgeInspectorPure - Bridge inspection and validation tool for MIFF engine bridges
// Schema Version: v1

import { BridgeSchemaValidator, RenderData, RenderPayload } from '../BridgeSchemaPure/schema';
import fs from 'fs';
import path from 'path';

export interface InspectionConfig {
  validateSchema: boolean;
  validateEngineHints: boolean;
  validateSignals: boolean;
  validateMetadata: boolean;
  checkCrossEngineCompatibility: boolean;
  outputFormat: 'json' | 'markdown' | 'html';
  includeDetails: boolean;
  includeWarnings: boolean;
  maxIssuesPerCategory: number;
}

export interface BridgeInspection {
  bridge: string;
  engine: string;
  schemaVersion: string;
  renderDataCount: number;
  issues: InspectionIssue[];
  warnings: InspectionWarning[];
  engineHints: EngineHintAnalysis;
  signals: SignalAnalysis;
  metadata: MetadataAnalysis;
  compatibility: CompatibilityAnalysis;
  summary: InspectionSummary;
}

export interface InspectionIssue {
  category: 'schema' | 'engine_hints' | 'signals' | 'metadata' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
  location?: string;
}

export interface InspectionWarning {
  category: string;
  message: string;
  suggestion?: string;
  impact?: string;
}

export interface EngineHintAnalysis {
  totalHints: number;
  engineSpecific: { [engine: string]: number };
  commonHints: string[];
  missingHints: string[];
  invalidHints: string[];
}

export interface SignalAnalysis {
  totalSignals: number;
  engineSpecific: { [engine: string]: number };
  signalTypes: { [type: string]: number };
  orphanedSignals: string[];
  invalidSignals: string[];
}

export interface MetadataAnalysis {
  hasSchemaVersion: boolean;
  hasTimestamp: boolean;
  hasModule: boolean;
  hasEngine: boolean;
  missingFields: string[];
  invalidFields: string[];
}

export interface CompatibilityAnalysis {
  crossEngineCompatible: boolean;
  engineSpecificFeatures: string[];
  compatibilityIssues: string[];
  conversionWarnings: string[];
}

export interface InspectionSummary {
  totalIssues: number;
  totalWarnings: number;
  schemaValid: boolean;
  engineHintsValid: boolean;
  signalsValid: boolean;
  metadataValid: boolean;
  compatibilityValid: boolean;
  overallStatus: 'pass' | 'fail' | 'warning';
}

export interface BridgeInspectorOutput {
  op: 'inspect';
  status: 'ok' | 'error';
  inspections: BridgeInspection[];
  summary: {
    totalBridges: number;
    totalIssues: number;
    totalWarnings: number;
    overallStatus: 'pass' | 'fail' | 'warning';
  };
  issues?: string[];
}

export class BridgeInspectorManager {
  private config: InspectionConfig;

  constructor(config: InspectionConfig) {
    this.config = config;
  }

  /**
   * Inspect renderData payload for bridge compatibility
   */
  inspectPayload(payload: RenderPayload): BridgeInspectorOutput {
    try {
      // Validate payload
      const validationIssues = BridgeSchemaValidator.validateRenderPayload(payload);
      if (validationIssues.length > 0) {
        return {
          op: 'inspect',
          status: 'error',
          inspections: [],
          summary: {
            totalBridges: 0,
            totalIssues: validationIssues.length,
            totalWarnings: 0,
            overallStatus: 'fail'
          },
          issues: validationIssues
        };
      }

      // Create inspection
      const inspection = this.createInspection(payload);
      
      return {
        op: 'inspect',
        status: 'ok',
        inspections: [inspection],
        summary: {
          totalBridges: 1,
          totalIssues: inspection.summary.totalIssues,
          totalWarnings: inspection.summary.totalWarnings,
          overallStatus: inspection.summary.overallStatus
        },
        issues: []
      };
    } catch (error) {
      return {
        op: 'inspect',
        status: 'error',
        inspections: [],
        summary: {
          totalBridges: 0,
          totalIssues: 1,
          totalWarnings: 0,
          overallStatus: 'fail'
        },
        issues: [`Inspection failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Inspect multiple bridges from golden tests
   */
  inspectGoldenTests(testPaths: string[]): BridgeInspectorOutput {
    try {
      const inspections: BridgeInspection[] = [];
      let totalIssues = 0;
      let totalWarnings = 0;

      for (const testPath of testPaths) {
        const testData = this.loadGoldenTest(testPath);
        if (!testData) {
          continue;
        }

        const renderPayloads = this.extractRenderPayloads(testData);
        for (const payload of renderPayloads) {
          const inspection = this.createInspection(payload, testPath);
          inspections.push(inspection);
          totalIssues += inspection.summary.totalIssues;
          totalWarnings += inspection.summary.totalWarnings;
        }
      }

      const overallStatus = this.determineOverallStatus(inspections);

      return {
        op: 'inspect',
        status: 'ok',
        inspections,
        summary: {
          totalBridges: inspections.length,
          totalIssues,
          totalWarnings,
          overallStatus
        },
        issues: []
      };
    } catch (error) {
      return {
        op: 'inspect',
        status: 'error',
        inspections: [],
        summary: {
          totalBridges: 0,
          totalIssues: 1,
          totalWarnings: 0,
          overallStatus: 'fail'
        },
        issues: [`Golden test inspection failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Export inspection results to specified format
   */
  exportInspection(inspections: BridgeInspection[], outputPath: string): { success: boolean; issues?: string[] } {
    try {
      let content: string;

      switch (this.config.outputFormat) {
        case 'json':
          content = JSON.stringify(inspections, null, 2);
          break;
        case 'markdown':
          content = this.generateMarkdownReport(inspections);
          break;
        case 'html':
          content = this.generateHTMLReport(inspections);
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

  private createInspection(payload: RenderPayload, source?: string): BridgeInspection {
    const issues: InspectionIssue[] = [];
    const warnings: InspectionWarning[] = [];

    // Schema validation
    if (this.config.validateSchema) {
      const schemaIssues = this.validateSchema(payload);
      issues.push(...schemaIssues);
    }

    // Engine hints analysis
    const engineHints = this.analyzeEngineHints(payload);
    if (this.config.validateEngineHints) {
      const hintIssues = this.validateEngineHints(engineHints);
      issues.push(...hintIssues);
    }

    // Signals analysis
    const signals = this.analyzeSignals(payload);
    if (this.config.validateSignals) {
      const signalIssues = this.validateSignals(signals);
      issues.push(...signalIssues);
    }

    // Metadata analysis
    const metadata = this.analyzeMetadata(payload);
    if (this.config.validateMetadata) {
      const metadataIssues = this.validateMetadata(metadata);
      issues.push(...metadataIssues);
    }

    // Cross-engine compatibility
    const compatibility = this.analyzeCompatibility(payload);
    if (this.config.checkCrossEngineCompatibility) {
      const compatibilityIssues = this.validateCompatibility(compatibility);
      issues.push(...compatibilityIssues);
    }

    // Generate warnings
    if (this.config.includeWarnings) {
      warnings.push(...this.generateWarnings(payload, engineHints, signals, metadata, compatibility));
    }

    // Create summary
    const summary = this.createSummary(issues, warnings, engineHints, signals, metadata, compatibility);

    return {
      bridge: this.determineBridge(payload),
      engine: this.determineEngine(payload),
      schemaVersion: payload.metadata?.schemaVersion || 'unknown',
      renderDataCount: payload.renderData?.length || 0,
      issues,
      warnings,
      engineHints,
      signals,
      metadata,
      compatibility,
      summary
    };
  }

  private validateSchema(payload: RenderPayload): InspectionIssue[] {
    const issues: InspectionIssue[] = [];
    const validationIssues = BridgeSchemaValidator.validateRenderPayload(payload);

    validationIssues.forEach(issue => {
      issues.push({
        category: 'schema',
        severity: 'error',
        message: issue,
        location: 'payload'
      });
    });

    return issues.slice(0, this.config.maxIssuesPerCategory);
  }

  private analyzeEngineHints(payload: RenderPayload): EngineHintAnalysis {
    const engineSpecific: { [engine: string]: number } = {};
    const commonHints: string[] = [];
    const missingHints: string[] = [];
    const invalidHints: string[] = [];

    let totalHints = 0;

    payload.renderData?.forEach(data => {
      if (data.engineHints) {
        Object.entries(data.engineHints).forEach(([engine, hints]) => {
          engineSpecific[engine] = (engineSpecific[engine] || 0) + 1;
          totalHints++;

          // Validate engine hints
          if (engine !== 'unity' && engine !== 'web' && engine !== 'godot') {
            invalidHints.push(`Unknown engine: ${engine}`);
          }
        });
      } else {
        missingHints.push(`No engine hints for ${data.id}`);
      }
    });

    return {
      totalHints,
      engineSpecific,
      commonHints,
      missingHints,
      invalidHints
    };
  }

  private validateEngineHints(engineHints: EngineHintAnalysis): InspectionIssue[] {
    const issues: InspectionIssue[] = [];

    engineHints.invalidHints.forEach(hint => {
      issues.push({
        category: 'engine_hints',
        severity: 'error',
        message: hint,
        details: { invalidHints: engineHints.invalidHints }
      });
    });

    if (engineHints.missingHints.length > 0) {
      issues.push({
        category: 'engine_hints',
        severity: 'warning',
        message: `${engineHints.missingHints.length} renderData items missing engine hints`,
        details: { missingHints: engineHints.missingHints }
      });
    }

    return issues.slice(0, this.config.maxIssuesPerCategory);
  }

  private analyzeSignals(payload: RenderPayload): SignalAnalysis {
    const engineSpecific: { [engine: string]: number } = {};
    const signalTypes: { [type: string]: number } = {};
    const orphanedSignals: string[] = [];
    const invalidSignals: string[] = [];

    let totalSignals = 0;

    payload.renderData?.forEach(data => {
      if (data.signals) {
        data.signals.forEach(signal => {
          totalSignals++;

          // Count by engine
          if (signal.engine) {
            engineSpecific[signal.engine] = (engineSpecific[signal.engine] || 0) + 1;
          } else {
            orphanedSignals.push(`Signal ${signal.name} has no engine specified`);
          }

          // Count by type
          signalTypes[signal.name] = (signalTypes[signal.name] || 0) + 1;

          // Validate signal
          if (!signal.name) {
            invalidSignals.push('Signal missing name');
          }
        });
      }
    });

    return {
      totalSignals,
      engineSpecific,
      signalTypes,
      orphanedSignals,
      invalidSignals
    };
  }

  private validateSignals(signals: SignalAnalysis): InspectionIssue[] {
    const issues: InspectionIssue[] = [];

    signals.invalidSignals.forEach(signal => {
      issues.push({
        category: 'signals',
        severity: 'error',
        message: signal,
        details: { invalidSignals: signals.invalidSignals }
      });
    });

    if (signals.orphanedSignals.length > 0) {
      issues.push({
        category: 'signals',
        severity: 'warning',
        message: `${signals.orphanedSignals.length} signals without engine specification`,
        details: { orphanedSignals: signals.orphanedSignals }
      });
    }

    return issues.slice(0, this.config.maxIssuesPerCategory);
  }

  private analyzeMetadata(payload: RenderPayload): MetadataAnalysis {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    const hasSchemaVersion = !!payload.metadata?.schemaVersion;
    const hasTimestamp = !!payload.metadata?.timestamp;
    const hasModule = !!payload.metadata?.module;
    const hasEngine = !!payload.metadata?.engine;

    if (!hasSchemaVersion) missingFields.push('schemaVersion');
    if (!hasTimestamp) missingFields.push('timestamp');
    if (!hasModule) missingFields.push('module');
    if (!hasEngine) missingFields.push('engine');

    // Validate schema version
    if (hasSchemaVersion && payload.metadata!.schemaVersion !== 'v1') {
      invalidFields.push(`Invalid schema version: ${payload.metadata!.schemaVersion}`);
    }

    return {
      hasSchemaVersion,
      hasTimestamp,
      hasModule,
      hasEngine,
      missingFields,
      invalidFields
    };
  }

  private validateMetadata(metadata: MetadataAnalysis): InspectionIssue[] {
    const issues: InspectionIssue[] = [];

    metadata.invalidFields.forEach(field => {
      issues.push({
        category: 'metadata',
        severity: 'error',
        message: field,
        details: { invalidFields: metadata.invalidFields }
      });
    });

    if (metadata.missingFields.length > 0) {
      issues.push({
        category: 'metadata',
        severity: 'warning',
        message: `Missing metadata fields: ${metadata.missingFields.join(', ')}`,
        details: { missingFields: metadata.missingFields }
      });
    }

    return issues.slice(0, this.config.maxIssuesPerCategory);
  }

  private analyzeCompatibility(payload: RenderPayload): CompatibilityAnalysis {
    const engineSpecificFeatures: string[] = [];
    const compatibilityIssues: string[] = [];
    const conversionWarnings: string[] = [];

    let crossEngineCompatible = true;

    payload.renderData?.forEach(data => {
      // Check for engine-specific features
      if (data.engineHints) {
        Object.keys(data.engineHints).forEach(engine => {
          if (engine === 'unity') {
            engineSpecificFeatures.push('Unity-specific components');
          } else if (engine === 'web') {
            engineSpecificFeatures.push('Web-specific elements');
          } else if (engine === 'godot') {
            engineSpecificFeatures.push('Godot-specific nodes');
          }
        });
      }

      // Check for conversion issues
      if (data.position && data.position.z !== undefined) {
        conversionWarnings.push('3D position may not convert well to 2D engines');
      }

      if (data.rotation && (data.rotation.x !== 0 || data.rotation.y !== 0)) {
        conversionWarnings.push('3D rotation may not convert well to 2D engines');
      }
    });

    if (engineSpecificFeatures.length > 0) {
      crossEngineCompatible = false;
      compatibilityIssues.push('Contains engine-specific features');
    }

    return {
      crossEngineCompatible,
      engineSpecificFeatures: [...new Set(engineSpecificFeatures)],
      compatibilityIssues,
      conversionWarnings
    };
  }

  private validateCompatibility(compatibility: CompatibilityAnalysis): InspectionIssue[] {
    const issues: InspectionIssue[] = [];

    if (!compatibility.crossEngineCompatible) {
      issues.push({
        category: 'compatibility',
        severity: 'warning',
        message: 'Not fully cross-engine compatible',
        details: { engineSpecificFeatures: compatibility.engineSpecificFeatures }
      });
    }

    compatibility.conversionWarnings.forEach(warning => {
      issues.push({
        category: 'compatibility',
        severity: 'info',
        message: warning,
        details: { conversionWarnings: compatibility.conversionWarnings }
      });
    });

    return issues.slice(0, this.config.maxIssuesPerCategory);
  }

  private generateWarnings(
    payload: RenderPayload,
    engineHints: EngineHintAnalysis,
    signals: SignalAnalysis,
    metadata: MetadataAnalysis,
    compatibility: CompatibilityAnalysis
  ): InspectionWarning[] {
    const warnings: InspectionWarning[] = [];

    // Performance warnings
    if (payload.renderData && payload.renderData.length > 100) {
      warnings.push({
        category: 'performance',
        message: 'Large number of renderData items may impact performance',
        suggestion: 'Consider batching or optimization',
        impact: 'High'
      });
    }

    // Engine hint warnings
    if (engineHints.missingHints.length > 0) {
      warnings.push({
        category: 'engine_hints',
        message: 'Missing engine hints may reduce optimization opportunities',
        suggestion: 'Add engine-specific hints for better performance',
        impact: 'Medium'
      });
    }

    // Signal warnings
    if (signals.orphanedSignals.length > 0) {
      warnings.push({
        category: 'signals',
        message: 'Signals without engine specification may not work correctly',
        suggestion: 'Specify target engine for all signals',
        impact: 'High'
      });
    }

    // Compatibility warnings
    if (!compatibility.crossEngineCompatible) {
      warnings.push({
        category: 'compatibility',
        message: 'Engine-specific features may limit portability',
        suggestion: 'Use cross-engine compatible features when possible',
        impact: 'Medium'
      });
    }

    return warnings;
  }

  private createSummary(
    issues: InspectionIssue[],
    warnings: InspectionWarning[],
    engineHints: EngineHintAnalysis,
    signals: SignalAnalysis,
    metadata: MetadataAnalysis,
    compatibility: CompatibilityAnalysis
  ): InspectionSummary {
    const errorIssues = issues.filter(issue => issue.severity === 'error');
    const warningIssues = issues.filter(issue => issue.severity === 'warning');

    const schemaValid = !issues.some(issue => issue.category === 'schema' && issue.severity === 'error');
    const engineHintsValid = !issues.some(issue => issue.category === 'engine_hints' && issue.severity === 'error');
    const signalsValid = !issues.some(issue => issue.category === 'signals' && issue.severity === 'error');
    const metadataValid = !issues.some(issue => issue.category === 'metadata' && issue.severity === 'error');
    const compatibilityValid = !issues.some(issue => issue.category === 'compatibility' && issue.severity === 'error');

    let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';
    if (errorIssues.length > 0) {
      overallStatus = 'fail';
    } else if (warningIssues.length > 0 || warnings.length > 0) {
      overallStatus = 'warning';
    }

    return {
      totalIssues: issues.length,
      totalWarnings: warnings.length,
      schemaValid,
      engineHintsValid,
      signalsValid,
      metadataValid,
      compatibilityValid,
      overallStatus
    };
  }

  private determineBridge(payload: RenderPayload): string {
    // Try to determine bridge from metadata
    if (payload.metadata?.module) {
      return payload.metadata.module;
    }

    // Try to determine from engine hints
    const engines = payload.renderData
      ?.map(data => data.engineHints)
      .filter(hints => hints)
      .map(hints => Object.keys(hints || {}))
      .flat() || [];

    const uniqueEngines = [...new Set(engines)];
    if (uniqueEngines.length > 0) {
      return `${uniqueEngines[0]}BridgePure`;
    }

    return 'UnknownBridge';
  }

  private determineEngine(payload: RenderPayload): string {
    // Try to determine from metadata
    if (payload.metadata?.engine) {
      return payload.metadata.engine;
    }

    // Try to determine from engine hints
    const engines = payload.renderData
      ?.map(data => data.engineHints)
      .filter(hints => hints)
      .map(hints => Object.keys(hints || {}))
      .flat() || [];

    const uniqueEngines = [...new Set(engines)];
    if (uniqueEngines.length > 0) {
      return uniqueEngines[0];
    }

    return 'unknown';
  }

  private determineOverallStatus(inspections: BridgeInspection[]): 'pass' | 'fail' | 'warning' {
    const hasFailures = inspections.some(inspection => inspection.summary.overallStatus === 'fail');
    const hasWarnings = inspections.some(inspection => inspection.summary.overallStatus === 'warning');

    if (hasFailures) return 'fail';
    if (hasWarnings) return 'warning';
    return 'pass';
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

  private generateMarkdownReport(inspections: BridgeInspection[]): string {
    const lines: string[] = [];
    
    lines.push('# Bridge Inspection Report');
    lines.push('');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Total Bridges: ${inspections.length}`);
    lines.push('');

    inspections.forEach((inspection, index) => {
      lines.push(`## ${index + 1}. ${inspection.bridge} (${inspection.engine})`);
      lines.push('');
      lines.push(`**Status:** ${inspection.summary.overallStatus.toUpperCase()}`);
      lines.push(`**Schema Version:** ${inspection.schemaVersion}`);
      lines.push(`**RenderData Count:** ${inspection.renderDataCount}`);
      lines.push(`**Issues:** ${inspection.summary.totalIssues}`);
      lines.push(`**Warnings:** ${inspection.summary.totalWarnings}`);
      lines.push('');

      if (inspection.issues.length > 0) {
        lines.push('### Issues');
        inspection.issues.forEach(issue => {
          const severity = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          lines.push(`- ${severity} **${issue.category}:** ${issue.message}`);
        });
        lines.push('');
      }

      if (inspection.warnings.length > 0) {
        lines.push('### Warnings');
        inspection.warnings.forEach(warning => {
          lines.push(`- ⚠️ **${warning.category}:** ${warning.message}`);
          if (warning.suggestion) {
            lines.push(`  - Suggestion: ${warning.suggestion}`);
          }
        });
        lines.push('');
      }

      if (this.config.includeDetails) {
        lines.push('### Engine Hints Analysis');
        lines.push(`- Total Hints: ${inspection.engineHints.totalHints}`);
        Object.entries(inspection.engineHints.engineSpecific).forEach(([engine, count]) => {
          lines.push(`- ${engine}: ${count}`);
        });
        lines.push('');

        lines.push('### Signals Analysis');
        lines.push(`- Total Signals: ${inspection.signals.totalSignals}`);
        Object.entries(inspection.signals.engineSpecific).forEach(([engine, count]) => {
          lines.push(`- ${engine}: ${count}`);
        });
        lines.push('');
      }
    });

    return lines.join('\n');
  }

  private generateHTMLReport(inspections: BridgeInspection[]): string {
    const lines: string[] = [];
    
    lines.push('<!DOCTYPE html>');
    lines.push('<html>');
    lines.push('<head>');
    lines.push('<title>Bridge Inspection Report</title>');
    lines.push('<style>');
    lines.push('body { font-family: Arial, sans-serif; margin: 20px; }');
    lines.push('.header { background: #f5f5f5; padding: 20px; border-radius: 5px; }');
    lines.push('.bridge { border: 1px solid #ccc; margin: 20px 0; padding: 20px; border-radius: 5px; }');
    lines.push('.status-pass { border-left: 5px solid #4caf50; }');
    lines.push('.status-fail { border-left: 5px solid #f44336; }');
    lines.push('.status-warning { border-left: 5px solid #ff9800; }');
    lines.push('.issue { margin: 10px 0; padding: 10px; border-radius: 3px; }');
    lines.push('.issue-error { background: #ffebee; border-left: 3px solid #f44336; }');
    lines.push('.issue-warning { background: #fff3e0; border-left: 3px solid #ff9800; }');
    lines.push('.issue-info { background: #e3f2fd; border-left: 3px solid #2196f3; }');
    lines.push('.warning { background: #fff3e0; padding: 10px; margin: 10px 0; border-radius: 3px; }');
    lines.push('</style>');
    lines.push('</head>');
    lines.push('<body>');
    
    lines.push('<div class="header">');
    lines.push('<h1>Bridge Inspection Report</h1>');
    lines.push(`<p><strong>Generated:</strong> ${new Date().toISOString()}</p>`);
    lines.push(`<p><strong>Total Bridges:</strong> ${inspections.length}</p>`);
    lines.push('</div>');

    inspections.forEach((inspection, index) => {
      lines.push(`<div class="bridge status-${inspection.summary.overallStatus}">`);
      lines.push(`<h2>${index + 1}. ${inspection.bridge} (${inspection.engine})</h2>`);
      lines.push(`<p><strong>Status:</strong> ${inspection.summary.overallStatus.toUpperCase()}</p>`);
      lines.push(`<p><strong>Schema Version:</strong> ${inspection.schemaVersion}</p>`);
      lines.push(`<p><strong>RenderData Count:</strong> ${inspection.renderDataCount}</p>`);
      lines.push(`<p><strong>Issues:</strong> ${inspection.summary.totalIssues}</p>`);
      lines.push(`<p><strong>Warnings:</strong> ${inspection.summary.totalWarnings}</p>`);

      if (inspection.issues.length > 0) {
        lines.push('<h3>Issues</h3>');
        inspection.issues.forEach(issue => {
          const severityClass = `issue-${issue.severity}`;
          const severityIcon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          lines.push(`<div class="issue ${severityClass}">`);
          lines.push(`${severityIcon} <strong>${issue.category}:</strong> ${issue.message}`);
          lines.push('</div>');
        });
      }

      if (inspection.warnings.length > 0) {
        lines.push('<h3>Warnings</h3>');
        inspection.warnings.forEach(warning => {
          lines.push('<div class="warning">');
          lines.push(`⚠️ <strong>${warning.category}:</strong> ${warning.message}`);
          if (warning.suggestion) {
            lines.push(`<br><strong>Suggestion:</strong> ${warning.suggestion}`);
          }
          lines.push('</div>');
        });
      }

      lines.push('</div>');
    });

    lines.push('</body>');
    lines.push('</html>');
    
    return lines.join('\n');
  }
}