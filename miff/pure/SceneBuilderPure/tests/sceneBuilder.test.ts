import { SceneBuilderManager, SceneBuildConfiguration, SceneLayer, SceneOptimizationMode, SceneExportFormat } from '../index';

describe('SceneBuilderPure Tests', () => {

  test('✓ SceneBuilderManager can be created with valid configuration', () => {
    const config: SceneBuildConfiguration = {
      name: 'Test Scene',
      description: 'A test scene for validation',
      dimensions: { width: 1920, height: 1080 },
      layers: [SceneLayer.BACKGROUND, TERRAIN: SceneLayer.TERRAIN, SceneLayer.CHARACTERS],
      optimizationMode: SceneOptimizationMode.CULLING,
      exportFormats: [SceneExportFormat.UNITY, SceneExportFormat.JSON],
      enablePhysics: true,
      enableLighting: true,
      enableAudio: false,
      enableAnimations: false,
      enableParticles: false,
      enablePostProcessing: false,
      maxRenderDistance: 50,
      lodLevels: 2,
      textureQuality: 'medium',
      shadowQuality: 'low',
      antialiasing: 'none',
      ambientOcclusion: false,
      bloom: false,
      motionBlur: false,
      depthOfField: false,
      colorGrading: false,
      customSettings: {}
    };

    const builder = new SceneBuilderManager(config);

    expect(builder).toBeDefined();
    expect(builder.getConfiguration().name).toBe('Test Scene');
    expect(builder.getConfiguration().description).toBe('A test scene for validation');
    expect(builder.getNodeCount()).toBe(0);
    expect(builder.getAssetCount()).toBe(0);
  });

  test('✓ SceneBuilderManager supports different optimization modes', () => {
    const cullingConfig: SceneBuildConfiguration = {
      name: 'Culling Scene',
      description: 'Scene with culling optimization',
      dimensions: { width: 1000, height: 1000 },
      layers: [SceneLayer.BACKGROUND],
      optimizationMode: SceneOptimizationMode.CULLING,
      exportFormats: [SceneExportFormat.JSON],
      enablePhysics: false,
      enableLighting: false,
      enableAudio: false,
      enableAnimations: false,
      enableParticles: false,
      enablePostProcessing: false,
      maxRenderDistance: 25,
      lodLevels: 1,
      textureQuality: 'low',
      shadowQuality: 'off',
      antialiasing: 'none',
      ambientOcclusion: false,
      bloom: false,
      motionBlur: false,
      depthOfField: false,
      colorGrading: false,
      customSettings: {}
    };

    const lodConfig: SceneBuildConfiguration = {
      ...cullingConfig,
      name: 'LOD Scene',
      optimizationMode: SceneOptimizationMode.LOD
    };

    const builder1 = new SceneBuilderManager(cullingConfig);
    const builder2 = new SceneBuilderManager(lodConfig);

    expect(builder1.getConfiguration().optimizationMode).toBe('culling');
    expect(builder2.getConfiguration().optimizationMode).toBe('lod');
  });

  test('✓ SceneBuilderManager scene validation works', () => {
    const config: SceneBuildConfiguration = {
      name: 'Validation Test Scene',
      description: 'Scene for validation testing',
      dimensions: { width: 500, height: 500 },
      layers: [SceneLayer.BACKGROUND, SceneLayer.CHARACTERS],
      optimizationMode: SceneOptimizationMode.NONE,
      exportFormats: [SceneExportFormat.JSON],
      enablePhysics: false,
      enableLighting: false,
      enableAudio: false,
      enableAnimations: false,
      enableParticles: false,
      enablePostProcessing: false,
      maxRenderDistance: 10,
      lodLevels: 1,
      textureQuality: 'low',
      shadowQuality: 'off',
      antialiasing: 'none',
      ambientOcclusion: false,
      bloom: false,
      motionBlur: false,
      depthOfField: false,
      colorGrading: false,
      customSettings: {}
    };

    const builder = new SceneBuilderManager(config);
    const validation = builder.validateScene();

    expect(validation).toBeDefined();
    expect(typeof validation.valid).toBe('boolean');
    expect(Array.isArray(validation.errors)).toBe(true);
    expect(Array.isArray(validation.warnings)).toBe(true);
    expect(Array.isArray(validation.suggestions)).toBe(true);
    expect(typeof validation.performanceScore).toBe('number');
    expect(validation.compatibility).toBeDefined();
  });

  test('✓ SceneBuilderManager handles empty scenes correctly', () => {
    const config: SceneBuildConfiguration = {
      name: 'Empty Scene',
      description: 'An empty scene for testing',
      dimensions: { width: 100, height: 100 },
      layers: [],
      optimizationMode: SceneOptimizationMode.NONE,
      exportFormats: [],
      enablePhysics: false,
      enableLighting: false,
      enableAudio: false,
      enableAnimations: false,
      enableParticles: false,
      enablePostProcessing: false,
      maxRenderDistance: 0,
      lodLevels: 0,
      textureQuality: 'low',
      shadowQuality: 'off',
      antialiasing: 'none',
      ambientOcclusion: false,
      bloom: false,
      motionBlur: false,
      depthOfField: false,
      colorGrading: false,
      customSettings: {}
    };

    const builder = new SceneBuilderManager(config);

    expect(builder.getNodeCount()).toBe(0);
    expect(builder.getAssetCount()).toBe(0);

    const bounds = builder.getSceneBounds();
    expect(bounds.min.x).toBe(0);
    expect(bounds.min.y).toBe(0);
    expect(bounds.max.x).toBe(0);
    expect(bounds.max.y).toBe(0);
  });

  test('✓ SceneBuilderManager supports multiple export formats', () => {
    const config: SceneBuildConfiguration = {
      name: 'Multi-format Scene',
      description: 'Scene with multiple export formats',
      dimensions: { width: 800, height: 600 },
      layers: [SceneLayer.BACKGROUND],
      optimizationMode: SceneOptimizationMode.BATCHING,
      exportFormats: [SceneExportFormat.UNITY, GODOT: SceneExportFormat.GODOT, SceneExportFormat.WEBGL, SceneExportFormat.JSON],
      enablePhysics: true,
      enableLighting: true,
      enableAudio: true,
      enableAnimations: true,
      enableParticles: true,
      enablePostProcessing: true,
      maxRenderDistance: 75,
      lodLevels: 3,
      textureQuality: 'high',
      shadowQuality: 'high',
      antialiasing: 'msaa_4x',
      ambientOcclusion: true,
      bloom: true,
      motionBlur: true,
      depthOfField: true,
      colorGrading: true,
      customSettings: {}
    };

    const builder = new SceneBuilderManager(config);

    expect(builder.getConfiguration().exportFormats).toContain('unity');
    expect(builder.getConfiguration().exportFormats).toContain('godot');
    expect(builder.getConfiguration().exportFormats).toContain('webgl');
    expect(builder.getConfiguration().exportFormats).toContain('json');
    expect(builder.getConfiguration().exportFormats.length).toBe(4);
  });

  test('✓ SceneBuilderManager configuration can be updated', () => {
    const config: SceneBuildConfiguration = {
      name: 'Original Scene',
      description: 'Original description',
      dimensions: { width: 100, height: 100 },
      layers: [SceneLayer.BACKGROUND],
      optimizationMode: SceneOptimizationMode.NONE,
      exportFormats: [SceneExportFormat.JSON],
      enablePhysics: false,
      enableLighting: false,
      enableAudio: false,
      enableAnimations: false,
      enableParticles: false,
      enablePostProcessing: false,
      maxRenderDistance: 10,
      lodLevels: 1,
      textureQuality: 'low',
      shadowQuality: 'off',
      antialiasing: 'none',
      ambientOcclusion: false,
      bloom: false,
      motionBlur: false,
      depthOfField: false,
      colorGrading: false,
      customSettings: {}
    };

    const builder = new SceneBuilderManager(config);

    // Update configuration
    builder.updateConfiguration({
      name: 'Updated Scene',
      description: 'Updated description',
      dimensions: { width: 200, height: 200 },
      enablePhysics: true,
      enableLighting: true
    });

    const updatedConfig = builder.getConfiguration();
    expect(updatedConfig.name).toBe('Updated Scene');
    expect(updatedConfig.description).toBe('Updated description');
    expect(updatedConfig.dimensions.width).toBe(200);
    expect(updatedConfig.dimensions.height).toBe(200);
    expect(updatedConfig.enablePhysics).toBe(true);
    expect(updatedConfig.enableLighting).toBe(true);
  });
});