import { LicenseAuditOverride, LicenseInfo, LicenseType, LicenseCompatibility } from './Manager';

export function getOverride(): LicenseAuditOverride {
  return {
    validateLicense: (license: LicenseInfo): boolean => {
      // Custom validation: ensure all licenses have descriptions
      if (!license.description || license.description.length < 10) {
        return false;
      }
      
      // Ensure remix-safe licenses have clear requirements
      if (license.remixSafe && license.requirements.length === 0) {
        return false;
      }
      
      return true;
    },
    
    getCustomLicense: (moduleId: string): LicenseInfo | null => {
      // Special modules get custom licenses
      const specialLicenses: Record<string, LicenseInfo> = {
        'MiffAttributionPure': {
          type: 'AGPLv3',
          version: '3.0',
          url: 'https://www.gnu.org/licenses/agpl-3.0.en.html',
          spdxId: 'AGPL-3.0',
          description: 'GNU Affero General Public License v3.0 with MIFF attribution requirements',
          requirements: [
            'Source code must be open',
            'Network use triggers source distribution',
            'Derivative works must be AGPLv3',
            'MIFF attribution must be preserved'
          ],
          restrictions: [
            'Cannot be closed-source',
            'Network use requires source availability',
            'Cannot remove MIFF attribution'
          ],
          remixSafe: true,
          commercialUse: 'restricted',
          attributionRequired: true,
          sourceCodeRequired: true,
          derivativeWorks: 'allowed'
        },
        
        'BridgeSchemaPure': {
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
}