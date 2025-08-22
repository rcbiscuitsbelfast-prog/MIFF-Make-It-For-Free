export type ValidationRule = 'missing_refs' | 'stat_bounds' | 'zone_overlap';
export type ValidationConfig = { rules: ValidationRule[] };

export type ValidationInput = {
  refs?: Record<string, { ok: boolean }>; // from EntityLinker
  stats?: { id: string; stats: { key: string; base: number }[] }[];
  zones?: { id: string; x: number; y: number; w: number; h: number }[];
};

export type ValidateOutput = {
  op: 'validateAll';
  status: 'ok'|'error';
  issues: { code: string; message: string; ref?: string }[];
  resolvedRefs: {};
};

export type ReportOutput = {
  op: 'reportIssues';
  status: 'ok';
  issues: ValidateOutput['issues'];
  resolvedRefs: {};
};

export class ValidationManager {
  private config: ValidationConfig = { rules: ['missing_refs','stat_bounds','zone_overlap'] };
  private lastIssues: ValidateOutput['issues'] = [];

  configure(cfg: ValidationConfig){ this.config = cfg; }

  validateAll(input: ValidationInput): ValidateOutput {
    const issues: ValidateOutput['issues'] = [];
    // missing_refs
    if(this.config.rules.includes('missing_refs')){
      for(const [k,v] of Object.entries(input.refs||{})) if(!v.ok) issues.push({ code:'missing_ref', message:`Missing reference ${k}`, ref:k });
    }
    // stat_bounds (ensure base within 0..999)
    if(this.config.rules.includes('stat_bounds')){
      for(const e of input.stats||[]){
        for(const s of e.stats){
          if(s.base < 0 || s.base > 999) issues.push({ code:'stat_bounds', message:`${e.id}.${s.key} out of bounds: ${s.base}`, ref:`${e.id}.${s.key}` });
        }
      }
    }
    // zone_overlap (naive AABB overlap check)
    if(this.config.rules.includes('zone_overlap')){
      const zs = input.zones||[];
      for(let i=0;i<zs.length;i++) for(let j=i+1;j<zs.length;j++){
        const a = zs[i], b = zs[j];
        const overlap = !(a.x+a.w<=b.x || b.x+b.w<=a.x || a.y+a.h<=b.y || b.y+b.h<=a.y);
        if(overlap) issues.push({ code:'zone_overlap', message:`Zones ${a.id} and ${b.id} overlap`, ref:`${a.id}|${b.id}` });
      }
    }
    this.lastIssues = issues;
    return { op:'validateAll', status: issues.length? 'error':'ok', issues, resolvedRefs:{} };
  }

  reportIssues(): ReportOutput { return { op:'reportIssues', status:'ok', issues:this.lastIssues, resolvedRefs:{} } }
}