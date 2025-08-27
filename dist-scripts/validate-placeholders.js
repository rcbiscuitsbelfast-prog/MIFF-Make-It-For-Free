#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
const ROOT = process.cwd();
const INCLUDE_DIRS = ['games', 'scripts', 'modules', 'systems', 'sampler'];
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
function collectFiles(dir, acc = []) {
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        try {
            const st = statSync(p);
            if (st.isDirectory())
                collectFiles(p, acc);
            else if (/\.(ts|tsx|js|jsx|md)$/.test(p))
                acc.push(p);
        }
        catch { }
    }
    return acc;
}
function scanFile(path) {
    const findings = [];
    const content = readFileSync(path, 'utf8');
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
function main() {
    const files = INCLUDE_DIRS.flatMap(d => collectFiles(join(ROOT, d)));
    const all = files.flatMap(scanFile);
    console.log('# Placeholder Hygiene Report');
    console.log();
    console.log(`Scanned directories: ${INCLUDE_DIRS.join(', ')}`);
    console.log(`Findings: ${all.length}`);
    console.log();
    for (const f of all) {
        console.log(`- ${f.type} | ${f.file}:${f.line}`);
        console.log('  - Match:', f.match);
        console.log('  - Context:');
        console.log('    ```');
        console.log(f.context);
        console.log('    ```');
    }
}
main();
