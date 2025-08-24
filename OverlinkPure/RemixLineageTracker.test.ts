import { RemixLineageTracker, RemixOrigin, AssetLineage, ValidationHook } from './RemixLineageTracker';

describe('RemixLineageTracker', () => {
  let tracker: RemixLineageTracker;

  beforeEach(() => {
    tracker = new RemixLineageTracker();
  });

  describe('Remix Origin Management', () => {
    test('should register remix origins correctly', () => {
      const origin: RemixOrigin = {
        id: 'test_001',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'test_user',
        remixDate: '2025-01-27',
        remixLicense: 'MIT',
        remixNotes: 'Test remix project'
      };

      tracker.registerRemixOrigin(origin);
      const origins = tracker.getRemixOrigins();
      
      expect(origins).toHaveLength(1);
      expect(origins[0].id).toBe('test_001');
      expect(origins[0].originalProject).toBe('MIFF Framework');
    });

    test('should create metadata when first origin is registered', () => {
      const origin: RemixOrigin = {
        id: 'test_001',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'test_user',
        remixDate: '2025-01-27',
        remixLicense: 'MIT'
      };

      tracker.registerRemixOrigin(origin);
      const metadata = tracker.exportMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata?.projectId).toContain('remix_');
      expect(metadata?.remixOrigins).toHaveLength(1);
    });

    test('should register multiple origins', () => {
      const origin1: RemixOrigin = {
        id: 'test_001',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'user1',
        remixDate: '2025-01-27',
        remixLicense: 'MIT'
      };

      const origin2: RemixOrigin = {
        id: 'test_002',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'user2',
        remixDate: '2025-01-28',
        remixLicense: 'MIT'
      };

      tracker.registerRemixOrigin(origin1);
      tracker.registerRemixOrigin(origin2);
      
      const origins = tracker.getRemixOrigins();
      expect(origins).toHaveLength(2);
    });
  });

  describe('Asset Lineage Management', () => {
    test('should register asset lineages correctly', () => {
      const lineage: AssetLineage = {
        assetId: 'test_texture',
        originalPath: 'assets/original.png',
        remixPath: 'assets/remix.png',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'test_user'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      tracker.registerAssetLineage(lineage);
      const retrieved = tracker.getAssetLineage('test_texture');
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.assetId).toBe('test_texture');
      expect(retrieved?.remixSafe).toBe(true);
    });

    test('should update asset validation status', () => {
      const lineage: AssetLineage = {
        assetId: 'test_texture',
        originalPath: 'assets/original.png',
        remixPath: 'assets/remix.png',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'test_user'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      tracker.registerAssetLineage(lineage);
      tracker.updateAssetValidation('test_texture', 'validated', 'Asset validated successfully');
      
      const retrieved = tracker.getAssetLineage('test_texture');
      expect(retrieved?.validationStatus).toBe('validated');
      expect(retrieved?.validationNotes).toBe('Asset validated successfully');
    });

    test('should get all asset lineages', () => {
      const lineage1: AssetLineage = {
        assetId: 'texture1',
        originalPath: 'assets/texture1.png',
        remixPath: 'assets/remix1.png',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'user1'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      const lineage2: AssetLineage = {
        assetId: 'shader1',
        originalPath: 'assets/shader1.glsl',
        remixPath: 'assets/remix1.glsl',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: ['texture1'],
        contributorChain: ['miff_team', 'user1'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'def456'
      };

      tracker.registerAssetLineage(lineage1);
      tracker.registerAssetLineage(lineage2);
      
      const allLineages = tracker.getAllAssetLineages();
      expect(allLineages).toHaveLength(2);
    });
  });

  describe('Contributor Management', () => {
    test('should register contributors automatically', () => {
      const origin: RemixOrigin = {
        id: 'test_001',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'test_user',
        remixDate: '2025-01-27',
        remixLicense: 'MIT'
      };

      tracker.registerRemixOrigin(origin);
      const contributors = tracker.getAllContributors();
      
      expect(contributors.get('miff_team')).toBe('Original Project');
      expect(contributors.get('test_user')).toBe('Remix Contributor');
    });

    test('should register contributors manually', () => {
      tracker.registerContributor('manual_user', 'Custom Role');
      
      const contributors = tracker.getAllContributors();
      expect(contributors.get('manual_user')).toBe('Custom Role');
    });

    test('should get contributor roles', () => {
      tracker.registerContributor('test_user', 'Test Role');
      
      const role = tracker.getContributorRole('test_user');
      expect(role).toBe('Test Role');
    });
  });

  describe('Validation Hook Management', () => {
    test('should have default validation hooks', () => {
      const state = tracker.exportState();
      expect(state.validationHooks.size).toBeGreaterThan(0);
    });

    test('should add custom validation hooks', () => {
      const customHook: ValidationHook = {
        id: 'custom_validator',
        type: 'texture',
        validator: (asset) => asset.remixSafe && asset.originalPath.includes('custom'),
        priority: 10,
        enabled: true
      };

      tracker.addValidationHook(customHook);
      
      // Test the hook
      const lineage: AssetLineage = {
        assetId: 'custom_texture',
        originalPath: 'assets/custom.png',
        remixPath: 'assets/remix.png',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'test_user'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      tracker.registerAssetLineage(lineage);
      const result = tracker.validateAsset('custom_texture');
      expect(result).toBe(true);
    });

    test('should toggle validation hooks', () => {
      const customHook: ValidationHook = {
        id: 'toggle_test',
        type: 'texture',
        validator: (asset) => false, // Always fail
        priority: 1,
        enabled: true
      };

      tracker.addValidationHook(customHook);
      
      const lineage: AssetLineage = {
        assetId: 'test_texture',
        originalPath: 'assets/test.png',
        remixPath: 'assets/remix.png',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'test_user'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      tracker.registerAssetLineage(lineage);
      
      // Initially should fail
      let result = tracker.validateAsset('test_texture');
      expect(result).toBe(false);
      
      // Disable hook
      tracker.toggleValidationHook('toggle_test');
      result = tracker.validateAsset('test_texture');
      expect(result).toBe(true); // Should pass without the failing hook
    });

    test('should remove validation hooks', () => {
      const customHook: ValidationHook = {
        id: 'removable_hook',
        type: 'texture',
        validator: (asset) => false,
        priority: 1,
        enabled: true
      };

      tracker.addValidationHook(customHook);
      const removed = tracker.removeValidationHook('removable_hook');
      expect(removed).toBe(true);
    });
  });

  describe('Asset Validation', () => {
    test('should validate assets with hooks', () => {
      const lineage: AssetLineage = {
        assetId: 'test_texture',
        originalPath: 'assets/test.png',
        remixPath: 'assets/remix.png',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'test_user'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      tracker.registerAssetLineage(lineage);
      const result = tracker.validateAsset('test_texture');
      
      expect(result).toBe(true); // Should pass default texture validation
    });

    test('should validate all assets', () => {
      const lineage1: AssetLineage = {
        assetId: 'texture1',
        originalPath: 'assets/texture1.png',
        remixPath: 'assets/remix1.png',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'user1'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      const lineage2: AssetLineage = {
        assetId: 'shader1',
        originalPath: 'assets/shader1.glsl',
        remixPath: 'assets/remix1.glsl',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'user1'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'def456'
      };

      tracker.registerAssetLineage(lineage1);
      tracker.registerAssetLineage(lineage2);
      
      const validation = tracker.validateAllAssets();
      expect(validation.total).toBe(2);
      expect(validation.validated).toBe(2);
      expect(validation.failed).toBe(0);
    });
  });

  describe('CLI and API Integration', () => {
    test('should generate CLI summary', () => {
      const origin: RemixOrigin = {
        id: 'test_001',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'test_user',
        remixDate: '2025-01-27',
        remixLicense: 'MIT'
      };

      const lineage: AssetLineage = {
        assetId: 'test_texture',
        originalPath: 'assets/test.png',
        remixPath: 'assets/remix.png',
        remixSafe: true,
        validationStatus: 'validated',
        dependencies: [],
        contributorChain: ['miff_team', 'test_user'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      tracker.registerRemixOrigin(origin);
      tracker.registerAssetLineage(lineage);
      
      const summary = tracker.getCLISummary();
      expect(summary).toContain('Remix Project: Unknown Remix Project');
      expect(summary).toContain('Total Assets: 1');
      expect(summary).toContain('Remix-Safe Assets: 1');
      expect(summary).toContain('test_001: MIFF Framework → test_user');
      expect(summary).toContain('test_texture: validated (safe)');
    });

    test('should provide sampler integration data', () => {
      const origin: RemixOrigin = {
        id: 'test_001',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'test_user',
        remixDate: '2025-01-27',
        remixLicense: 'MIT'
      };

      tracker.registerRemixOrigin(origin);
      
      const integration = tracker.getSamplerIntegration();
      expect(integration.totalAssets).toBe(0);
      expect(integration.remixSafeAssets).toBe(0);
      expect(integration.contributors).toContain('miff_team');
      expect(integration.contributors).toContain('test_user');
    });
  });

  describe('State Management', () => {
    test('should export state correctly', () => {
      const origin: RemixOrigin = {
        id: 'test_001',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'test_user',
        remixDate: '2025-01-27',
        remixLicense: 'MIT'
      };

      tracker.registerRemixOrigin(origin);
      
      const state = tracker.exportState();
      expect(state.remixMetadata).toBeDefined();
      expect(state.assetRegistry.size).toBe(0);
      expect(state.contributorRegistry.size).toBe(2);
    });

    test('should import state correctly', () => {
      const testState = {
        remixMetadata: {
          projectId: 'test_project',
          projectName: 'Test Project',
          version: '1.0.0',
          remixOrigins: [],
          assetLineages: [],
          contributors: ['test_user'],
          totalAssets: 0,
          remixSafeAssets: 0,
          validationTimestamp: '2025-01-27T00:00:00Z'
        }
      };

      tracker.importState(testState);
      const metadata = tracker.exportMetadata();
      expect(metadata?.projectName).toBe('Test Project');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete remix workflow', () => {
      // Register remix origin
      const origin: RemixOrigin = {
        id: 'workflow_001',
        originalProject: 'MIFF Framework',
        originalContributor: 'miff_team',
        remixContributor: 'workflow_user',
        remixDate: '2025-01-27',
        remixLicense: 'MIT'
      };

      tracker.registerRemixOrigin(origin);
      
      // Register asset lineages
      const textureLineage: AssetLineage = {
        assetId: 'workflow_texture',
        originalPath: 'assets/original.png',
        remixPath: 'assets/workflow.png',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: [],
        contributorChain: ['miff_team', 'workflow_user'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'abc123'
      };

      const shaderLineage: AssetLineage = {
        assetId: 'workflow_shader',
        originalPath: 'assets/original.glsl',
        remixPath: 'assets/workflow.glsl',
        remixSafe: true,
        validationStatus: 'pending',
        dependencies: ['workflow_texture'],
        contributorChain: ['miff_team', 'workflow_user'],
        lastModified: '2025-01-27T00:00:00Z',
        checksum: 'def456'
      };

      tracker.registerAssetLineage(textureLineage);
      tracker.registerAssetLineage(shaderLineage);
      
      // Validate assets
      const validation = tracker.validateAllAssets();
      expect(validation.total).toBe(2);
      expect(validation.validated).toBe(2);
      
      // Check final state
      const metadata = tracker.exportMetadata();
      expect(metadata?.totalAssets).toBe(2);
      expect(metadata?.remixSafeAssets).toBe(2);
      expect(metadata?.contributors).toHaveLength(2);
    });
  });
});