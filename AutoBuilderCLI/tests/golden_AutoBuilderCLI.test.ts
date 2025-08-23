import * as path from 'path';
import * as fs from 'fs';

/**
 * Golden test for AutoBuilderCLI
 * Tests the full build flow with different platforms and asset injection
 * 
 * Remix-safe expectations:
 * - Build process is deterministic and pure
 * - Platform conversion works correctly
 * - Asset injection validates and processes manifests
 * - Output generation is consistent across platforms
 */
describe('AutoBuilderCLI golden tests', () => {
  const root = path.resolve(__dirname, '..');
  const assetsFixture = path.resolve(root, 'fixtures/sample_assets.json');
  
  test('golden web build flow', () => {
    // Test basic web build
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cli.ts'),
      ['TopplerDemoPure', '--fps', '24', '--debug', '--out', 'test_web.html']
    );
    
    const result = JSON.parse(out);
    
    // Verify expected structure
    expect(result.op).toBe('build');
    expect(result.status).toBe('ok');
    expect(result.scenario).toBe('TopplerDemoPure');
    expect(result.genre).toBe('physics');
    expect(result.platform).toBe('web');
    expect(result.frames).toBeGreaterThan(0);
    expect(result.assets).toBe(0); // No assets specified
    
    // Verify output file was created
    const outputPath = path.resolve(result.out);
    expect(fs.existsSync(outputPath)).toBe(true);
    
    // Verify HTML content
    const htmlContent = fs.readFileSync(outputPath, 'utf-8');
    expect(htmlContent).toContain('<!doctype html>');
    expect(htmlContent).toContain('AutoBuilderCLI Demo');
    expect(htmlContent).toContain('CanvasRenderPlayer');
    
    // Cleanup
    fs.unlinkSync(outputPath);
  });
  
  test('golden unity build flow', () => {
    // Test Unity build
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cli.ts'),
      ['SpiritTamerDemoPure', '--platform', 'unity', '--out', 'test_unity.json']
    );
    
    const result = JSON.parse(out);
    
    // Verify expected structure
    expect(result.op).toBe('build');
    expect(result.status).toBe('ok');
    expect(result.scenario).toBe('SpiritTamerDemoPure');
    expect(result.genre).toBe('rhythm');
    expect(result.platform).toBe('unity');
    expect(result.frames).toBeGreaterThan(0);
    
    // Verify output file was created
    const outputPath = path.resolve(result.out);
    expect(fs.existsSync(outputPath)).toBe(true);
    
    // Verify Unity JSON content
    const jsonContent = fs.readFileSync(outputPath, 'utf-8');
    const unityData = JSON.parse(jsonContent);
    expect(unityData.engine).toBe('unity');
    
    // Cleanup
    fs.unlinkSync(outputPath);
  });
  
  test('golden godot build flow', () => {
    // Test Godot build
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cli.ts'),
      ['TopplerDemoPure', '--platform', 'godot', '--out', 'test_godot.json']
    );
    
    const result = JSON.parse(out);
    
    // Verify expected structure
    expect(result.op).toBe('build');
    expect(result.status).toBe('ok');
    expect(result.scenario).toBe('TopplerDemoPure');
    expect(result.genre).toBe('physics');
    expect(result.platform).toBe('godot');
    expect(result.frames).toBeGreaterThan(0);
    
    // Verify output file was created
    const outputPath = path.resolve(result.out);
    expect(fs.existsSync(outputPath)).toBe(true);
    
    // Verify Godot JSON content
    const jsonContent = fs.readFileSync(outputPath, 'utf-8');
    const godotData = JSON.parse(jsonContent);
    expect(godotData.engine).toBe('godot');
    
    // Cleanup
    fs.unlinkSync(outputPath);
  });
  
  test('golden asset injection flow', () => {
    // Test build with asset injection
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cli.ts'),
      ['SpiritTamerDemoPure', '--assets', assetsFixture, '--out', 'test_assets.html']
    );
    
    const result = JSON.parse(out);
    
    // Verify expected structure
    expect(result.op).toBe('build');
    expect(result.status).toBe('ok');
    expect(result.scenario).toBe('SpiritTamerDemoPure');
    expect(result.genre).toBe('rhythm');
    expect(result.platform).toBe('web');
    expect(result.frames).toBeGreaterThan(0);
    expect(result.assets).toBe(5); // 5 assets in fixture
    
    // Verify output file was created
    const outputPath = path.resolve(result.out);
    expect(fs.existsSync(outputPath)).toBe(true);
    
    // Cleanup
    fs.unlinkSync(outputPath);
  });
  
  test('golden genre detection flow', () => {
    // Test automatic genre detection
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cli.ts'),
      ['TopplerDemoPure', '--out', 'test_genre.html']
    );
    
    const result = JSON.parse(out);
    
    // Verify genre was auto-detected
    expect(result.genre).toBe('physics');
    
    // Cleanup
    const outputPath = path.resolve(result.out);
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });
  
  test('golden error handling flow', () => {
    // Test error handling for invalid platform
    try {
      (global as any).testUtils.runCLI(
        path.resolve(root, 'cli.ts'),
        ['TopplerDemoPure', '--platform', 'invalid', '--out', 'test_error.html']
      );
      fail('Expected error for invalid platform');
    } catch (error) {
      // The error might be a command failure or JSON error
      if (error.message && error.message.includes('Invalid platform: invalid')) {
        // Direct error message
        expect(error.message).toContain('Invalid platform: invalid');
      } else {
        // Try to parse as JSON error
        try {
          const errorResult = JSON.parse(error.message);
          expect(errorResult.op).toBe('build');
          expect(errorResult.status).toBe('error');
          expect(errorResult.issues).toContain('Invalid platform: invalid');
        } catch (parseError) {
          // If parsing fails, just verify the error contains the expected message
          expect(error.message).toContain('Invalid platform: invalid');
        }
      }
    }
  });
});