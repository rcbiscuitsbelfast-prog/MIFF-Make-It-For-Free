import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function stableStringify(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as any).sort(), 2);
}

describe('GodotBridgePure Contract - RenderPayload parity and schema stability', () => {
  const cliPath = path.resolve(__dirname, '..', 'cliHarness.ts');

  it('emits stable command envelope for NPC render (gdscript)', () => {
    const inputData = {
      zoneId: 'zone_village',
      includeQuests: true
    };
    const cfg = {
      language: 'gdscript',
      targetVersion: '4.0',
      useSignals: true,
      useAnimations: true
    };

    const inputFile = path.resolve(__dirname, 'fixtures', 'npc_render.input.json');
    const cfgFile = path.resolve(__dirname, 'fixtures', 'gd.cfg.json');
    fs.mkdirSync(path.dirname(inputFile), { recursive: true });
    fs.writeFileSync(inputFile, JSON.stringify(inputData, null, 2));
    fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2));

    const output = execFileSync('npx', [
      'ts-node',
      '--compiler-options', '{"module":"commonjs"}',
      cliPath,
      'render',
      'npcs',
      inputFile,
      cfgFile
    ], { encoding: 'utf-8' });

    const result = JSON.parse(output);
    expect(result.op).toBe('render');
    expect(result.status).toBe('ok');
    expect(result.renderData).toBeDefined();
    expect(Array.isArray(result.renderData.nodes)).toBe(true);
    expect(Array.isArray(result.renderData.resources)).toBe(true);
    expect(Array.isArray(result.renderData.scripts)).toBe(true);
    expect(Array.isArray(result.renderData.scenes)).toBe(true);

    const stable = stableStringify({
      scenes: result.renderData.scenes,
      scripts: result.renderData.scripts,
      animations: result.renderData.animations,
      inputs: result.renderData.inputs
    });

    const goldenPath = path.resolve(__dirname, 'fixtures', 'npc_render.golden.json');
    if (!fs.existsSync(goldenPath)) {
      fs.writeFileSync(goldenPath, stable + '\n');
    }
    const golden = fs.readFileSync(goldenPath, 'utf-8');
    expect(stable + '\n').toBe(golden);
  });

  it('supports C# script mapping in scripts list (csharp)', () => {
    const inputData = { zoneId: 'zone_village' };
    const cfg = { language: 'csharp', targetVersion: '4.0' };
    const inputFile = path.resolve(__dirname, 'fixtures', 'npc_render_cs.input.json');
    const cfgFile = path.resolve(__dirname, 'fixtures', 'cs.cfg.json');
    fs.mkdirSync(path.dirname(inputFile), { recursive: true });
    fs.writeFileSync(inputFile, JSON.stringify(inputData, null, 2));
    fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2));

    const output = execFileSync('npx', [
      'ts-node',
      '--compiler-options', '{"module":"commonjs"}',
      cliPath,
      'render',
      'npcs',
      inputFile,
      cfgFile
    ], { encoding: 'utf-8' });

    const result = JSON.parse(output);
    expect(result.status).toBe('ok');
    expect(result.renderData).toBeDefined();
    const scripts: string[] = result.renderData.scripts || [];
    // At least one script should be .cs when csharp requested
    expect(scripts.some(s => s.endsWith('.cs'))).toBe(true);
  });
});

