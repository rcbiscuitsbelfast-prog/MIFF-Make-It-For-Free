#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const readmePath = path.join(root, 'README.md');
let md = fs.readFileSync(readmePath, 'utf8');

const targets = [
  { label: 'Module Index', file: 'docs/MIFF_MODULE_INDEX_2025.md' },
  { label: 'Master Audit Report', file: 'docs/audit/Master_Audit_Report.md' },
  { label: 'Architecture Audit', file: 'docs/audit/arch/Architecture_Audit.md' },
  { label: 'Strategic Roadmap', file: 'docs/MIFF_NEXT_PHASE_ROADMAP_2025.md' },
  { label: 'Implementation Plan', file: 'docs/MIFF_IMPLEMENTATION_PLAN_2025.md' }
];

function formatDate(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

for (const t of targets) {
  const abs = path.join(root, t.file);
  if (!fs.existsSync(abs)) continue;
  const stat = fs.statSync(abs);
  const date = formatDate(stat.mtime);
  const re = new RegExp(`(\\*\\*\\[${t.label}\\]\([^)]*\)\\*\\*[^|]*\\|[^|]*\\|[^|]*\\| )\\$\{DATE\}( ?\\|)`, 'g');
  md = md.replace(re, `$1 ${date} |`);
}

fs.writeFileSync(readmePath, md);
console.log('README dates updated.');
