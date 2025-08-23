import * as path from 'path';
import * as fs from 'fs';

/**
 * Golden test for AssetValidatorPure
 * Tests asset bundle validation and remix-safe compliance checking
 * 
 * Remix-safe expectations:
 * - Asset validation is deterministic and pure
 * - License compliance is properly checked
 * - Platform compatibility is validated
 * - Missing assets are correctly identified
 * - Validation reports are consistent
 */
describe('AssetValidatorPure golden tests', () => {
  const root = path.resolve(__dirname, '..');
  
  test('golden asset validation flow', () => {
    // Test comprehensive asset bundle validation
    const validationFixture = path.resolve(root, 'fixtures/asset_validation.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [validationFixture]
    );
    
    const result = JSON.parse(out);
    
    // Verify validation report structure
    expect(result.op).toBe('validate');
    expect(result.status).toBe('error'); // Should have missing asset
    expect(result.summary).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.issues).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.remixSafe).toBeDefined();
    expect(result.compliance).toBeDefined();
    
    // Verify summary statistics
    expect(result.summary.total).toBe(6); // 5 scenario assets + 1 orphaned
    expect(result.summary.valid).toBe(3); // 3 valid assets
    expect(result.summary.missing).toBe(1); // 1 missing asset
    expect(result.summary.invalid).toBe(0); // 0 invalid assets
    expect(result.summary.warnings).toBe(2); // 1 orphaned asset + 1 missing attribution
    
    // Verify individual asset results
    const results = result.results;
    
    // Check valid assets
    const playerSprite = results.find(r => r.id === 'player_sprite');
    expect(playerSprite).toBeDefined();
    expect(playerSprite.status).toBe('valid');
    expect(playerSprite.metadata.license).toBe('cc-by');
    expect(playerSprite.metadata.platform).toBe('all');
    
    const backgroundMusic = results.find(r => r.id === 'background_music');
    expect(backgroundMusic).toBeDefined();
    expect(backgroundMusic.status).toBe('warning');
    expect(backgroundMusic.metadata.license).toBe('cc0');
    
    const gameFont = results.find(r => r.id === 'game_font');
    expect(gameFont).toBeDefined();
    expect(gameFont.status).toBe('valid');
    expect(gameFont.metadata.license).toBe('ofl');
    
    const particleShader = results.find(r => r.id === 'particle_shader');
    expect(particleShader).toBeDefined();
    expect(particleShader.status).toBe('valid');
    expect(particleShader.metadata.license).toBe('cc-by-sa');
    expect(particleShader.metadata.platform).toBe('web');
    
    // Check missing asset
    const missingAsset = results.find(r => r.id === 'missing_asset');
    expect(missingAsset).toBeDefined();
    expect(missingAsset.status).toBe('missing');
    expect(missingAsset.issues).toContain('Asset not found in manifest');
    
    // Check orphaned asset
    const unusedAsset = results.find(r => r.id === 'unused_asset');
    expect(unusedAsset).toBeDefined();
    expect(unusedAsset.status).toBe('warning');
    expect(unusedAsset.warnings).toContain('Asset not referenced by any scenario');
    
    // Verify issues array
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain('missing_asset: Asset not found in manifest');
    
    // Verify recommendations array
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]).toContain('background_music: Missing attribution information');
    
    // Verify remix-safe compliance
    expect(result.remixSafe).toBe(false); // Should be false due to missing asset
    
    // Verify compliance breakdown
    expect(result.compliance.licensing).toBe(true); // All present assets have valid licenses
    expect(result.compliance.attribution).toBe(true); // All assets have proper attribution
    expect(result.compliance.platformSupport).toBe(true); // All assets support target platform
    expect(result.compliance.schemaValidation).toBe(false); // Schema validation fails due to missing asset
  });
  
  test('golden asset validation - strict mode disabled', () => {
    // Test validation with strict mode disabled
    const strictFixture = {
      "scenarioAssets": [
        {
          "id": "test_sprite",
          "path": "assets/sprites/test.png",
          "type": "sprite",
          "required": true,
          "source": "scenario"
        }
      ],
      "manifestAssets": {
        "assets": [
          {
            "id": "test_sprite",
            "path": "assets/sprites/test.png",
            "type": "sprite",
            "license": "cc-by",
            "platform": "all",
            "properties": {
              "size": { "width": 32, "height": 32 }
            }
            // Missing attribution - would cause warning in strict mode
          }
        ],
        "metadata": {
          "version": "1.0.0",
          "author": "Test Studio",
          "description": "Test asset bundle",
          "license": "cc-by",
          "platform": "all"
        }
      },
      "platform": "all",
      "strictMode": false
    };
    
    // Write temporary fixture
    const tempFixturePath = path.resolve(root, 'fixtures/temp_strict.json');
    fs.writeFileSync(tempFixturePath, JSON.stringify(strictFixture, null, 2));
    
    try {
      const out = (global as any).testUtils.runCLI(
        path.resolve(root, 'cliHarness.ts'),
        [tempFixturePath]
      );
      
      const result = JSON.parse(out);
      
      // Verify validation passes in non-strict mode
      expect(result.status).toBe('ok');
      expect(result.remixSafe).toBe(true);
      expect(result.summary.valid).toBe(1);
      expect(result.summary.warnings).toBe(0);
      
      // Verify no warnings about missing attribution
      const testSprite = result.results.find(r => r.id === 'test_sprite');
      expect(testSprite.status).toBe('valid');
      expect(testSprite.warnings).toHaveLength(0);
      
    } finally {
      // Cleanup
      fs.unlinkSync(tempFixturePath);
    }
  });
  
  test('golden asset validation - platform mismatch', () => {
    // Test validation with platform-specific assets
    const platformFixture = {
      "scenarioAssets": [
        {
          "id": "web_shader",
          "path": "assets/shaders/web.glsl",
          "type": "shader",
          "required": true,
          "source": "scenario"
        }
      ],
      "manifestAssets": {
        "assets": [
          {
            "id": "web_shader",
            "path": "assets/shaders/web.glsl",
            "type": "shader",
            "license": "cc0",
            "platform": "unity", // Platform mismatch
            "properties": {
              "version": "300 es",
              "type": "fragment"
            }
          }
        ],
        "metadata": {
          "version": "1.0.0",
          "author": "Test Studio",
          "description": "Test asset bundle",
          "license": "cc0",
          "platform": "all"
        }
      },
      "platform": "web",
      "strictMode": true
    };
    
    // Write temporary fixture
    const tempFixturePath = path.resolve(root, 'fixtures/temp_platform.json');
    fs.writeFileSync(tempFixturePath, JSON.stringify(platformFixture, null, 2));
    
    try {
      const out = (global as any).testUtils.runCLI(
        path.resolve(root, 'cliHarness.ts'),
        [tempFixturePath]
      );
      
      const result = JSON.parse(out);
      
      // Verify validation fails due to platform mismatch
      expect(result.status).toBe('error');
      expect(result.remixSafe).toBe(false);
      
      // Verify platform mismatch issue
      const webShader = result.results.find(r => r.id === 'web_shader');
      expect(webShader.status).toBe('invalid');
      expect(webShader.issues).toContain('Platform mismatch: expected web, got unity');
      
    } finally {
      // Cleanup
      fs.unlinkSync(tempFixturePath);
    }
  });
  
  test('golden asset validation - license compliance', () => {
    // Test validation with invalid license
    const licenseFixture = {
      "scenarioAssets": [
        {
          "id": "proprietary_sprite",
          "path": "assets/sprites/proprietary.png",
          "type": "sprite",
          "required": true,
          "source": "scenario"
        }
      ],
      "manifestAssets": {
        "assets": [
          {
            "id": "proprietary_sprite",
            "path": "assets/sprites/proprietary.png",
            "type": "sprite",
            "license": "proprietary", // Invalid license
            "platform": "all",
            "properties": {
              "size": { "width": 64, "height": 64 }
            }
          }
        ],
        "metadata": {
          "version": "1.0.0",
          "author": "Test Studio",
          "description": "Test asset bundle",
          "license": "cc-by",
          "platform": "all"
        }
      },
      "platform": "all",
      "strictMode": true
    };
    
    // Write temporary fixture
    const tempFixturePath = path.resolve(root, 'fixtures/temp_license.json');
    fs.writeFileSync(tempFixturePath, JSON.stringify(licenseFixture, null, 2));
    
    try {
      const out = (global as any).testUtils.runCLI(
        path.resolve(root, 'cliHarness.ts'),
        [tempFixturePath]
      );
      
      const result = JSON.parse(out);
      
      // Verify validation fails due to invalid license
      expect(result.status).toBe('error');
      expect(result.remixSafe).toBe(false);
      
      // Verify license compliance issue
      const proprietarySprite = result.results.find(r => r.id === 'proprietary_sprite');
      expect(proprietarySprite.status).toBe('invalid');
      expect(proprietarySprite.issues).toContain("License 'proprietary' not in whitelist");
      
      // Verify compliance breakdown
      expect(result.compliance.licensing).toBe(false);
      
    } finally {
      // Cleanup
      fs.unlinkSync(tempFixturePath);
    }
  });
});