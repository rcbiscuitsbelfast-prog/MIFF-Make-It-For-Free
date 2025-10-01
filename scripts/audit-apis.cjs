#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findFile(p) {
  const abs = path.resolve(p);
  return fs.existsSync(abs) ? abs : null;
}

function read(p) { return fs.readFileSync(p, 'utf8'); }

function main() {
  const date = process.env.DATE || new Date().toISOString().slice(0, 10);
  const outDir = path.resolve('docs/archive/test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${date}-api-validation.txt`);

  const results = [];

  // ExportPipelinePure methods
  const exportFile = findFile('miff/pure/ExportPipelinePure.ts');
  if (exportFile) {
    const src = read(exportFile);
    results.push(audit(src, 'ExportPipelinePure.performExport()', /performExport\(/, /fs\.writeFileSync|mkdirSync/));
    results.push(audit(src, 'ExportPipelinePure.convertToWeb()', /convertToWeb\(/, /ConvertToWebManager|BridgeSchemaValidator/));
  } else {
    results.push({ name: 'ExportPipelinePure', status: 'missing', notes: ['file not found'] });
  }

  // WebBridgePure compileWebAssembly
  const webBridge = findFile('miff/pure/WebBridgePure/index.ts');
  if (webBridge) {
    const src = read(webBridge);
    results.push(audit(src, 'WebBridgePure.compileWebAssembly()', /compileWebAssembly\(/, /WebAssembly\.Memory|instantiate|optimizationLevel/));
  } else {
    results.push({ name: 'WebBridgePure', status: 'missing', notes: ['file not found'] });
  }

  const lines = [];
  lines.push(`# API Validation ${date}`);
  for (const r of results) {
    lines.push(`\n## ${r.name}`);
    lines.push(`- Status: ${r.status}`);
    if (r.notes && r.notes.length) lines.push(`- Notes: ${r.notes.join('; ')}`);
  }
  fs.writeFileSync(out, lines.join('\n'));
  process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
}

function audit(src, name, mustHave, realIndicators) {
  const hasFn = mustHave.test(src);
  const hasReal = realIndicators.test(src);
  return { name, status: hasFn ? (hasReal ? 'real' : 'mock?') : 'missing', notes: [] };
}

if (require.main === module) main();

