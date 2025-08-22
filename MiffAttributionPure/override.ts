import { AttributionConfig, AttributionOverride } from './Manager';

export function getOverride(): AttributionOverride | null {
  // Remix hook: return null to use default, or provide custom logic
  return {
    shouldShow(cfg: AttributionConfig){ return cfg.enabled !== false; },
    render(cfg: AttributionConfig){ if(cfg.style?.startsWith('console')) console.log(cfg.message); }
  };
}