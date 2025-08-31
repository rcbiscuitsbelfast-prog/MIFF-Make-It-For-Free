#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { BridgeInspectorManager, InspectionConfig, BridgeInspectorOutput } from './Manager';
import { RenderPayload } from '../BridgeSchemaPure/schema';

const manager = new BridgeInspectorManager({
  validateSchema: true,
  validateEngineHints: true,
  validateSignals: true,
  validateMetadata: true,
  checkCrossEngineCompatibility: true,
  outputFormat: 'json',
  includeDetails: true,
  includeWarnings: true,
  maxIssuesPerCategory: 10
});

function printUsage(): void {
  console.log(`
BridgeInspectorPure CLI - Bridge inspection and validation tool for MIFF engine bridges

Usage:
  npx ts-node BridgeInspectorPure/cliHarness.ts <command> [options]

Commands:
  inspect <json-file>              Inspect renderData payload for bridge compatibility
  inspect-golden <test-path>...    Inspect multiple bridges from golden test files
  export <inspection-id> <output>  Export inspection results to file

Options:
  --no-schema                      Skip schema validation
  --no-engine-hints               Skip engine hints validation
  --no-signals                    Skip signals validation
  --no-metadata                   Skip metadata validation
  --no-compatibility              Skip cross-engine compatibility check
  --no-details                    Exclude detailed analysis
  --no-warnings                   Exclude warnings
  --max-issues <number>           Maximum issues per category [default: 10]
  --format <format>               Output format (json|markdown|html) [default: json]

Examples:
  # Inspect JSON payload
  npx ts-node BridgeInspectorPure/cliHarness.ts inspect payload.json --format html

  # Inspect golden tests
  npx ts-node BridgeInspectorPure/cliHarness.ts inspect-golden UnityBridgePure/tests/goldenBridge.test.ts WebBridgePure/tests/goldenBridge.test.ts

  # Export inspection results
  npx ts-node BridgeInspectorPure/cliHarness.ts export inspection_1234567890 inspection_report.html --format html
`);
}

function parseArgs(): { command: string; args: string[]; options: any } {
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);
  const options: any = {};

  // Parse options
  for (let i = 0; i < commandArgs.length; i++) {
    const arg = commandArgs[i];
    
    if (arg === '--no-schema') {
      options.validateSchema = false;
    } else if (arg === '--no-engine-hints') {
      options.validateEngineHints = false;
    } else if (arg === '--no-signals') {
      options.validateSignals = false;
    } else if (arg === '--no-metadata') {
      options.validateMetadata = false;
    } else if (arg === '--no-compatibility') {
      options.checkCrossEngineCompatibility = false;
    } else if (arg === '--no-details') {
      options.includeDetails = false;
    } else if (arg === '--no-warnings') {
      options.includeWarnings = false;
    } else if (arg === '--max-issues') {
      options.maxIssuesPerCategory = parseInt(commandArgs[++i]);
    } else if (arg === '--format') {
      options.outputFormat = commandArgs[++i];
    } else if (!arg.startsWith('--')) {
      // This is a positional argument
      continue;
    }
  }

  return { command, args: commandArgs.filter(arg => !arg.startsWith('--')), options };
}

function updateConfig(options: any): void {
  if (options.validateSchema !== undefined) {
    manager['config'].validateSchema = options.validateSchema;
  }
  if (options.validateEngineHints !== undefined) {
    manager['config'].validateEngineHints = options.validateEngineHints;
  }
  if (options.validateSignals !== undefined) {
    manager['config'].validateSignals = options.validateSignals;
  }
  if (options.validateMetadata !== undefined) {
    manager['config'].validateMetadata = options.validateMetadata;
  }
  if (options.checkCrossEngineCompatibility !== undefined) {
    manager['config'].checkCrossEngineCompatibility = options.checkCrossEngineCompatibility;
  }
  if (options.includeDetails !== undefined) {
    manager['config'].includeDetails = options.includeDetails;
  }
  if (options.includeWarnings !== undefined) {
    manager['config'].includeWarnings = options.includeWarnings;
  }
  if (options.maxIssuesPerCategory !== undefined) {
    manager['config'].maxIssuesPerCategory = options.maxIssuesPerCategory;
  }
  if (options.outputFormat) {
    manager['config'].outputFormat = options.outputFormat;
  }
}

function inspect(args: string[], options: any): void {
  if (args.length < 1) {
    console.error('Error: JSON file required');
    printUsage();
    process.exit(1);
  }

  const jsonFile = args[0];
  updateConfig(options);

  console.log(`🔍 Inspecting bridge compatibility: ${jsonFile}`);
  console.log(`📋 Schema validation: ${manager['config'].validateSchema ? 'Yes' : 'No'}`);
  console.log(`🎯 Engine hints validation: ${manager['config'].validateEngineHints ? 'Yes' : 'No'}`);
  console.log(`📡 Signals validation: ${manager['config'].validateSignals ? 'Yes' : 'No'}`);
  console.log(`📊 Metadata validation: ${manager['config'].validateMetadata ? 'Yes' : 'No'}`);
  console.log(`🔄 Compatibility check: ${manager['config'].checkCrossEngineCompatibility ? 'Yes' : 'No'}`);
  console.log(`📄 Format: ${manager['config'].outputFormat}`);
  console.log('');

  try {
    const payloadContent = fs.readFileSync(jsonFile, 'utf-8');
    const payload = JSON.parse(payloadContent);
    const result = manager.inspectPayload(payload);
    outputResult(result);
  } catch (error) {
    console.error(`Error reading JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

function inspectGolden(args: string[], options: any): void {
  if (args.length < 1) {
    console.error('Error: At least one test path required');
    printUsage();
    process.exit(1);
  }

  const testPaths = args;
  updateConfig(options);

  console.log(`🔍 Inspecting golden tests: ${testPaths.join(', ')}`);
  console.log(`📋 Schema validation: ${manager['config'].validateSchema ? 'Yes' : 'No'}`);
  console.log(`🎯 Engine hints validation: ${manager['config'].validateEngineHints ? 'Yes' : 'No'}`);
  console.log(`📡 Signals validation: ${manager['config'].validateSignals ? 'Yes' : 'No'}`);
  console.log(`📊 Metadata validation: ${manager['config'].validateMetadata ? 'Yes' : 'No'}`);
  console.log(`🔄 Compatibility check: ${manager['config'].checkCrossEngineCompatibility ? 'Yes' : 'No'}`);
  console.log(`📄 Format: ${manager['config'].outputFormat}`);
  console.log('');

  const result = manager.inspectGoldenTests(testPaths);
  outputResult(result);
}

function exportInspection(args: string[], options: any): void {
  if (args.length < 2) {
    console.error('Error: Inspection ID and output path required');
    printUsage();
    process.exit(1);
  }

  const inspectionId = args[0];
  const outputPath = args[1];
  updateConfig(options);

  console.log(`📤 Exporting inspection results: ${inspectionId}`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📄 Format: ${manager['config'].outputFormat}`);
  console.log('');

  // For demo purposes, create a sample inspection
  // In a real implementation, you'd load the inspection from storage
  const samplePayload: RenderPayload = {
    op: 'render',
    status: 'ok',
    renderData: [
      {
        id: 'demo_sprite',
        type: 'sprite',
        position: { x: 100, y: 200 },
        asset: 'demo.png',
        engineHints: {
          web: {
            element: 'sprite',
            canvas: 'gameCanvas'
          },
          unity: {
            gameObject: 'DemoSprite',
            component: 'SpriteRenderer'
          }
        },
        signals: [
          {
            name: 'click',
            parameters: ['event'],
            connectedTo: ['ClickHandler'],
            engine: 'web'
          }
        ]
      }
    ],
    metadata: {
      schemaVersion: 'v1',
      engine: 'web',
      timestamp: new Date().toISOString(),
      module: 'demo'
    }
  };

  const inspectionResult = manager.inspectPayload(samplePayload);
  if (inspectionResult.status === 'ok') {
    const exportResult = manager.exportInspection(inspectionResult.inspections, outputPath);
    
    if (exportResult.success) {
      console.log(`✅ Export successful: ${outputPath}`);
    } else {
      console.error(`❌ Export failed: ${exportResult.issues?.join(', ')}`);
      process.exit(1);
    }
  } else {
    console.error(`❌ Inspection failed: ${inspectionResult.issues?.join(', ')}`);
    process.exit(1);
  }
}

function outputResult(result: BridgeInspectorOutput): void {
  if (result.status === 'error') {
    console.error(`❌ Inspection failed:`);
    result.issues?.forEach(issue => {
      console.error(`  - ${issue}`);
    });
    process.exit(1);
  }

  const summary = result.summary;
  
  console.log(`✅ Inspection completed successfully!`);
  console.log(`📊 Total Bridges: ${summary.totalBridges}`);
  console.log(`❌ Total Issues: ${summary.totalIssues}`);
  console.log(`⚠️ Total Warnings: ${summary.totalWarnings}`);
  console.log(`🎯 Overall Status: ${summary.overallStatus.toUpperCase()}`);
  console.log('');

  // Show bridge details
  console.log('🔍 Bridge Details:');
  result.inspections.forEach((inspection, index) => {
    const statusIcon = inspection.summary.overallStatus === 'pass' ? '✅' : 
                      inspection.summary.overallStatus === 'warning' ? '⚠️' : '❌';
    
    console.log(`  ${index + 1}. ${statusIcon} ${inspection.bridge} (${inspection.engine})`);
    console.log(`     Schema: ${inspection.schemaVersion}`);
    console.log(`     RenderData: ${inspection.renderDataCount} items`);
    console.log(`     Issues: ${inspection.summary.totalIssues}`);
    console.log(`     Warnings: ${inspection.summary.totalWarnings}`);
    
    if (inspection.issues.length > 0) {
      console.log(`     Issues:`);
      inspection.issues.forEach(issue => {
        const severityIcon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`       ${severityIcon} ${issue.category}: ${issue.message}`);
      });
    }
    
    if (inspection.warnings.length > 0) {
      console.log(`     Warnings:`);
      inspection.warnings.forEach(warning => {
        console.log(`       ⚠️ ${warning.category}: ${warning.message}`);
        if (warning.suggestion) {
          console.log(`         Suggestion: ${warning.suggestion}`);
        }
      });
    }
    console.log('');
  });

  // Show summary statistics
  console.log('📈 Summary Statistics:');
  const engineStats: { [engine: string]: number } = {};
  const bridgeStats: { [bridge: string]: number } = {};
  
  result.inspections.forEach(inspection => {
    engineStats[inspection.engine] = (engineStats[inspection.engine] || 0) + 1;
    bridgeStats[inspection.bridge] = (bridgeStats[inspection.bridge] || 0) + 1;
  });

  console.log('  Engines:');
  Object.entries(engineStats).forEach(([engine, count]) => {
    console.log(`    ${engine}: ${count}`);
  });

  console.log('  Bridges:');
  Object.entries(bridgeStats).forEach(([bridge, count]) => {
    console.log(`    ${bridge}: ${count}`);
  });

  // Show JSON output if requested
  if (manager['config'].outputFormat === 'json') {
    console.log('\n📄 JSON Output:');
    console.log(JSON.stringify(result, null, 2));
  }
}

function main(): void {
  const { command, args, options } = parseArgs();

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  switch (command) {
    case 'inspect':
      inspect(args, options);
      break;
    case 'inspect-golden':
      inspectGolden(args, options);
      break;
    case 'export':
      exportInspection(args, options);
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      printUsage();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}