export type ExternalRefMaps = {
  quests?: Record<string, true>;
  items?: Record<string, true>;
  zones?: Record<string, true>;
};

export type LinkInput = {
  npcs?: { id: string; quest?: string }[];
  equipment?: { id: string; itemId: string }[];
  placements?: { id: string; zoneId: string }[];
};

export type ResolveOutput = {
  op: 'resolveRefs';
  status: 'ok'|'error';
  issues: { code: string; message: string; ref?: string }[];
  resolvedRefs: Record<string, { ok: boolean; target?: string }>;
};

export type DumpLinksOutput = {
  op: 'dumpLinks';
  status: 'ok';
  issues: [];
  resolvedRefs: Record<string, { ok: boolean; target?: string }>;
};

export class EntityLinkerManager {
  private extern: ExternalRefMaps = {};
  private resolved: Record<string, { ok: boolean; target?: string }> = {};

  inject(extern: ExternalRefMaps){ this.extern = extern; }

  resolve(input: LinkInput): ResolveOutput {
    const issues: ResolveOutput['issues'] = [];
    this.resolved = {};
    // NPCs->Quests
    for(const n of input.npcs||[]){
      if(!n.quest){ continue; }
      const ok = !!this.extern.quests?.[n.quest];
      this.resolved[`npc:${n.id}:quest`] = { ok, target: ok? n.quest : undefined };
      if(!ok) issues.push({ code:'missing_quest', message:`NPC ${n.id} references missing quest ${n.quest}`, ref:n.quest });
    }
    // Equipment->Items
    for(const e of input.equipment||[]){
      const ok = !!this.extern.items?.[e.itemId];
      this.resolved[`equip:${e.id}:item`] = { ok, target: ok? e.itemId : undefined };
      if(!ok) issues.push({ code:'missing_item', message:`Equipment ${e.id} references missing item ${e.itemId}`, ref:e.itemId });
    }
    // Placements->Zones
    for(const p of input.placements||[]){
      const ok = !!this.extern.zones?.[p.zoneId];
      this.resolved[`place:${p.id}:zone`] = { ok, target: ok? p.zoneId : undefined };
      if(!ok) issues.push({ code:'missing_zone', message:`Placement ${p.id} references missing zone ${p.zoneId}`, ref:p.zoneId });
    }
    return { op:'resolveRefs', status: issues.length? 'error':'ok', issues, resolvedRefs: this.resolved };
  }

  dumpLinks(): DumpLinksOutput { return { op:'dumpLinks', status:'ok', issues:[], resolvedRefs: this.resolved }; }
}