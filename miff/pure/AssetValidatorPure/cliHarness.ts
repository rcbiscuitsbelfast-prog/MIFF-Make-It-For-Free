#!/usr/bin/env ts-node

import { validateAssetBundle, AssetReference, AssetManifest } from './index';
import * as fs from 'fs';

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
  
  if (!input.scenarioAssets || !input.manifestAssets) {
    throw new Error('Invalid input: missing required fields "scenarioAssets" and "manifestAssets"');
  }
  
  const scenarioAssets: AssetReference[] = input.scenarioAssets;
  const manifestAssets: AssetManifest = input.manifestAssets;
  const platform = input.platform || 'all';
  const strictMode = input.strictMode !== false; // Default to true
  
  const result = validateAssetBundle(scenarioAssets, manifestAssets, platform, strictMode);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}