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
  const physicsAssetsFixture = path.resolve(root, 'fixtures/assets_physics.json');
  const goldenHtmlFixture = path.resolve(root, 'fixtures/golden_toppler.html');
  
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

  /**
   * Comprehensive golden test for full build flow
   * Validates the complete pipeline: scenario loading → asset injection → platform conversion → output generation
   */
  test('golden full build flow - physics scenario to web platform', () => {
    // Step 1: Create build directory structure
    const buildDir = path.resolve(root, 'build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Step 2: Simulate CLI run with full parameter set
    // This tests: --genre physics --platform web --assets ./fixtures/assets_physics.json --out ./build/toppler.html
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cli.ts'),
      [
        'TopplerDemoPure',           // Load the TopplerDemoPure scenario
        '--fps', '24',               // Set FPS to 24
        '--debug',                   // Enable debug mode
        '--genre', 'physics',        // Explicitly set physics genre
        '--platform', 'web',         // Target web platform
        '--assets', physicsAssetsFixture,  // Inject physics-specific assets
        '--out', './build/toppler.html'    // Specify output location
      ]
    );
    
    // Step 3: Parse and validate CLI output
    const result = JSON.parse(out);
    
    // Verify build result structure
    expect(result.op).toBe('build');
    expect(result.status).toBe('ok');
    expect(result.scenario).toBe('TopplerDemoPure');
    expect(result.genre).toBe('physics');
    expect(result.platform).toBe('web');
    expect(result.frames).toBeGreaterThan(0);
    expect(result.assets).toBe(6); // 6 assets in physics fixture
    
    // Step 4: Verify output file was created at specified location
    const outputPath = path.resolve(result.out);
    expect(fs.existsSync(outputPath)).toBe(true);
    
    // Verify the output path matches our expected build directory
    expect(outputPath).toContain('build/toppler.html');
    
    // Step 5: Load and validate generated HTML content
    const generatedHtml = fs.readFileSync(outputPath, 'utf-8');
    
    // Basic HTML structure validation
    expect(generatedHtml).toContain('<!doctype html>');
    expect(generatedHtml).toContain('<html>');
    expect(generatedHtml).toContain('<head>');
    expect(generatedHtml).toContain('<body>');
    expect(generatedHtml).toContain('<canvas id="stage">');
    
    // Step 6: Validate scenario-specific content
    // Check that physics-specific elements are present
    expect(generatedHtml).toContain('block');
    expect(generatedHtml).toContain('CanvasRenderPlayer');
    
    // Step 7: Validate asset integration
    // Note: Assets are loaded and validated but not embedded in HTML content
    // The asset count is verified in the CLI output (result.assets === 6)
    // This ensures AssetManifestPure integration is working correctly
    
    // Step 8: Validate platform-specific conversion
    // Check that ConvertToWebPure output is properly integrated
    expect(generatedHtml).toContain('import { CanvasRenderPlayer }');
    expect(generatedHtml).toContain('fps: 24');
    expect(generatedHtml).toContain('debug: true');
    
    // Step 9: Validate frame data structure
    // Check that RenderPayloadPure frames are properly formatted
    expect(generatedHtml).toContain('"frameIndex":');
    expect(generatedHtml).toContain('"sprites":');
    expect(generatedHtml).toContain('"camera":');
    expect(generatedHtml).toContain('"backgroundColor":');
    
    // Step 10: Compare against golden fixture (structural validation)
    const goldenHtml = fs.readFileSync(goldenHtmlFixture, 'utf-8');
    
    // Extract key structural elements for comparison
    const extractStructure = (html: string) => {
      return {
        hasDoctype: html.includes('<!doctype html>'),
        hasCanvas: html.includes('<canvas id="stage">'),
        hasControls: html.includes('id="play"') && html.includes('id="pause"') && html.includes('id="stop"'),
        hasCanvasRenderPlayer: html.includes('CanvasRenderPlayer'),
        hasFrameData: html.includes('"frameIndex":') && html.includes('"sprites":')
      };
    };
    
    const generatedStructure = extractStructure(generatedHtml);
    const goldenStructure = extractStructure(goldenHtml);
    
    // Verify structural equivalence
    expect(generatedStructure.hasDoctype).toBe(goldenStructure.hasDoctype);
    expect(generatedStructure.hasCanvas).toBe(goldenStructure.hasCanvas);
    expect(generatedStructure.hasControls).toBe(goldenStructure.hasControls);
    expect(generatedStructure.hasCanvasRenderPlayer).toBe(goldenStructure.hasCanvasRenderPlayer);
    expect(generatedStructure.hasFrameData).toBe(goldenStructure.hasFrameData);
    
    // Step 11: Validate deterministic behavior
    // Run the build again to ensure consistency
    const out2 = (global as any).testUtils.runCLI(
      path.resolve(root, 'cli.ts'),
      [
        'TopplerDemoPure',
        '--fps', '24',
        '--debug',
        '--genre', 'physics',
        '--platform', 'web',
        '--assets', physicsAssetsFixture,
        '--out', './build/toppler2.html'
      ]
    );
    
    const result2 = JSON.parse(out2);
    const outputPath2 = path.resolve(result2.out);
    const generatedHtml2 = fs.readFileSync(outputPath2, 'utf-8');
    
    // Verify deterministic output (same content for same inputs)
    expect(generatedHtml2).toBe(generatedHtml);
    
    // Step 12: Cleanup test files
    fs.unlinkSync(outputPath);
    fs.unlinkSync(outputPath2);
    
    // Remove build directory if empty
    try {
      fs.rmdirSync(buildDir);
    } catch (e) {
      // Directory not empty, leave it
    }
  });
});