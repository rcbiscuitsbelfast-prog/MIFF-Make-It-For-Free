import { AttributionConfig, AttributionOverride } from './Manager';

export function getOverride(): AttributionOverride | null {
  // Remix hook: return null to use default, or provide custom logic
  return {
    shouldShow(cfg: AttributionConfig){ return cfg.enabled !== false; },
    render(cfg: AttributionConfig){ 
      // Don't output to console.log as it interferes with JSON output
      // In a real implementation, this would render to the appropriate output
    }
  };
}