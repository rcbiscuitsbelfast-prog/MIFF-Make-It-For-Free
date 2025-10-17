export type Stat = { key: string; base: number };
export type EntityStats = { id: string; stats: Stat[] };

export class StatsManager {
  private entities = new Map<string, EntityStats>();

  list(): string[] { return Array.from(this.entities.keys()); }
  create(id: string, stats: Stat[] = []): EntityStats { const e={id,stats:[...stats]}; this.entities.set(id,e); return e; }
  get(id: string): EntityStats|undefined { return this.entities.get(id); }
  setStat(id: string, key: string, base: number) { const e=this.ensure(id); const s=e.stats.find(x=>x.key===key); if(s) s.base=base; else e.stats.push({key,base}); }
  simulate(id: string): { id:string; total:number } { const e=this.ensure(id); const total=e.stats.reduce((a,s)=>a+(s.base||0),0); return { id, total }; }

  private ensure(id:string){ let e=this.entities.get(id); if(!e){ e={id,stats:[]}; this.entities.set(id,e);} return e; }
}