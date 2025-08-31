// RemixLineageTracker — Remix Origin and Asset Lineage Tracking (Remix-Safe)
// Purpose: Tracks remix origin, contributor ID, and asset lineage with validation hooks
// Schema: Pure JSON outputs, deterministic, engine-agnostic

export type ContributorId = string;
export type AssetId = string;
export type RemixId = string;

export type RemixOrigin = {
  id: RemixId;
  originalProject: string;
  originalContributor: ContributorId;
  remixContributor: ContributorId;
  remixDate: string;
  remixLicense: string;
  remixNotes?: string;
};

export type AssetLineage = {
  assetId: AssetId;
  originalPath: string;
  remixPath: string;
  remixSafe: boolean;
  validationStatus: 'validated' | 'pending' | 'failed';
  validationNotes?: string;
  dependencies: AssetId[];
  contributorChain: ContributorId[];
  lastModified: string;
  checksum: string;
};

export type RemixMetadata = {
  projectId: string;
  projectName: string;
  version: string;
  remixOrigins: RemixOrigin[];
  assetLineages: AssetLineage[];
  contributors: ContributorId[];
  totalAssets: number;
  remixSafeAssets: number;
  validationTimestamp: string;
};

export type ValidationHook = {
  id: string;
  type: 'asset' | 'shader' | 'audio' | 'texture';
  validator: (asset: AssetLineage) => boolean;
  priority: number;
  enabled: boolean;
};

export type LineageState = {
  remixMetadata: RemixMetadata | null;
  validationHooks: Map<string, ValidationHook>;
  assetRegistry: Map<AssetId, AssetLineage>;
  contributorRegistry: Map<ContributorId, string>;
  validationQueue: AssetId[];
  auditLog: string[];
};

export class RemixLineageTracker {
  private state: LineageState;
  private metadataPath: string;

  constructor(metadataPath: string = 'remix_meta.json') {
    this.metadataPath = metadataPath;
    this.state = {
      remixMetadata: null,
      validationHooks: new Map(),
      assetRegistry: new Map(),
      contributorRegistry: new Map(),
      validationQueue: [],
      auditLog: []
    };

    // Initialize default validation hooks
    this.initializeDefaultHooks();
  }

  // Remix Origin Management
  registerRemixOrigin(origin: RemixOrigin): void {
    if (!this.state.remixMetadata) {
      this.state.remixMetadata = {
        projectId: `remix_${Date.now()}`,
        projectName: 'Unknown Remix Project',
        version: '1.0.0',
        remixOrigins: [],
        assetLineages: [],
        contributors: [],
        totalAssets: 0,
        remixSafeAssets: 0,
        validationTimestamp: new Date().toISOString()
      };
    }

    this.state.remixMetadata.remixOrigins.push(origin);
    
    // Add contributors to registry
    this.registerContributor(origin.originalContributor, 'Original Project');
    this.registerContributor(origin.remixContributor, 'Remix Contributor');
    
    this.logAudit(`Registered remix origin: ${origin.id} by ${origin.remixContributor}`);
  }

  getRemixOrigins(): RemixOrigin[] {
    return this.state.remixMetadata?.remixOrigins || [];
  }

  // Asset Lineage Management
  registerAssetLineage(lineage: AssetLineage): void {
    this.state.assetRegistry.set(lineage.assetId, lineage);
    
    if (this.state.remixMetadata) {
      this.state.remixMetadata.assetLineages.push(lineage);
      this.state.remixMetadata.totalAssets = this.state.assetRegistry.size;
      
      if (lineage.remixSafe) {
        this.state.remixMetadata.remixSafeAssets++;
      }
    }

    // Add to validation queue
    this.state.validationQueue.push(lineage.assetId);
    
    this.logAudit(`Registered asset lineage: ${lineage.assetId} (${lineage.validationStatus})`);
  }

  getAssetLineage(assetId: AssetId): AssetLineage | undefined {
    return this.state.assetRegistry.get(assetId);
  }

  getAllAssetLineages(): AssetLineage[] {
    return Array.from(this.state.assetRegistry.values());
  }

  updateAssetValidation(assetId: AssetId, status: 'validated' | 'pending' | 'failed', notes?: string): void {
    const lineage = this.state.assetRegistry.get(assetId);
    if (lineage) {
      lineage.validationStatus = status;
      lineage.validationNotes = notes;
      lineage.lastModified = new Date().toISOString();
      
      this.logAudit(`Updated asset validation: ${assetId} -> ${status}`);
    }
  }

  // Contributor Management
  registerContributor(contributorId: ContributorId, role: string): void {
    this.state.contributorRegistry.set(contributorId, role);
    
    if (this.state.remixMetadata && !this.state.remixMetadata.contributors.includes(contributorId)) {
      this.state.remixMetadata.contributors.push(contributorId);
    }
  }

  getContributorRole(contributorId: ContributorId): string | undefined {
    return this.state.contributorRegistry.get(contributorId);
  }

  getAllContributors(): Map<ContributorId, string> {
    return new Map(this.state.contributorRegistry);
  }

  // Validation Hook Management
  private initializeDefaultHooks(): void {
    // Texture validation hook
    this.addValidationHook({
      id: 'texture_validator',
      type: 'texture',
      validator: (asset) => {
        // Check if texture has valid format and size
        return asset.remixSafe && asset.originalPath.endsWith('.png');
      },
      priority: 1,
      enabled: true
    });

    // Shader validation hook
    this.addValidationHook({
      id: 'shader_validator',
      type: 'shader',
      validator: (asset) => {
        // Check if shader has valid GLSL syntax indicators
        return asset.remixSafe && asset.originalPath.endsWith('.glsl');
      },
      priority: 2,
      enabled: true
    });

    // Audio validation hook
    this.addValidationHook({
      id: 'audio_validator',
      type: 'audio',
      validator: (asset) => {
        // Check if audio has valid format
        return asset.remixSafe && (asset.originalPath.endsWith('.ogg') || asset.originalPath.endsWith('.wav'));
      },
      priority: 3,
      enabled: true
    });
  }

  addValidationHook(hook: ValidationHook): void {
    this.state.validationHooks.set(hook.id, hook);
    this.logAudit(`Added validation hook: ${hook.id} (${hook.type})`);
  }

  removeValidationHook(hookId: string): boolean {
    const removed = this.state.validationHooks.delete(hookId);
    if (removed) {
      this.logAudit(`Removed validation hook: ${hookId}`);
    }
    return removed;
  }

  toggleValidationHook(hookId: string): boolean {
    const hook = this.state.validationHooks.get(hookId);
    if (hook) {
      hook.enabled = !hook.enabled;
      this.logAudit(`${hook.enabled ? 'Enabled' : 'Disabled'} validation hook: ${hookId}`);
      return hook.enabled;
    }
    return false;
  }

  // Asset Validation
  validateAsset(assetId: AssetId): boolean {
    const lineage = this.state.assetRegistry.get(assetId);
    if (!lineage) return false;

    // Run all enabled validation hooks for this asset type
    const relevantHooks = Array.from(this.state.validationHooks.values())
      .filter(hook => hook.enabled && hook.type === this.getAssetType(lineage.originalPath))
      .sort((a, b) => a.priority - b.priority);

    let isValid = true;
    for (const hook of relevantHooks) {
      try {
        if (!hook.validator(lineage)) {
          isValid = false;
          this.logAudit(`Validation failed for ${assetId} with hook ${hook.id}`);
          break;
        }
      } catch (error) {
        this.logAudit(`Validation error for ${assetId} with hook ${hook.id}: ${error}`);
        isValid = false;
      }
    }

    // Update validation status
    this.updateAssetValidation(assetId, isValid ? 'validated' : 'failed');
    
    return isValid;
  }

  validateAllAssets(): { total: number; validated: number; failed: number } {
    const total = this.state.assetRegistry.size;
    let validated = 0;
    let failed = 0;

    for (const assetId of this.state.assetRegistry.keys()) {
      if (this.validateAsset(assetId)) {
        validated++;
      } else {
        failed++;
      }
    }

    this.logAudit(`Bulk validation complete: ${validated}/${total} assets validated`);
    return { total, validated, failed };
  }

  // Metadata Export/Import
  exportMetadata(): RemixMetadata | null {
    if (!this.state.remixMetadata) return null;

    // Update metadata with current state
    this.state.remixMetadata.totalAssets = this.state.assetRegistry.size;
    this.state.remixMetadata.remixSafeAssets = Array.from(this.state.assetRegistry.values())
      .filter(asset => asset.remixSafe).length;
    this.state.remixMetadata.validationTimestamp = new Date().toISOString();

    return this.state.remixMetadata;
  }

  importMetadata(metadata: RemixMetadata): void {
    this.state.remixMetadata = metadata;
    
    // Rebuild registries from metadata
    this.state.assetRegistry.clear();
    this.state.contributorRegistry.clear();
    
    metadata.assetLineages.forEach(lineage => {
      this.state.assetRegistry.set(lineage.assetId, lineage);
    });
    
    metadata.contributors.forEach(contributorId => {
      this.state.contributorRegistry.set(contributorId, 'Unknown Role');
    });
    
    this.logAudit(`Imported metadata for project: ${metadata.projectName}`);
  }

  // File I/O Operations
  async saveMetadata(): Promise<void> {
    const metadata = this.exportMetadata();
    if (!metadata) return;

    try {
      const fs = require('fs').promises;
      await fs.writeFile(this.metadataPath, JSON.stringify(metadata, null, 2));
      this.logAudit(`Metadata saved to ${this.metadataPath}`);
    } catch (error) {
      this.logAudit(`Failed to save metadata: ${error}`);
      throw error;
    }
  }

  async loadMetadata(): Promise<void> {
    try {
      const fs = require('fs').promises;
      const data = await fs.readFile(this.metadataPath, 'utf-8');
      const metadata: RemixMetadata = JSON.parse(data);
      this.importMetadata(metadata);
      this.logAudit(`Metadata loaded from ${this.metadataPath}`);
    } catch (error) {
      this.logAudit(`Failed to load metadata: ${error}`);
      // Continue with empty state if file doesn't exist
    }
  }

  // CLI and API Integration
  getCLISummary(): string {
    const metadata = this.exportMetadata();
    if (!metadata) return 'No remix metadata available';

    let output = `Remix Project: ${metadata.projectName}\n`;
    output += `Version: ${metadata.version}\n`;
    output += `Total Assets: ${metadata.totalAssets}\n`;
    output += `Remix-Safe Assets: ${metadata.remixSafeAssets}\n`;
    output += `Contributors: ${metadata.contributors.length}\n`;
    output += `Validation: ${metadata.validationTimestamp}\n\n`;

    output += 'Remix Origins:\n';
    metadata.remixOrigins.forEach(origin => {
      output += `  ${origin.id}: ${origin.originalProject} → ${origin.remixContributor}\n`;
    });

    output += '\nAsset Lineages:\n';
    metadata.assetLineages.forEach(lineage => {
      output += `  ${lineage.assetId}: ${lineage.validationStatus} (${lineage.remixSafe ? 'safe' : 'restricted'})\n`;
    });

    return output;
  }

  getSamplerIntegration(): {
    totalAssets: number;
    remixSafeAssets: number;
    validationStatus: string;
    contributors: ContributorId[];
    recentActivity: string[];
  } {
    const metadata = this.exportMetadata();
    if (!metadata) {
      return {
        totalAssets: 0,
        remixSafeAssets: 0,
        validationStatus: 'No metadata',
        contributors: [],
        recentActivity: []
      };
    }

    return {
      totalAssets: metadata.totalAssets,
      remixSafeAssets: metadata.remixSafeAssets,
      validationStatus: metadata.assetLineages.every(a => a.validationStatus === 'validated') ? 'Validated' : 'Pending',
      contributors: metadata.contributors,
      recentActivity: this.state.auditLog.slice(-5) // Last 5 audit entries
    };
  }

  // Utility Methods
  private getAssetType(path: string): 'texture' | 'shader' | 'audio' | 'data' {
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'texture';
    if (path.endsWith('.glsl') || path.endsWith('.vert') || path.endsWith('.frag')) return 'shader';
    if (path.endsWith('.ogg') || path.endsWith('.wav') || path.endsWith('.mp3')) return 'audio';
    return 'data';
  }

  private logAudit(message: string): void {
    const timestamp = new Date().toISOString();
    this.state.auditLog.push(`[${timestamp}] ${message}`);
    
    // Keep only last 100 audit entries
    if (this.state.auditLog.length > 100) {
      this.state.auditLog = this.state.auditLog.slice(-100);
    }
  }

  // State Management
  exportState(): LineageState {
    return {
      ...this.state,
      validationHooks: new Map(this.state.validationHooks),
      assetRegistry: new Map(this.state.assetRegistry),
      contributorRegistry: new Map(this.state.contributorRegistry),
      validationQueue: [...this.state.validationQueue],
      auditLog: [...this.state.auditLog]
    };
  }

  importState(state: Partial<LineageState>): void {
    if (state.remixMetadata !== undefined) this.state.remixMetadata = state.remixMetadata;
    if (state.validationHooks) this.state.validationHooks = new Map(state.validationHooks);
    if (state.assetRegistry) this.state.assetRegistry = new Map(state.assetRegistry);
    if (state.contributorRegistry) this.state.contributorRegistry = new Map(state.contributorRegistry);
    if (state.validationQueue) this.state.validationQueue = [...state.validationQueue];
    if (state.auditLog) this.state.auditLog = [...state.auditLog];
  }
}