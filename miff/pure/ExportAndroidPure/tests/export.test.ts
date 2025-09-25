import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('ExportAndroidPure CLI', () => {
  const project = path.resolve('docs/godot');
  const outDir = path.resolve('build', 'android.test');
  const ks = path.resolve('build', 'dummy.keystore');

  beforeAll(() => {
    fs.mkdirSync(project, { recursive: true });
    fs.writeFileSync(ks, 'dummy');
  });

  afterAll(() => {
    try { fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(ks, { force: true }); } catch {}
  });

  it('fails with missing signing args', () => {
    const cli = path.resolve('miff/pure/ExportAndroidPure/cli.ts');
    expect(() => execFileSync('npx', [
      'ts-node', '--compiler-options', '{"module":"commonjs"}',
      cli, '--project', project, '--output', outDir
    ], { encoding: 'utf-8' })).toThrow();
  });

  it('produces placeholder AAB when args valid', () => {
    const cli = path.resolve('miff/pure/ExportAndroidPure/cli.ts');
    const output = execFileSync('npx', [
      'tsx',
      cli,
      '--project', project,
      '--output', outDir,
      '--aab',
      '--keystore', ks,
      '--alias', 'app',
      '--ks-pass', 'x',
      '--key-pass', 'y'
    ], { encoding: 'utf-8' });
    const result = JSON.parse(output);
    expect(result.op).toBe('export:android');
    expect(result.status).toBe('ok');
    const aabPath = path.join(outDir, 'app.aab');
    expect(fs.existsSync(aabPath)).toBe(true);
  });
});

