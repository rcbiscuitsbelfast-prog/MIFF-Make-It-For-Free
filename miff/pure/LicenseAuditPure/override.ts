// Define license types locally since they don't exist in ConsolidatedSchema
type LicenseType = 'MIT' | 'Apache' | 'GPL' | 'BSD' | 'Custom' | 'CC-BY-SA-4.0';
type LicenseCompatibility = 'compatible' | 'incompatible' | 'conditional' | 'requires-review';

interface LicenseInfo {
  type: LicenseType;
  name: string;
  description: string;
  compatible: boolean;
  version?: string;
  url?: string;
  spdxId?: string;
  requirements?: any;
  restrictions?: any;
  remixSafe?: boolean;
  commercialUse?: boolean;
  attributionRequired?: boolean;
  sourceCodeRequired?: boolean;
  derivativeWorks?: string;
}

interface LicenseAuditOverride {
  getSpecialLicense: (moduleId: string) => LicenseInfo | null;
  validateLicense: (license: LicenseInfo) => boolean;
  getCompatibilityMatrix: () => Record<string, string[]>;
  checkCompatibility: (license1: LicenseType, license2: LicenseType) => LicenseCompatibility;
}

export const licenseAuditOverride: LicenseAuditOverride = {
  getSpecialLicense: (moduleId: string): LicenseInfo | null => {
    const specialLicenses: Record<string, LicenseInfo> = {
      'SchemaPure': {
        type: 'CC-BY-SA-4.0',
        name: 'Creative Commons Attribution-ShareAlike 4.0',
        version: '4.0',
        url: 'https://creativecommons.org/licenses/by-sa/4.0/',
        spdxId: 'CC-BY-SA-4.0',
        description: 'Creative Commons Attribution-ShareAlike 4.0 International for schema definitions',
        compatible: true,
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
        commercialUse: true,
        attributionRequired: true,
        sourceCodeRequired: false,
        derivativeWorks: 'allowed'
      }
    };
    
    return specialLicenses[moduleId] || null;
  },
  
  validateLicense: (license: LicenseInfo): boolean => {
    return license.compatible && license.type !== 'Custom';
  },
  
  getCompatibilityMatrix: (): Record<string, string[]> => {
    return {
      'MIT': ['MIT', 'Apache', 'BSD'],
      'Apache': ['MIT', 'Apache'],
      'GPL': ['GPL', 'AGPL'],
      'BSD': ['MIT', 'Apache', 'BSD']
    };
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