#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import { runTimeline, QuestTimeline } from './index';

const inputFile = process.argv[2];
if (!inputFile) {
	console.error('Usage: ts-node cliHarness.ts <timeline-file>');
	process.exit(1);
}

try {
	const timeline: QuestTimeline = JSON.parse(fs.readFileSync(path.resolve(inputFile), 'utf-8'));
	const res = runTimeline(timeline);
	console.log(JSON.stringify(res, null, 2));
} catch (err) {
	console.error('Error:', err);
	process.exit(1);
}