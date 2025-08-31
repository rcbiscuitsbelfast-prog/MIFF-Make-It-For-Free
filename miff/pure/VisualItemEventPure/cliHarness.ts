#!/usr/bin/env ts-node

import fs from 'fs';
import { resolve, VisualItemEvent } from './index';

const inputFile = process.argv[2];
if (!inputFile) {
	console.error('Usage: ts-node cliHarness.ts <input-file>');
	process.exit(1);
}

try {
	const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
	const event: VisualItemEvent = input.event || { type: 'helmet.split' };
	const opts = input.options || {};
	const out = resolve(event, opts);
	console.log(JSON.stringify(out, null, 2));
} catch (err) {
	console.error('Error:', err);
	process.exit(1);
}