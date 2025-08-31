import fs from 'fs';
import path from 'path';
import { GodotBridge, GodotBridgeOperation, GodotBridgeOutput, GodotBridgeConfig } from './Bridge';

const bridge = new GodotBridge();

function printUsage(): void {
  console.log(`
GodotBridgePure CLI Harness - Schema v1

Usage: npx ts-node GodotBridgePure/cliHarness.ts <command> [args...]

Commands:
  simulate <module> <dataFile> [configFile] - Simulate module with Godot bridge
  render <module> <dataFile> [configFile]   - Render module for Godot
  interop <module> <dataFile> [configFile]  - Interop with Godot data
  dump <module>                             - Dump module bridge info

Modules:
  npcs, combat, crafting, loot, economy, quests, stats, ui

Examples:
  npx ts-node GodotBridgePure/cliHarness.ts simulate npcs sample_npc_sim.json
  npx ts-node GodotBridgePure/cliHarness.ts render npcs sample_npc_render.json godot_config.json
  npx ts-node GodotBridgePure/cliHarness.ts interop npcs godot_npc_data.json
  npx ts-node GodotBridgePure/cliHarness.ts dump npcs
`);
}

function loadConfig(configFile?: string): GodotBridgeConfig {
  const defaultConfig: GodotBridgeConfig = {
    language: 'gdscript',
    targetVersion: '4.0',
    projectPath: 'godot_project/',
    scriptPath: 'res://miff/scripts/',
    scenePath: 'res://scenes/',
    resourcePath: 'res://resources/',
    useSignals: true,
    useAnimations: true
  };

  if (!configFile) {
    return defaultConfig;
  }

  try {
    const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    return { ...defaultConfig, ...configData };
  } catch (error) {
    console.warn(`Warning: Could not load config file ${configFile}, using defaults`);
    return defaultConfig;
  }
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0];
  let result: GodotBridgeOutput;

  try {
    switch (command) {
      case 'simulate':
        if (args.length < 3) {
          console.error('Error: Missing module and data file');
          process.exit(1);
        }
        const simModule = args[1];
        const simDataFile = args[2];
        const simConfigFile = args[3];
        
        const simData = JSON.parse(fs.readFileSync(simDataFile, 'utf-8'));
        const simConfig = loadConfig(simConfigFile);
        
        result = bridge.simulate(simModule, simData, simConfig);
        break;

      case 'render':
        if (args.length < 3) {
          console.error('Error: Missing module and data file');
          process.exit(1);
        }
        const renderModule = args[1];
        const renderDataFile = args[2];
        const renderConfigFile = args[3];
        
        const renderData = JSON.parse(fs.readFileSync(renderDataFile, 'utf-8'));
        const renderConfig = loadConfig(renderConfigFile);
        
        result = bridge.render(renderModule, renderData, renderConfig);
        break;

      case 'interop':
        if (args.length < 3) {
          console.error('Error: Missing module and data file');
          process.exit(1);
        }
        const interopModule = args[1];
        const interopDataFile = args[2];
        const interopConfigFile = args[3];
        
        const interopData = JSON.parse(fs.readFileSync(interopDataFile, 'utf-8'));
        const interopConfig = loadConfig(interopConfigFile);
        
        result = bridge.interop(interopModule, interopData, interopConfig);
        break;

      case 'dump':
        if (args.length < 2) {
          console.error('Error: Missing module');
          process.exit(1);
        }
        const dumpModule = args[1];
        
        // Dump bridge information for the module
        result = {
          op: 'dump',
          status: 'ok',
          renderData: {
            nodes: [],
            resources: [],
            scripts: [],
            scenes: [],
            animations: [],
            inputs: []
          }
        };
        break;

      default:
        console.error(`Error: Unknown command '${command}'`);
        printUsage();
        process.exit(1);
    }

    // Output in standardized format
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    const errorResult: GodotBridgeOutput = {
      op: command,
      status: 'error',
      issues: [error instanceof Error ? error.message : String(error)]
    };
    console.log(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}