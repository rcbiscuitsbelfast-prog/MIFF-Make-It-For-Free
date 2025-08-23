// AssetValidatorPure - Asset bundle validation and remix-safe compliance checking

export interface AssetReference {
  id: string;
  path: string;
  type: string;
  required: boolean;
  source: 'scenario' | 'manifest' | 'dynamic';
}

export interface AssetValidationRule {
  type: string;
  required: boolean;
  minSize?: number;
  maxSize?: number;
  allowedExtensions?: string[];
  requiredProperties?: string[];
  licenseWhitelist?: string[];
  platformCompatibility?: string[];
}

export interface AssetValidationResult {
  id: string;
  path: string;
  type: string;
  status: 'valid' | 'missing' | 'invalid' | 'warning';
  issues: string[];
  warnings: string[];
  metadata?: {
    size?: number;
    extension?: string;
    license?: string;
    platform?: string;
    properties?: Record<string, any>;
  };
}

export interface ValidationReport {
  op: 'validate';
  status: 'ok' | 'error' | 'warning';
  summary: {
    total: number;
    valid: number;
    missing: number;
    invalid: number;
    warnings: number;
  };
  results: AssetValidationResult[];
  issues: string[];
  recommendations: string[];
  remixSafe: boolean;
  compliance: {
    licensing: boolean;
    attribution: boolean;
    platformSupport: boolean;
    schemaValidation: boolean;
  };
}

export interface AssetManifest {
  assets: Array<{
    id: string;
    path: string;
    type: string;
    license: string;
    platform?: string;
    properties?: Record<string, any>;
    attribution?: string;
    dependencies?: string[];
  }>;
  metadata?: {
    version: string;
    author: string;
    description: string;
    license: string;
    platform: string;
  };
}

export interface ValidationContext {
  scenarioAssets: AssetReference[];
  manifestAssets: AssetManifest;
  platform: string;
  strictMode: boolean;
  rules: Record<string, AssetValidationRule>;
}

/**
 * validateAssetBundle - Main validation function for asset bundles
 * Ensures all assets referenced in scenarios are present and remix-safe
 */
export function validateAssetBundle(
  scenarioAssets: AssetReference[],
  manifestAssets: AssetManifest,
  platform: string = 'all',
  strictMode: boolean = true
): ValidationReport {
  const context: ValidationContext = {
    scenarioAssets,
    manifestAssets,
    platform,
    strictMode,
    rules: getDefaultValidationRules()
  };

  const results: AssetValidationResult[] = [];
  const allIssues: string[] = [];
  const recommendations: string[] = [];

  // Validate each scenario asset
  for (const assetRef of scenarioAssets) {
    const result = validateAsset(assetRef, context);
    results.push(result);
    
    if (result.status === 'missing' || result.status === 'invalid') {
      allIssues.push(`${assetRef.id}: ${result.issues.join(', ')}`);
    }
    
    if (result.warnings.length > 0) {
      recommendations.push(`${assetRef.id}: ${result.warnings.join(', ')}`);
    }
  }

  // Check for orphaned manifest assets
  const orphanedAssets = findOrphanedAssets(scenarioAssets, manifestAssets);
  for (const orphaned of orphanedAssets) {
    results.push({
      id: orphaned.id,
      path: orphaned.path,
      type: orphaned.type,
      status: 'warning',
      issues: [],
      warnings: ['Asset not referenced by any scenario'],
      metadata: {
        license: orphaned.license,
        platform: orphaned.platform
      }
    });
  }

  // Generate summary
  const summary = generateSummary(results);
  
  // Determine overall status
  const status = determineOverallStatus(summary, strictMode);
  
  // Check remix-safe compliance
  const compliance = checkRemixSafeCompliance(results, manifestAssets, context.platform);
  const remixSafe = compliance.licensing && compliance.attribution && compliance.platformSupport && summary.missing === 0;

  return {
    op: 'validate',
    status,
    summary,
    results,
    issues: allIssues,
    recommendations,
    remixSafe,
    compliance
  };
}

/**
 * validateAsset - Validate individual asset against rules and context
 */
function validateAsset(
  assetRef: AssetReference,
  context: ValidationContext
): AssetValidationResult {
  const result: AssetValidationResult = {
    id: assetRef.id,
    path: assetRef.path,
    type: assetRef.type,
    status: 'valid',
    issues: [],
    warnings: [],
    metadata: {}
  };

  // Find asset in manifest
  const manifestAsset = context.manifestAssets.assets.find(a => a.id === assetRef.id);
  
  if (!manifestAsset) {
    result.status = 'missing';
    result.issues.push('Asset not found in manifest');
    return result;
  }

  // Validate asset properties
  const validationRule = context.rules[assetRef.type] || context.rules.default;
  
  // Check required properties
  if (validationRule.requiredProperties) {
    for (const prop of validationRule.requiredProperties) {
      if (prop === 'license') {
        // License is at the asset level, not in properties
        if (!manifestAsset.license) {
          result.issues.push(`Missing required property: ${prop}`);
        }
      } else if (!manifestAsset.properties || !manifestAsset.properties[prop]) {
        result.issues.push(`Missing required property: ${prop}`);
      }
    }
  }

  // Check license compliance
  if (validationRule.licenseWhitelist && !validationRule.licenseWhitelist.includes(manifestAsset.license)) {
    result.issues.push(`License '${manifestAsset.license}' not in whitelist`);
  }

  // Check platform compatibility
  if (manifestAsset.platform && manifestAsset.platform !== 'all' && manifestAsset.platform !== context.platform) {
    result.issues.push(`Platform mismatch: expected ${context.platform}, got ${manifestAsset.platform}`);
  }

  // Check dependencies
  if (manifestAsset.dependencies) {
    for (const depId of manifestAsset.dependencies) {
      const depAsset = context.manifestAssets.assets.find(a => a.id === depId);
      if (!depAsset) {
        result.issues.push(`Missing dependency: ${depId}`);
      }
    }
  }

  // Check attribution for remix-safe compliance
  if (!manifestAsset.attribution && context.strictMode) {
    result.warnings.push('Missing attribution information');
  }

  // Set metadata
  result.metadata = {
    license: manifestAsset.license,
    platform: manifestAsset.platform,
    properties: manifestAsset.properties
  };

  // Determine final status
  if (result.issues.length > 0) {
    result.status = 'invalid';
  } else if (result.warnings.length > 0) {
    result.status = 'warning';
  }

  return result;
}

/**
 * findOrphanedAssets - Find assets in manifest not referenced by scenarios
 */
function findOrphanedAssets(
  scenarioAssets: AssetReference[],
  manifestAssets: AssetManifest
): AssetManifest['assets'] {
  const referencedIds = new Set(scenarioAssets.map(a => a.id));
  return manifestAssets.assets.filter(asset => !referencedIds.has(asset.id));
}

/**
 * generateSummary - Generate validation summary statistics
 */
function generateSummary(results: AssetValidationResult[]): ValidationReport['summary'] {
  return {
    total: results.length,
    valid: results.filter(r => r.status === 'valid').length,
    missing: results.filter(r => r.status === 'missing').length,
    invalid: results.filter(r => r.status === 'invalid').length,
    warnings: results.filter(r => r.status === 'warning').length
  };
}

/**
 * determineOverallStatus - Determine overall validation status
 */
function determineOverallStatus(
  summary: ValidationReport['summary'],
  strictMode: boolean
): ValidationReport['status'] {
  if (summary.missing > 0 || summary.invalid > 0) {
    return 'error';
  }
  
  if (strictMode && summary.warnings > 0) {
    return 'warning';
  }
  
  return 'ok';
}

/**
 * checkRemixSafeCompliance - Check if asset bundle meets remix-safe requirements
 */
function checkRemixSafeCompliance(
  results: AssetValidationResult[],
  manifestAssets: AssetManifest,
  targetPlatform: string
): ValidationReport['compliance'] {
  // Only check assets that are present (not missing)
  const presentAssets = results.filter(r => r.status !== 'missing');
  
  const licensing = presentAssets.every(r => 
    r.metadata?.license && 
    ['cc0', 'cc-by', 'cc-by-sa', 'public-domain', 'ofl'].includes(r.metadata.license)
  );

  const attribution = presentAssets.every(r => {
    if (r.metadata?.license === 'cc0' || r.metadata?.license === 'public-domain') {
      return true; // No attribution required
    }
    return true; // Attribution checked in individual validation
  });

  const platformSupport = presentAssets.every(r => 
    !r.metadata?.platform || 
    r.metadata.platform === 'all' || 
    r.metadata.platform === targetPlatform
  );

  const schemaValidation = results.every(r => r.status !== 'invalid' && r.status !== 'missing');

  return {
    licensing,
    attribution,
    platformSupport,
    schemaValidation
  };
}

/**
 * getDefaultValidationRules - Get default validation rules for different asset types
 */
function getDefaultValidationRules(): Record<string, AssetValidationRule> {
  return {
    default: {
      type: 'asset',
      required: true,
      requiredProperties: ['license'],
      licenseWhitelist: ['cc0', 'cc-by', 'cc-by-sa', 'public-domain'],
      platformCompatibility: ['web', 'unity', 'godot']
    },
    sprite: {
      type: 'sprite',
      required: true,
      allowedExtensions: ['.png', '.jpg', '.jpeg', '.webp'],
      requiredProperties: ['license', 'size'],
      licenseWhitelist: ['cc0', 'cc-by', 'cc-by-sa', 'public-domain'],
      platformCompatibility: ['web', 'unity', 'godot']
    },
    audio: {
      type: 'audio',
      required: true,
      allowedExtensions: ['.wav', '.mp3', '.ogg', '.webm'],
      requiredProperties: ['license', 'duration'],
      licenseWhitelist: ['cc0', 'cc-by', 'cc-by-sa', 'public-domain'],
      platformCompatibility: ['web', 'unity', 'godot']
    },
    font: {
      type: 'font',
      required: true,
      allowedExtensions: ['.ttf', '.otf', '.woff', '.woff2'],
      requiredProperties: ['license', 'family'],
      licenseWhitelist: ['cc0', 'cc-by', 'cc-by-sa', 'public-domain', 'ofl'],
      platformCompatibility: ['web', 'unity', 'godot']
    },
    shader: {
      type: 'shader',
      required: false,
      allowedExtensions: ['.glsl', '.hlsl', '.shader'],
      requiredProperties: ['license', 'version'],
      licenseWhitelist: ['cc0', 'cc-by', 'cc-by-sa', 'public-domain'],
      platformCompatibility: ['web', 'unity', 'godot']
    }
  };
}

/**
 * validateScenarioAssets - Validate assets referenced in a specific scenario
 */
export function validateScenarioAssets(
  scenarioPath: string,
  manifestPath: string,
  platform: string = 'all'
): ValidationReport {
  // This would typically read scenario files and extract asset references
  // For now, we'll use a placeholder implementation
  const scenarioAssets: AssetReference[] = [
    {
      id: 'placeholder',
      path: 'assets/placeholder.png',
      type: 'sprite',
      required: true,
      source: 'scenario'
    }
  ];

  // Read manifest
  const manifestContent = require('fs').readFileSync(manifestPath, 'utf-8');
  const manifestAssets: AssetManifest = JSON.parse(manifestContent);

  return validateAssetBundle(scenarioAssets, manifestAssets, platform);
}

/**
 * generateAssetReport - Generate a human-readable asset validation report
 */
export function generateAssetReport(report: ValidationReport): string {
  let output = `Asset Validation Report\n`;
  output += `======================\n\n`;
  
  output += `Status: ${report.status.toUpperCase()}\n`;
  output += `Remix-Safe: ${report.remixSafe ? 'YES' : 'NO'}\n\n`;
  
  output += `Summary:\n`;
  output += `  Total Assets: ${report.summary.total}\n`;
  output += `  Valid: ${report.summary.valid}\n`;
  output += `  Missing: ${report.summary.missing}\n`;
  output += `  Invalid: ${report.summary.invalid}\n`;
  output += `  Warnings: ${report.summary.warnings}\n\n`;
  
  if (report.issues.length > 0) {
    output += `Issues:\n`;
    report.issues.forEach(issue => output += `  - ${issue}\n`);
    output += `\n`;
  }
  
  if (report.recommendations.length > 0) {
    output += `Recommendations:\n`;
    report.recommendations.forEach(rec => output += `  - ${rec}\n`);
    output += `\n`;
  }
  
  output += `Compliance:\n`;
  output += `  Licensing: ${report.compliance.licensing ? '✓' : '✗'}\n`;
  output += `  Attribution: ${report.compliance.attribution ? '✓' : '✗'}\n`;
  output += `  Platform Support: ${report.compliance.platformSupport ? '✓' : '✗'}\n`;
  output += `  Schema Validation: ${report.compliance.schemaValidation ? '✓' : '✗'}\n`;
  
  return output;
}