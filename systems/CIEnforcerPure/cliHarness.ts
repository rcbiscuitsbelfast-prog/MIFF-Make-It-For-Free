#!/usr/bin/env ts-node

import { enforceCIStandardsForModules, generateCIEnforcementReport } from './index';
import * as fs from 'fs';

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: ts-node cliHarness.ts <input-file>');
    process.exit(1);
  }

  try {
    const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.modulePaths || !Array.isArray(input.modulePaths)) {
      throw new Error('Invalid input: missing required field "modulePaths" (array)');
    }
    
    const modulePaths: string[] = input.modulePaths;
    
    // Enforce CI standards for all modules
    const report = await enforceCIStandardsForModules(modulePaths);
    
    // Output JSON result
    console.log(JSON.stringify(report, null, 2));
    
    // Also output human-readable report if requested
    if (input.verbose) {
      console.error('\n' + generateCIEnforcementReport(report));
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});