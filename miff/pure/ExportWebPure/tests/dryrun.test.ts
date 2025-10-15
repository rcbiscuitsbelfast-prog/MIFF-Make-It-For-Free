import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


describe('ExportWebPure CLI dry run', () => {
  const project = path.resolve('docs/godot');
  const web = path.join(project, 'export', 'web');
  const outDir = path.resolve('build', 'web.test');

  beforeAll(() => {
    // Ensure fake export directory exists for dry-run copy
    fs.mkdirSync(web, { recursive: true });
    fs.writeFileSync(path.join(web, 'index.html'), '<!DOCTYPE html><title>Godot</title>');
    fs.writeFileSync(path.join(web, 'game.pck'), '');
    fs.writeFileSync(path.join(web, 'game.wasm'), '');
  });

  afterAll(() => {
    try { fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
  });

  it('copies export and emits manifest', () => {
    const cli = path.resolve('miff/pure/ExportWebPure/cli.ts');
    const output = execFileSync('npx', [
      'ts-node',
      '--compiler-options', '{"module":"commonjs"}',
      cli,
      '--project', project,
      '--output', outDir,
      '--deploy', 'pages'
    ], { encoding: 'utf-8' });

    const result = SafeJSONParser.parse(output);
    expect(result.op).toBe('export:web');
    expect(result.status).toBe('ok');
    expect(fs.existsSync(path.join(outDir, 'preload.manifest.json'))).toBe(true);
  });
});

