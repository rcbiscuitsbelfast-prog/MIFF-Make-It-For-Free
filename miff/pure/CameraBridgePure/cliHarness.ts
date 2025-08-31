#!/usr/bin/env ts-node

import { follow, Camera, Vec2 } from './index';
import fs from 'fs';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: ts-node cliHarness.ts <input-file>');
  process.exit(1);
}

try {
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const camera: Camera = input.camera;
  const target: Vec2 = input.target;
  const alpha: number = input.alpha || 1;
  
  const result = follow(camera, target, alpha);
  console.log(JSON.stringify({
    op: 'camera.follow',
    status: 'ok',
    result
  }, null, 2));
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}