const fs = require('fs');
const path = require('path');

function fail(msg) {
	console.error(`[smoke] ${msg}`);
	process.exit(1);
}

const target = path.join(__dirname, 'site', 'zones', 'witcher_grove', 'index.html');
if (!fs.existsSync(target)) {
	fail(`Missing file: ${target}`);
}

const content = fs.readFileSync(target, 'utf-8');
if (!/<!doctype html>/i.test(content) || !/<html/i.test(content) || !/<body/i.test(content)) {
	fail('Malformed HTML: expected <!doctype html>, <html>, and <body>');
}

console.log('[smoke] Witcher Grove zone HTML looks valid:', target);
process.exit(0);

