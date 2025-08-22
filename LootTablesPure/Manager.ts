export type LootEntry = { id: string; weight: number; rarity: 'common'|'rare'|'epic'; statRolls?: { key:string; min:number; max:number }[] };
export type LootTable = { id: string; entries: LootEntry[] };

export type LootResult = { drops: { id:string; rarity:string; rolledStats?: Record<string,number> }[] };
export type OpOutput<T=unknown> = { op: string; status: 'ok'|'error'; result: T|null; issues: {code:string;message:string}[] };

export class LootTablesManager {
  private tables = new Map<string, LootTable>();

  list(): string[] { return Array.from(this.tables.keys()); }
  create(t: LootTable): OpOutput<LootTable> { this.tables.set(t.id,t); return { op:'create', status:'ok', result:t, issues:[] }; }
  dump(id:string): OpOutput<LootTable|undefined> { return { op:'dump', status:'ok', result:this.tables.get(id), issues:[] } }

  rollLoot(tableId:string, count:number): OpOutput<LootResult> {
    const t = this.tables.get(tableId);
    if(!t) return { op:'simulate', status:'error', result:null, issues:[{code:'missing_table', message:tableId}] };
    // Deterministic: sort by weight desc, pick first N
    const sorted = [...t.entries].sort((a,b)=>b.weight-a.weight);
    const picks = sorted.slice(0, Math.max(0, Math.min(count, sorted.length)));
    const drops = picks.map(e=>({ id:e.id, rarity:e.rarity, rolledStats: e.statRolls? Object.fromEntries(e.statRolls.map(r=>[r.key, r.min])) : undefined }));
    return { op:'simulate', status:'ok', result:{ drops }, issues:[] };
  }
}