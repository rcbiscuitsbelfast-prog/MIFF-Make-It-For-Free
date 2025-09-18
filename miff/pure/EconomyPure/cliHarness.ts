#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { EconomyManager, PriceRule, VendorState } from './Manager';

type Command =
  | { op: 'list' }
  | { op: 'createRule'; rule: PriceRule }
  | { op: 'createVendor'; vendor: VendorState }
  | { op: 'simulate'; vendorId: string; itemId: string }
  | { op: 'simulateAll' }
  | { op: 'dumpRule'; id: string }
  | { op: 'dumpVendor'; id: string }
  | { op: 'export'; format?: 'json' | 'csv' | 'markdown' | 'html' }
  | { op: 'validate' };

type BootstrapData = { rules: PriceRule[]; vendors: VendorState[] };

function bootstrapManager(samplePath: string): EconomyManager {
  const manager = new EconomyManager();
  if (fs.existsSync(samplePath)) {
    const parsed = JSON.parse(fs.readFileSync(path.resolve(samplePath), 'utf-8')) as BootstrapData;
    for (const rule of parsed.rules) manager.createRule(rule);
    for (const vendor of parsed.vendors) manager.createVendor(vendor);
  }
  return manager;
}

function exportAs(format: string, manager: EconomyManager) {
  // Gather snapshot data
  const rules: any[] = [];
  const vendors: any[] = [];

  // Dump known ids via list(); then try to resolve entities
  for (const id of manager.list()) {
    const r = manager.dumpRule(id);
    if (r.result) rules.push(r.result);
    const v = manager.dumpVendor(id);
    if (v.result) vendors.push(v.result);
  }

  const snapshot = { rules, vendors };

  if (format === 'csv') {
    const ruleCsv = [
      'id,itemId,basePrice,modifiers',
      ...rules.map(r => `${r.id},${r.itemId},${r.basePrice},"${(r.modifiers||[]).map((m:any)=>`${m.key}:${m.value}`).join(';')}"`)
    ].join('\n');
    const vendorCsv = [
      'id,markup,markdown,inventory',
      ...vendors.map(v => `${v.id},${v.markup},${v.markdown},"${Object.entries(v.inventory).map(([k,val])=>`${k}:${val}`).join(';')}"`)
    ].join('\n');
    return { op: 'export', status: 'ok', format: 'csv', result: { rules: ruleCsv, vendors: vendorCsv }, issues: [] };
  }

  if (format === 'markdown') {
    const md = [
      '# Economy Snapshot',
      '',
      '## Price Rules',
      '',
      '| id | itemId | basePrice | modifiers |',
      '|----|--------|-----------|-----------|',
      ...rules.map(r => `| ${r.id} | ${r.itemId} | ${r.basePrice} | ${(r.modifiers||[]).map((m:any)=>`${m.key}:${m.value}`).join(', ')} |`),
      '',
      '## Vendors',
      '',
      '| id | markup | markdown | inventory |',
      '|----|--------|----------|-----------|',
      ...vendors.map(v => `| ${v.id} | ${v.markup} | ${v.markdown} | ${Object.entries(v.inventory).map(([k,val])=>`${k}:${val}`).join(', ')} |`)
    ].join('\n');
    return { op: 'export', status: 'ok', format: 'markdown', result: { markdown: md }, issues: [] };
  }

  if (format === 'html') {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Economy Snapshot</title>
<style>body{font-family:Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
</head><body>
  <h1>Economy Snapshot</h1>
  <h2>Price Rules</h2>
  <table><tr><th>id</th><th>itemId</th><th>basePrice</th><th>modifiers</th></tr>
  ${rules.map(r=>`<tr><td>${r.id}</td><td>${r.itemId}</td><td>${r.basePrice}</td><td>${(r.modifiers||[]).map((m:any)=>`${m.key}:${m.value}`).join(', ')}</td></tr>`).join('')}
  </table>
  <h2>Vendors</h2>
  <table><tr><th>id</th><th>markup</th><th>markdown</th><th>inventory</th></tr>
  ${vendors.map(v=>`<tr><td>${v.id}</td><td>${v.markup}</td><td>${v.markdown}</td><td>${Object.entries(v.inventory).map(([k,val])=>`${k}:${val}`).join(', ')}</td></tr>`).join('')}
  </table>
</body></html>`;
    return { op: 'export', status: 'ok', format: 'html', result: { html }, issues: [] };
  }

  return { op: 'export', status: 'ok', format: 'json', result: snapshot, issues: [] };
}

function validate(manager: EconomyManager) {
  const issues: string[] = [];
  // Simple validations
  // 1. Each rule must have a corresponding itemId string and non-negative basePrice
  for (const id of manager.list()) {
    const r = manager.dumpRule(id).result as any;
    if (r) {
      if (typeof r.itemId !== 'string' || r.itemId.length === 0) issues.push(`Rule ${r.id} has invalid itemId`);
      if (typeof r.basePrice !== 'number' || r.basePrice < 0) issues.push(`Rule ${r.id} has invalid basePrice`);
    }
  }
  return { op: 'validate', status: issues.length ? 'error' : 'ok', result: { issues }, issues: [] };
}

function main() {
  const sample = process.argv[2] || 'miff/pure/EconomyPure/sample_economy.json';
  const commands = process.argv[3] || '';

  const mgr = bootstrapManager(sample);
  const cmds: Command[] = commands ? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) : [{ op: 'list' } as Command];

  const outputs: any[] = [];
  for (const c of cmds) {
    switch (c.op) {
      case 'list':
        outputs.push({ op: 'list', status: 'ok', result: mgr.list(), issues: [] });
        break;
      case 'createRule':
        outputs.push(mgr.createRule(c.rule));
        break;
      case 'createVendor':
        outputs.push(mgr.createVendor(c.vendor));
        break;
      case 'simulate':
        outputs.push(mgr.calculatePrice(c.vendorId, c.itemId));
        break;
      case 'simulateAll': {
        // Simulate all vendor x item combos that have rules
        const sims: any[] = [];
        for (const id of mgr.list()) {
          const v = mgr.dumpVendor(id).result as VendorState | undefined;
          if (!v) continue;
          for (const itemId of Object.keys(v.inventory)) {
            sims.push({ vendorId: v.id, itemId, result: mgr.calculatePrice(v.id, itemId) });
          }
        }
        outputs.push({ op: 'simulateAll', status: 'ok', result: sims, issues: [] });
        break;
      }
      case 'dumpRule': {
        const r = mgr.dumpRule(c.id);
        outputs.push({ ...r, op: 'dumpRule' });
        break;
      }
      case 'dumpVendor': {
        const v = mgr.dumpVendor(c.id);
        outputs.push({ ...v, op: 'dumpVendor' });
        break;
      }
      case 'export':
        outputs.push(exportAs(c.format || 'json', mgr));
        break;
      case 'validate':
        outputs.push(validate(mgr));
        break;
      default:
        outputs.push({ op: (c as any).op, status: 'error', result: null, issues: [{ code: 'unknown_op', message: `Unknown op ${(c as any).op}` }] });
    }
  }
  console.log(JSON.stringify({ outputs }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();