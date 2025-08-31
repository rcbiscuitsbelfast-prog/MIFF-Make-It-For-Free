// HealthSystemPure - hp damage/heal with clamps

export type Health = { hp: number; max: number };
export type HealthEvent = { type:'damage'|'heal'; amount: number };

export function applyHealth(h: Health, events: HealthEvent[]): { op:'health'; status:'ok'; result: Health }{
  let hp = h.hp;
  for(const e of events){
    if(e.type==='damage') hp -= e.amount;
    else hp += e.amount;
    hp = Math.min(h.max, Math.max(0, hp));
  }
  return { op:'health', status:'ok', result: { hp, max: h.max } };
}

