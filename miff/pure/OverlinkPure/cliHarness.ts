#!/usr/bin/env -S node --no-warnings
import { runScenario } from './ScenarioPackOverlinkPure';

function main() {
  const args = process.argv.slice(2);
  const configFile = args[0];
  
  if (!configFile) {
    console.error('Usage: OverlinkPure/cliHarness.ts <config.json>');
    process.exit(1);
  }

  try {
    // Parse config file
    const config = JSON.parse(require('fs').readFileSync(configFile, 'utf-8'));
    
    // Run scenario with config
    const result = runScenario(config);
    
    // Output result as JSON
    console.log(JSON.stringify(result, null, 2));
    
    // Exit with error code if scenario failed
    if (result.status === 'error') {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) main();