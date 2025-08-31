import fs from 'fs';
import path from 'path';
import { WebBridge, WebBridgeOperation, WebBridgeOutput, WebBridgeConfig } from './Bridge';

const bridge = new WebBridge();

function printUsage(): void {
  console.log(`
WebBridgePure CLI Harness - Schema v1

Usage: npx ts-node WebBridgePure/cliHarness.ts <command> [args...]

Commands:
  simulate <module> <dataFile> [configFile] - Simulate module with web bridge
  render <module> <dataFile> [configFile]   - Render module for web
  interop <module> <dataFile> [configFile]  - Interop with web data
  dump <module>                             - Dump module bridge info

Modules:
  npcs, combat, crafting, loot, economy, quests, stats, ui

Examples:
  npx ts-node WebBridgePure/cliHarness.ts simulate npcs sample_npc_sim.json
  npx ts-node WebBridgePure/cliHarness.ts render npcs sample_npc_render.json web_config.json
  npx ts-node WebBridgePure/cliHarness.ts interop npcs web_npc_data.json
  npx ts-node WebBridgePure/cliHarness.ts dump npcs
`);
}

function loadConfig(configFile?: string): WebBridgeConfig {
  const defaultConfig: WebBridgeConfig = {
    renderer: 'phaser',
    targetVersion: '3.60',
    assetPath: 'assets/',
    scriptPath: 'js/',
    stylePath: 'css/',
    useWebGL: true
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
  let result: WebBridgeOutput;

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
            entities: [],
            components: [],
            sprites: [],
            sounds: [],
            scripts: [],
            styles: []
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
    const errorResult: WebBridgeOutput = {
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