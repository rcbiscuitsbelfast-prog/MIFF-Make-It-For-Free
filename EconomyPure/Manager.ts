export type PriceRule = { id: string; itemId: string; basePrice: number; modifiers?: { key:string; value:number }[] };
export type VendorState = { id: string; inventory: Record<string, number>; markup: number; markdown: number };

export type PriceResult = { itemId:string; buy:number; sell:number };
export type OpOutput<T=unknown> = { op: string; status: 'ok'|'error'; result: T|null; issues: {code:string;message:string}[] };

export class EconomyManager {
  private rules = new Map<string, PriceRule>();
  private vendors = new Map<string, VendorState>();

  list(): string[] { return Array.from(new Set([...this.rules.keys(), ...this.vendors.keys()])); }

  createRule(r: PriceRule): OpOutput<PriceRule> { this.rules.set(r.id, r); return { op:'create', status:'ok', result:r, issues:[] }; }
  createVendor(v: VendorState): OpOutput<VendorState> { this.vendors.set(v.id, v); return { op:'create', status:'ok', result:v, issues:[] }; }

  dumpRule(id:string): OpOutput<PriceRule|undefined> { return { op:'dump', status:'ok', result:this.rules.get(id), issues:[] } }
  dumpVendor(id:string): OpOutput<VendorState|undefined> { return { op:'dump', status:'ok', result:this.vendors.get(id), issues:[] } }

  calculatePrice(vendorId:string, itemId:string): OpOutput<PriceResult> {
    const v = this.vendors.get(vendorId);
    const r = Array.from(this.rules.values()).find(x=>x.itemId===itemId);
    if(!v || !r) return { op:'simulate', status:'error', result:null, issues:[{code:'missing', message: !v? `vendor ${vendorId}`:`rule for ${itemId}`}] };
    const base = r.basePrice;
    const buy = Math.round(base * (1 + v.markup));
    const sell = Math.round(base * (1 - v.markdown));
    return { op:'simulate', status:'ok', result:{ itemId, buy, sell }, issues:[] };
  }
}