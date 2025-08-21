export type Stats = { hp:number; maxHp:number; atk:number; def:number; spd:number };
export type Combatant = { id:string; name:string; team:string; stats:Stats; status?:{defending?:boolean; ko?:boolean; fled?:boolean} };
export type Action = { actorId:string; type:'attack'|'defend'|'item'|'flee'; targetId?:string; itemId?:string };

export interface InventoryHook { hasItem:(id:string)=>boolean; consumeItem:(id:string)=>void }
export interface AIHook { pickAction:(state:CombatState, combatantId:string)=>Action }
export interface SaveHook { onCheckpoint?:(state:CombatState)=>void }

export type CombatState = { combatants:Record<string,Combatant>; order:string[]; queue:Action[]; over?:boolean; winnerTeam?:string };

export class CombatEngine {
  state: CombatState;
  inventory?: InventoryHook;
  ai?: AIHook;
  save?: SaveHook;
  constructor(){ this.state={combatants:{}, order:[], queue:[]}; }
  addCombatant(c:Combatant){ this.state.combatants[c.id]=c; this.rebuildOrder(); }
  rebuildOrder(){ this.state.order = Object.values(this.state.combatants).sort((a,b)=>b.stats.spd-a.stats.spd).map(c=>c.id); }
  enqueue(a:Action){ this.state.queue.push(a); }
  stepTurn(){ if(this.state.over) return; const next = this.state.queue.shift(); if(!next){ return; } this.resolve(next); this.checkVictory(); this.save?.onCheckpoint?.(this.state); }
  resolve(a:Action){ const actor = this.state.combatants[a.actorId]; if(!actor||actor.status?.ko) return;
    switch(a.type){
      case 'attack': this.attack(actor, a.targetId!); break;
      case 'defend': actor.status={...(actor.status||{}), defending:true}; break;
      case 'item': this.useItem(actor, a); break;
      case 'flee': actor.status={...(actor.status||{}), fled:true}; break;
    }
  }
  attack(actor:Combatant, targetId:string){ const tgt = this.state.combatants[targetId]; if(!tgt||tgt.status?.ko) return; const base = Math.max(1, actor.stats.atk - tgt.stats.def); const defendMod = (tgt.status?.defending? 0.5 : 1.0); const dmg = Math.max(1, Math.floor(base*defendMod)); tgt.stats.hp = Math.max(0, tgt.stats.hp - dmg); tgt.status={...(tgt.status||{}), defending:false, ko:(tgt.stats.hp<=0)}; }
  useItem(actor:Combatant, a:Action){ const item = a.itemId || ''; if(this.inventory && !this.inventory.hasItem(item)){ return; }
    if(item==='potion'){ actor.stats.hp = Math.min(actor.stats.maxHp, actor.stats.hp + 20); }
    if(this.inventory) this.inventory.consumeItem(item);
  }
  checkVictory(){ const teams = new Map<string,{alive:number,fled:number}>();
    for(const c of Object.values(this.state.combatants)){
      const t = teams.get(c.team)||{alive:0,fled:0}; if(!c.status?.ko) t.alive++; if(c.status?.fled) t.fled++; teams.set(c.team,t);
    }
    const aliveTeams = Array.from(teams.entries()).filter(([_,v])=>v.alive>0);
    if(aliveTeams.length<=1){ this.state.over=true; this.state.winnerTeam = aliveTeams[0]?.[0]||undefined; }
  }
}