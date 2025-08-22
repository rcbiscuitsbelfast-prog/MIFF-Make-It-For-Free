export type AttributionConfig = { message: string; style?: string; durationMs?: number; enabled?: boolean };
export type AttributionOutput = { op:'showAttribution'; status:'ok'|'skipped'; issues:{code:string;message:string}[]; resolvedRefs:{}; rendered?: { message:string; style?:string; durationMs?:number } };

export type AttributionOverride = {
  shouldShow?(cfg:AttributionConfig): boolean;
  render?(cfg:AttributionConfig): void;
};

export class MiffAttributionManager {
  private override: AttributionOverride | null = null;
  setOverride(ovr: AttributionOverride){ this.override = ovr; }

  showAttribution(cfg: AttributionConfig): AttributionOutput {
    const issues:AttributionOutput['issues'] = [];
    const enabled = cfg.enabled !== false;
    const should = this.override?.shouldShow ? this.override.shouldShow(cfg) : enabled;
    if(!should){ return { op:'showAttribution', status:'skipped', issues, resolvedRefs:{} }; }
    try{
      if(this.override?.render) this.override.render(cfg);
      return { op:'showAttribution', status:'ok', issues, resolvedRefs:{}, rendered:{ message: cfg.message, style: cfg.style, durationMs: cfg.durationMs } };
    }catch(e:any){ issues.push({code:'render_error', message:String(e?.message||e)}); return { op:'showAttribution', status:'skipped', issues, resolvedRefs:{} }; }
  }
}