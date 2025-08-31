import { RenderReplayManager, ReplayConfig } from '../Manager';
import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { RenderPayload } from '../../miff/pure/schema';

describe('RenderReplayPure Golden Tests', () => {
  const cliPath = path.resolve('RenderReplayPure/cliHarness.ts');
  const samplePath = path.resolve('RenderReplayPure/sample_replay.json');

  beforeAll(() => {
    expect(fs.existsSync(cliPath)).toBe(true);
    expect(fs.existsSync(samplePath)).toBe(true);
  });

  describe('CLI Commands', () => {
    test('✓ replay-golden command with Unity engine', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'replay-golden',
        'BridgeSchemaPure/sample_render.json',
        '--engine', 'unity',
        '--speed', '1.0',
        '--format', 'json'
      ], { encoding: 'utf-8' });

      expect(result).toContain('✅ Replay successful!');
      expect(result).toContain('🎯 Engine: unity');
      expect(result).toContain('📈 Steps:');
      expect(result).toContain('🎨 RenderData:');
      expect(result).toContain('📄 JSON Output:');
      
      // Parse JSON output
      const jsonMatch = result.match(/📄 JSON Output:\s*\n([\s\S]*)/);
      expect(jsonMatch).toBeTruthy();
      
      const jsonOutput = JSON.parse(jsonMatch![1]);
      expect(jsonOutput.op).toBe('replay');
      expect(jsonOutput.status).toBe('ok');
      expect(jsonOutput.session).toBeDefined();
      expect(jsonOutput.session.summary.engine).toBe('unity');
    });

    test('✓ replay-golden command with Web engine', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'replay-golden',
        'BridgeSchemaPure/sample_render.json',
        '--engine', 'web',
        '--speed', '2.0',
        '--loop',
        '--format', 'html'
      ], { encoding: 'utf-8' });

      expect(result).toContain('✅ Replay successful!');
      expect(result).toContain('🎯 Engine: web');
      expect(result).toContain('⚡ Speed: 2x');
      expect(result).toContain('🔄 Loop: Yes');
      expect(result).toContain('📄 JSON Output:');
      
      // Parse JSON output
      const jsonMatch = result.match(/📄 JSON Output:\s*\n([\s\S]*)/);
      expect(jsonMatch).toBeTruthy();
      
      const jsonOutput = JSON.parse(jsonMatch![1]);
      expect(jsonOutput.op).toBe('replay');
      expect(jsonOutput.status).toBe('ok');
      expect(jsonOutput.session.config.engine).toBe('web');
      expect(jsonOutput.session.config.speed).toBe(2.0);
      expect(jsonOutput.session.config.loop).toBe(true);
    });

    test('✓ replay-golden command with Godot engine', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'replay-golden',
        'BridgeSchemaPure/sample_render.json',
        '--engine', 'godot',
        '--speed', '0.5',
        '--no-debug',
        '--format', 'markdown'
      ], { encoding: 'utf-8' });

      expect(result).toContain('✅ Replay successful!');
      expect(result).toContain('🎯 Engine: godot');
      expect(result).toContain('⚡ Speed: 0.5x');
      expect(result).toContain('🐛 Debug: No');
      expect(result).toContain('📄 JSON Output:');
      
      // Parse JSON output
      const jsonMatch = result.match(/📄 JSON Output:\s*\n([\s\S]*)/);
      expect(jsonMatch).toBeTruthy();
      
      const jsonOutput = JSON.parse(jsonMatch![1]);
      expect(jsonOutput.op).toBe('replay');
      expect(jsonOutput.status).toBe('ok');
      expect(jsonOutput.session.config.engine).toBe('godot');
      expect(jsonOutput.session.config.speed).toBe(0.5);
      expect(jsonOutput.session.config.showDebug).toBe(false);
    });

    test('✓ replay-cli command with sample output', () => {
      // Create sample CLI output file
      const sampleCLIOutput = JSON.stringify({
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'test_sprite',
            type: 'sprite',
            position: { x: 100, y: 200 },
            asset: 'test.png'
          }
        ]
      });

      const tempFile = path.join(__dirname, 'temp_cli_output.json');
      fs.writeFileSync(tempFile, sampleCLIOutput);

      try {
        const result = execFileSync('npx', [
          'ts-node',
          '--compiler-options', '{"module":"commonjs"}',
          cliPath,
          'replay-cli',
          tempFile,
          '--engine', 'web'
        ], { encoding: 'utf-8' });

        expect(result).toContain('✅ Replay successful!');
        expect(result).toContain('🎯 Engine: web');
        expect(result).toContain('📈 Steps: 1');
        expect(result).toContain('🎨 RenderData: 1');
        expect(result).toContain('📄 JSON Output:');
        
        // Parse JSON output
        const jsonMatch = result.match(/📄 JSON Output:\s*\n([\s\S]*)/);
        expect(jsonMatch).toBeTruthy();
        
        const jsonOutput = JSON.parse(jsonMatch![1]);
        expect(jsonOutput.op).toBe('replay');
        expect(jsonOutput.status).toBe('ok');
        expect(jsonOutput.session.steps).toHaveLength(1);
        expect(jsonOutput.session.steps[0].renderData).toHaveLength(1);
        expect(jsonOutput.session.steps[0].renderData[0].id).toBe('test_sprite');
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });

    test('✓ replay-payload command with JSON file', () => {
      // Create sample payload file
      const samplePayload = {
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'payload_sprite',
            type: 'sprite',
            position: { x: 300, y: 400 },
            asset: 'payload.png',
            props: { texture: 'payload.png' }
          }
        ]
      };

      const tempFile = path.join(__dirname, 'temp_payload.json');
      fs.writeFileSync(tempFile, JSON.stringify(samplePayload));

      try {
        const result = execFileSync('npx', [
          'ts-node',
          '--compiler-options', '{"module":"commonjs"}',
          cliPath,
          'replay-payload',
          tempFile,
          '--engine', 'unity'
        ], { encoding: 'utf-8' });

        expect(result).toContain('✅ Replay successful!');
        expect(result).toContain('🎯 Engine: unity');
        expect(result).toContain('📈 Steps: 1');
        expect(result).toContain('🎨 RenderData: 1');
        expect(result).toContain('📄 JSON Output:');
        
        // Parse JSON output
        const jsonMatch = result.match(/📄 JSON Output:\s*\n([\s\S]*)/);
        expect(jsonMatch).toBeTruthy();
        
        const jsonOutput = JSON.parse(jsonMatch![1]);
        expect(jsonOutput.op).toBe('replay');
        expect(jsonOutput.status).toBe('ok');
        expect(jsonOutput.session.steps).toHaveLength(1);
        expect(jsonOutput.session.steps[0].renderData).toHaveLength(1);
        expect(jsonOutput.session.steps[0].renderData[0].id).toBe('payload_sprite');
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });

    test('✓ export command with session', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'export',
        'test_session_123',
        'test_export.json',
        '--format', 'json'
      ], { encoding: 'utf-8' });

      expect(result).toContain('📤 Exporting session: test_session_123');
      expect(result).toContain('📁 Output: test_export.json');
      expect(result).toContain('📄 Format: json');
      expect(result).toContain('✅ Export successful: test_export.json');
      
      // Clean up exported file
      if (fs.existsSync('test_export.json')) {
        fs.unlinkSync('test_export.json');
      }
    });

    test('✓ help command displays usage', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'help'
      ], { encoding: 'utf-8' });

      expect(result).toContain('RenderReplayPure CLI - Visual replay tool for MIFF engine bridges');
      expect(result).toContain('Usage:');
      expect(result).toContain('Commands:');
      expect(result).toContain('Options:');
      expect(result).toContain('Examples:');
    });
  });

  describe('Manager Functionality', () => {
    test('✓ creates replay session from golden test', () => {
      const config: ReplayConfig = {
        engine: 'web',
        speed: 1.0,
        loop: false,
        showDebug: true,
        outputFormat: 'json',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const result = manager.replayFromGoldenTest('BridgeSchemaPure/sample_render.json');

      expect(result.op).toBe('replay');
      expect(result.status).toBe('ok');
      expect(result.session).toBeDefined();
      expect(result.session.sessionId).toMatch(/^replay_\d+$/);
      expect(result.session.config.engine).toBe('web');
      expect(result.session.summary.engine).toBe('web');
      expect(result.session.steps.length).toBeGreaterThan(0);
    });

    test('✓ creates replay session from CLI output', () => {
      const config: ReplayConfig = {
        engine: 'unity',
        speed: 2.0,
        loop: true,
        showDebug: false,
        outputFormat: 'html',
        timestamp: false
      };

      const manager = new RenderReplayManager(config);
      const cliOutput = JSON.stringify({
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'cli_sprite',
            type: 'sprite',
            position: { x: 100, y: 200 },
            asset: 'cli.png'
          }
        ]
      });

      const result = manager.replayFromCLIOutput(cliOutput);

      expect(result.op).toBe('replay');
      expect(result.status).toBe('ok');
      expect(result.session.config.engine).toBe('unity');
      expect(result.session.config.speed).toBe(2.0);
      expect(result.session.config.loop).toBe(true);
      expect(result.session.config.showDebug).toBe(false);
      expect(result.session.steps).toHaveLength(1);
      expect(result.session.steps[0].renderData).toHaveLength(1);
      expect(result.session.steps[0].renderData[0].id).toBe('cli_sprite');
    });

    test('✓ creates replay session from payload', () => {
      const config: ReplayConfig = {
        engine: 'godot',
        speed: 0.5,
        loop: false,
        showDebug: true,
        outputFormat: 'markdown',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const payload: RenderPayload = {
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'payload_sprite',
            type: 'sprite',
            position: { x: 300, y: 400 },
            asset: 'payload.png'
          }
        ]
      };

      const result = manager.replayFromPayload(payload);

      expect(result.op).toBe('replay');
      expect(result.status).toBe('ok');
      expect(result.session.config.engine).toBe('godot');
      expect(result.session.config.speed).toBe(0.5);
      expect(result.session.steps).toHaveLength(1);
      expect(result.session.steps[0].renderData).toHaveLength(1);
      expect(result.session.steps[0].renderData[0].id).toBe('payload_sprite');
    });

    test('✓ handles invalid golden test gracefully', () => {
      const config: ReplayConfig = {
        engine: 'web',
        speed: 1.0,
        loop: false,
        showDebug: true,
        outputFormat: 'json',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const result = manager.replayFromGoldenTest('nonexistent_file.json');

      expect(result.op).toBe('replay');
      expect(result.status).toBe('error');
      expect(result.issues).toBeDefined();
      expect(result.issues!.length).toBeGreaterThan(0);
      expect(result.issues![0]).toContain('Failed to load golden test');
    });

    test('✓ handles invalid CLI output gracefully', () => {
      const config: ReplayConfig = {
        engine: 'web',
        speed: 1.0,
        loop: false,
        showDebug: true,
        outputFormat: 'json',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const result = manager.replayFromCLIOutput('invalid json content');

      expect(result.op).toBe('replay');
      expect(result.status).toBe('error');
      expect(result.issues).toBeDefined();
      expect(result.issues!.length).toBeGreaterThan(0);
      expect(result.issues![0]).toContain('No renderData found in CLI output');
    });

    test('✓ handles invalid payload gracefully', () => {
      const config: ReplayConfig = {
        engine: 'web',
        speed: 1.0,
        loop: false,
        showDebug: true,
        outputFormat: 'json',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const invalidPayload: RenderPayload = {
        op: 'render',
        status: 'error',
        renderData: [
          {
            id: 'invalid_sprite',
            type: 'sprite' as any, // Cast to any for invalid type test
            position: { x: 'not_a_number' as any, y: 200 } // Invalid position
          }
        ]
      };

      const result = manager.replayFromPayload(invalidPayload);

      expect(result.op).toBe('replay');
      expect(result.status).toBe('error');
      expect(result.issues).toBeDefined();
      expect(result.issues!.length).toBeGreaterThan(0);
      expect(result.issues!.some(issue => issue.includes('Invalid render type'))).toBe(true);
      expect(result.issues!.some(issue => issue.includes('Position x must be a number'))).toBe(true);
    });

    test('✓ exports replay session to JSON', () => {
      const config: ReplayConfig = {
        engine: 'web',
        speed: 1.0,
        loop: false,
        showDebug: true,
        outputFormat: 'json',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const payload: RenderPayload = {
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'export_sprite',
            type: 'sprite',
            position: { x: 100, y: 200 },
            asset: 'sprite.png'
          }
        ]
      };

      const replayResult = manager.replayFromPayload(payload);
      expect(replayResult.status).toBe('ok');

      const exportResult = manager.exportReplay(replayResult.session, 'test_export.json');
      expect(exportResult.success).toBe(true);

      // Verify exported file
      expect(fs.existsSync('test_export.json')).toBe(true);
      const exportedContent = JSON.parse(fs.readFileSync('test_export.json', 'utf-8'));
      expect(exportedContent.sessionId).toBe(replayResult.session.sessionId);
      expect(exportedContent.config.engine).toBe('web');
      expect(exportedContent.steps).toHaveLength(1);

      // Clean up
      fs.unlinkSync('test_export.json');
    });

    test('✓ exports replay session to Markdown', () => {
      const config: ReplayConfig = {
        engine: 'unity',
        speed: 1.0,
        loop: false,
        showDebug: true,
        outputFormat: 'markdown',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const payload: RenderPayload = {
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'markdown_sprite',
            type: 'sprite',
            position: { x: 100, y: 200 },
            asset: 'markdown.png'
          }
        ]
      };

      const replayResult = manager.replayFromPayload(payload);
      expect(replayResult.status).toBe('ok');

      const exportResult = manager.exportReplay(replayResult.session, 'test_export.md');
      expect(exportResult.success).toBe(true);

      // Verify exported file
      expect(fs.existsSync('test_export.md')).toBe(true);
      const exportedContent = fs.readFileSync('test_export.md', 'utf-8');
      expect(exportedContent).toContain('# Render Replay Session:');
      expect(exportedContent).toContain('Engine: unity');
      expect(exportedContent).toContain('Steps: 1');
      expect(exportedContent).toContain('RenderData: 1');

      // Clean up
      fs.unlinkSync('test_export.md');
    });

    test('✓ exports replay session to HTML', () => {
      const config: ReplayConfig = {
        engine: 'godot',
        speed: 1.0,
        loop: false,
        showDebug: true,
        outputFormat: 'html',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const payload: RenderPayload = {
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'html_sprite',
            type: 'sprite',
            position: { x: 100, y: 200 },
            asset: 'html.png'
          }
        ]
      };

      const replayResult = manager.replayFromPayload(payload);
      expect(replayResult.status).toBe('ok');

      const exportResult = manager.exportReplay(replayResult.session, 'test_export.html');
      expect(exportResult.success).toBe(true);

      // Verify exported file
      expect(fs.existsSync('test_export.html')).toBe(true);
      const exportedContent = fs.readFileSync('test_export.html', 'utf-8');
      expect(exportedContent).toContain('<!DOCTYPE html>');
      expect(exportedContent).toContain('<title>Render Replay Report</title>');
      expect(exportedContent).toContain('Render Replay Session:');
      expect(exportedContent).toContain('Engine: godot');

      // Clean up
      fs.unlinkSync('test_export.html');
    });

    test('✓ generates annotated log', () => {
      const config: ReplayConfig = {
        engine: 'web',
        speed: 1.0,
        loop: false,
        showDebug: true,
        outputFormat: 'json',
        timestamp: true
      };

      const manager = new RenderReplayManager(config);
      const payload: RenderPayload = {
        op: 'render',
        status: 'ok',
        renderData: [
          {
            id: 'log_sprite',
            type: 'sprite',
            position: { x: 100, y: 200 },
            asset: 'log.png',
            signals: [
              {
                name: 'click',
                parameters: ['event'],
                connectedTo: ['handler'],
                engine: 'web'
              }
            ]
          }
        ]
      };

      const replayResult = manager.replayFromPayload(payload);
      expect(replayResult.status).toBe('ok');

      const annotatedLog = manager.generateAnnotatedLog(replayResult.session);
      expect(annotatedLog).toContain('# Render Replay Session:');
      expect(annotatedLog).toContain('Engine: web');
      expect(annotatedLog).toContain('Steps: 1');
      expect(annotatedLog).toContain('RenderData: 1');
      expect(annotatedLog).toContain('## Step 1');
      expect(annotatedLog).toContain('### Annotations:');
      expect(annotatedLog).toContain('Operation: render');
      expect(annotatedLog).toContain('Status: ok');
      expect(annotatedLog).toContain('### RenderData:');
      expect(annotatedLog).toContain('sprite (log_sprite)');
      expect(annotatedLog).toContain('Signals: 1');
    });
  });

  describe('Error Handling', () => {
    test('✓ handles missing test file', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'replay-golden',
        'nonexistent_file.json'
      ], { encoding: 'utf-8' });

      expect(result).toContain('❌ Replay failed:');
      expect(result).toContain('Failed to load golden test');
    });

    test('✓ handles missing CLI output file', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'replay-cli',
        'nonexistent_file.json'
      ], { encoding: 'utf-8' });

      expect(result).toContain('Error reading CLI output file:');
    });

    test('✓ handles missing payload file', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'replay-payload',
        'nonexistent_file.json'
      ], { encoding: 'utf-8' });

      expect(result).toContain('Error reading JSON payload file:');
    });

    test('✓ handles invalid command', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'invalid-command'
      ], { encoding: 'utf-8' });

      expect(result).toContain('Error: Unknown command');
      expect(result).toContain('Usage:');
    });

    test('✓ handles missing arguments', () => {
      const result = execFileSync('npx', [
        'ts-node',
        '--compiler-options', '{"module":"commonjs"}',
        cliPath,
        'replay-golden'
      ], { encoding: 'utf-8' });

      expect(result).toContain('Error: Test path required');
      expect(result).toContain('Usage:');
    });
  });
});