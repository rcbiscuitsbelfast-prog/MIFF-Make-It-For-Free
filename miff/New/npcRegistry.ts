export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  dialogue: string[];
}

const npcMap = new Map<string, NPC>();

export function registerNPC(npc: NPC): void {
  npcMap.set(npc.id, npc);
}

export function getNPC(id: string): NPC | undefined {
  return npcMap.get(id);
}

export function getAllNPCs(): NPC[] {
  return Array.from(npcMap.values());
}

// Example NPC
registerNPC({
  id: 'elderSpirit',
  name: 'Elder Spirit',
  x: 5,
  y: 5,
  dialogue: ['Welcome, traveler.', 'The grove remembers you.'],
});
