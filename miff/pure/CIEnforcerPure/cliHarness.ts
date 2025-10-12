#!/usr/bin/env ts-node

import { enforceCIStandardsForModules, generateCIEnforcementReport } from './index';
import * as fs from 'fs';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    this.logger.error('Usage: ts-node cliHarness.ts <input-file>');
    process.exit(1);
  }

  try {
    const input = SafeJSONParser.parse(fs.readFileSync(inputFile, 'utf-8'));
    
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
    this.logger.info(JSON.stringify(report, null, 2));
    
    // Also output human-readable report if requested
    if (input.verbose) {
      this.logger.error('\n' + generateCIEnforcementReport(report));
    }
  } catch (error) {
    this.logger.error('Error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  this.logger.error('Unhandled error:', error);
  process.exit(1);
});