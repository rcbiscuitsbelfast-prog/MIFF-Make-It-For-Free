type TriggerFn = (npcId: string, x: number, y: number) => void;

const npcTriggers = new Map<string, TriggerFn>();

export function registerNPCTrigger(npcId: string, fn: TriggerFn): void {
  npcTriggers.set(npcId, fn);
}

export function runNPCTrigger(npcId: string, x: number, y: number): void {
  const fn = npcTriggers.get(npcId);
  if (fn) fn(npcId, x
