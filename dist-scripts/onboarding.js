#!/usr/bin/env node
"use strict";
console.log('Welcome to MIFF!');
console.log('Start here:');
console.log('- PLACEHOLDER_AUDIT.md: repo hygiene findings');
console.log('- cleanup-checklist.md: track and resolve items');
console.log('- npm run lint:placeholders: scan for new placeholders and brittle defaults');
console.log('Suggested first tasks:');
console.log('- Remove or guard debug logs in modules flagged by the audit');
console.log('- Replace any `any` types with explicit, narrow types');
console.log('- Ensure browser builds reference compiled JS only');
