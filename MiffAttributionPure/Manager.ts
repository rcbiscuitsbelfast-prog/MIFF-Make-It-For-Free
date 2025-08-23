export type AttributionConfig = { 
  message: string; 
  style?: string; 
  durationMs?: number; 
  enabled?: boolean;
  showLicense?: boolean;
  showContributors?: boolean;
  showRemixStatus?: boolean;
};

export type Contributor = {
  name: string;
  role: string;
  contact?: string;
  license?: string;
};

export type LicenseInfo = {
  type: string;
  version: string;
  url?: string;
  requirements: string[];
  remixSafe: boolean;
};

export type AttributionOutput = { 
  op: 'showAttribution'; 
  status: 'ok' | 'skipped'; 
  issues: { code: string; message: string }[]; 
  resolvedRefs: {}; 
  rendered?: { 
    message: string; 
    style?: string; 
    durationMs?: number;
    license?: LicenseInfo;
    contributors?: Contributor[];
    remixStatus: 'remix-required' | 'remix-optional' | 'remix-safe';
  };
};

export type AttributionOverride = {
  shouldShow?(cfg: AttributionConfig): boolean;
  render?(cfg: AttributionConfig): void;
  getContributors?(): Contributor[];
  getLicenseInfo?(): LicenseInfo;
};

export class MiffAttributionManager {
  private override: AttributionOverride | null = null;
  
  setOverride(ovr: AttributionOverride) { 
    this.override = ovr; 
  }

  private getDefaultContributors(): Contributor[] {
    return [
      {
        name: "R.C. Biscuits",
        role: "Framework Architect",
        contact: "miff@yourdomain.dev",
        license: "CC-BY-SA 4.0"
      }
    ];
  }

  private getDefaultLicenseInfo(): LicenseInfo {
    return {
      type: "AGPLv3 + Commercial",
      version: "3.0",
      url: "https://www.gnu.org/licenses/agpl-3.0.en.html",
      requirements: [
        "Attribution required",
        "Source code must be open",
        "Commercial use requires license"
      ],
      remixSafe: true
    };
  }

  private getRemixStatus(): 'remix-required' | 'remix-optional' | 'remix-safe' {
    return 'remix-safe';
  }

  showAttribution(cfg: AttributionConfig): AttributionOutput {
    const issues: AttributionOutput['issues'] = [];
    const enabled = cfg.enabled !== false;
    const should = this.override?.shouldShow ? this.override.shouldShow(cfg) : enabled;
    
    if (!should) { 
      return { 
        op: 'showAttribution', 
        status: 'skipped', 
        issues, 
        resolvedRefs: {} 
      }; 
    }
    
    try {
      if (this.override?.render) this.override.render(cfg);
      
      const contributors = this.override?.getContributors?.() || this.getDefaultContributors();
      const license = this.override?.getLicenseInfo?.() || this.getDefaultLicenseInfo();
      const remixStatus = this.getRemixStatus();
      
      const rendered: AttributionOutput['rendered'] = {
        message: cfg.message,
        style: cfg.style,
        durationMs: cfg.durationMs,
        remixStatus: remixStatus
      };

      if (cfg.showLicense !== false) {
        rendered.license = license;
      }
      
      if (cfg.showContributors !== false) {
        rendered.contributors = contributors;
      }
      
      if (cfg.showRemixStatus !== false) {
        rendered.remixStatus = remixStatus;
      }

      return { 
        op: 'showAttribution', 
        status: 'ok', 
        issues, 
        resolvedRefs: {}, 
        rendered 
      };
    } catch (e: any) { 
      issues.push({ code: 'render_error', message: String(e?.message || e) }); 
      return { 
        op: 'showAttribution', 
        status: 'skipped', 
        issues, 
        resolvedRefs: {} 
      }; 
    }
  }

  getLicenseMetadata(): LicenseInfo {
    return this.override?.getLicenseInfo?.() || this.getDefaultLicenseInfo();
  }

  getContributorInfo(): Contributor[] {
    return this.override?.getContributors?.() || this.getDefaultContributors();
  }

  getRemixSafetyInfo(): { status: 'remix-required' | 'remix-optional' | 'remix-safe'; details: string } {
    const status = this.getRemixStatus();
    const details = status === 'remix-safe' 
      ? "This module is designed for safe remixing and distribution"
      : status === 'remix-optional'
      ? "Remixing is optional but recommended for full functionality"
      : "Remixing is required for proper attribution and compliance";
    
    return { status, details };
  }
}