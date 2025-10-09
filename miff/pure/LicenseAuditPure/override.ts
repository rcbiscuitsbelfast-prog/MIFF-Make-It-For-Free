import { LicenseAuditOverride, LicenseInfo, LicenseType, LicenseCompatibility } from '../shared/ConsolidatedSchema.js';

export const licenseAuditOverride: LicenseAuditOverride = {
  getSpecialLicense: (moduleId: string): LicenseInfo | null => {
    const specialLicenses: Record<string, LicenseInfo> = {
      'SchemaPure': {
        type: 'CC-BY-SA-4.0',
        version: '4.0',
        url: 'https://creativecommons.org/licenses/by-sa/4.0/',
        spdxId: 'CC-BY-SA-4.0',
        description: 'Creative Commons Attribution-ShareAlike 4.0 International for schema definitions',
        requirements: [
          'Attribution required',
          'Derivative works must be CC-BY-SA-4.0',
          'Schema compatibility must be maintained'
        ],
        restrictions: [
          'Cannot use more restrictive license',
          'Cannot break schema compatibility'
        ],
        remixSafe: true,
        commercialUse: 'allowed',
        attributionRequired: true,
        sourceCodeRequired: false,
        derivativeWorks: 'allowed'
      }
    };
    
    return specialLicenses[moduleId] || null;
  },
  
  checkCompatibility: (license1: LicenseType, license2: LicenseType): LicenseCompatibility => {
    // Custom compatibility matrix
    const compatibilityMatrix: Record<string, Record<string, LicenseCompatibility>> = {
      'AGPLv3': {
        'AGPLv3': 'compatible',
        'GPLv3': 'compatible',
        'MIT': 'incompatible',
        'CC-BY-SA-4.0': 'requires-review'
      },
      'MIT': {
        'AGPLv3': 'incompatible',
        'GPLv3': 'incompatible',
        'MIT': 'compatible',
        'CC-BY-SA-4.0': 'compatible'
      },
      'CC-BY-SA-4.0': {
        'AGPLv3': 'requires-review',
        'GPLv3': 'requires-review',
        'MIT': 'compatible',
        'CC-BY-SA-4.0': 'compatible'
      }
    };
    
    return compatibilityMatrix[license1]?.[license2] || 'unknown';
  }
};