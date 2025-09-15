#!/usr/bin/env node
import { readdir, readFile, stat, access } from 'node:fs/promises';
import { constants as FS_CONSTANTS } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const INCLUDE_DIRS = ['games', 'scripts', 'modules', 'systems', 'sampler', 'zones', 'miff', 'src'];
const PLACEHOLDER_PATTERNS = [
    { re: /\bTODO\b/i, type: 'TODO' },
    { re: /\bFIXME\b/i, type: 'FIXME' },
    { re: /\bstub(?:bed)?\b/i, type: 'STUB' },
    { re: /\bplaceholder\b/i, type: 'PLACEHOLDER' },
    { re: /\bdummy\b/i, type: 'DUMMY' }
];
const BRITTLE_DEFAULTS = [
    /\b:\s*any\b/,
    /\b=\s*null\b/,
    /\b=\s*''\b/,
    /\b=\s*0\b/
];

async function pathExists(p) {
    try { await access(p, FS_CONSTANTS.F_OK); return true; } catch { return false; }
}

async function collectFiles(dir, acc = []) {
    let entries;
    try {
        entries = await readdir(dir);
    } catch {
        return acc;
    }
    for (const entry of entries) {
        const p = join(dir, entry);
        try {
            const st = await stat(p);
            if (st.isDirectory()) {
                await collectFiles(p, acc);
            } else if (/\.(ts|tsx|js|jsx|md)$/.test(p)) {
                acc.push(p);
            }
        } catch {}
    }
    return acc;
}

async function scanFile(path) {
    const findings = [];
    let content = '';
    try {
        content = await readFile(path, 'utf8');
    } catch {
        return findings;
    }
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pat of PLACEHOLDER_PATTERNS) {
            if (pat.re.test(line)) {
                findings.push({
                    file: relative(ROOT, path),
                    line: i + 1,
                    match: line.trim(),
                    type: pat.type,
                    context: lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join('\n')
                });
            }
        }
        for (const re of BRITTLE_DEFAULTS) {
            if (re.test(line)) {
                findings.push({
                    file: relative(ROOT, path),
                    line: i + 1,
                    match: line.trim(),
                    type: 'BRITTLE_DEFAULT',
                    context: lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join('\n')
                });
            }
        }
    }
    return findings;
}

async function main() {
    const roots = [];
    for (const d of INCLUDE_DIRS) {
        const p = join(ROOT, d);
        if (await pathExists(p)) roots.push(p);
    }
    const filesArrays = await Promise.all(roots.map((d) => collectFiles(d)));
    const files = filesArrays.flat();
    const findingsArrays = await Promise.all(files.map((f) => scanFile(f)));
    const all = findingsArrays.flat();

    console.log('# Placeholder Hygiene Report');
    console.log();
    console.log(`Scanned directories: ${INCLUDE_DIRS.join(', ')}`);
    console.log(`Findings: ${all.length}`);
    console.log();
    let hadStrict = false;
    for (const f of all) {
        console.log(`- ${f.type} | ${f.file}:${f.line}`);
        console.log('  - Match:', f.match);
        console.log('  - Context:');
        console.log('    ```');
        console.log(f.context);
        console.log('    ```');
        if ((f.file.startsWith('zones/') || f.file.startsWith('src/')) && (f.type === 'PLACEHOLDER' || f.type === 'STUB' || f.type === 'TODO' || f.type === 'FIXME')) {
            hadStrict = true;
        }
        if (f.file.startsWith('zones/') && f.type === 'BRITTLE_DEFAULT') {
            hadStrict = true;
        }
    }
    if (hadStrict) {
        console.error('\n❌ Strict placeholder policy violated in zones/ or src/.');
        process.exit(1);
    }
}

main().catch((e) => { console.error('Placeholder hygiene failed:', e?.message || e); process.exit(1); });
