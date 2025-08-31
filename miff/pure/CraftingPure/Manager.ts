import type { StatBlock } from '../SharedSchemaPure/Manager';

export type Recipe = { id: string; inputs: Record<string, number>; outputs: Record<string, number>; statMods?: StatBlock };
export type Inventory = Record<string, number>;

export type CraftResult = { crafted: Record<string, number>; remaining: Inventory; statMods?: StatBlock };
export type OpOutput<T=unknown> = { op: string; status: 'ok'|'error'; result: T|null; issues: {code:string;message:string}[] };

export class CraftingManager {
  private recipes = new Map<string, Recipe>();

  list(): string[] { return Array.from(this.recipes.keys()); }
  create(r: Recipe): OpOutput<Recipe> {
    this.recipes.set(r.id, r);
    return { op:'create', status:'ok', result:r, issues:[] };
  }
  dump(id: string): OpOutput<Recipe|undefined> { return { op:'dump', status:'ok', result:this.recipes.get(id), issues:[] }; }

  simulateCraft(recipeId: string, inv: Inventory): OpOutput<CraftResult> {
    const r = this.recipes.get(recipeId);
    if(!r) return { op:'simulate', status:'error', result:null, issues:[{code:'missing_recipe', message:recipeId}] };
    // check requirements
    for(const [k,qty] of Object.entries(r.inputs)){
      if((inv[k]||0) < qty) return { op:'simulate', status:'error', result:null, issues:[{code:'insufficient', message:`${k} x${qty}`}] };
    }
    const remaining:Inventory = { ...inv };
    for(const [k,qty] of Object.entries(r.inputs)) remaining[k] = (remaining[k]||0) - qty;
    const crafted:Record<string,number> = {};
    for(const [k,qty] of Object.entries(r.outputs)) crafted[k] = qty;
    return { op:'simulate', status:'ok', result:{ crafted, remaining, statMods:r.statMods }, issues:[] };
  }
}