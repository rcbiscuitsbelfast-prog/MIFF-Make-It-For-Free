export type FlagCondition = { flagID: string; requiredState?: boolean };
export type DialogueChoice = { text: string; leadsToChoiceID?: string; conditions?: FlagCondition[]; setFlags?: string[] };
export type DialogueLine = { speaker: string; text: string; choiceID?: string; choices?: DialogueChoice[]; tags?: string[] };
export type InteractionType = 'Dialogue' | 'QuestTrigger' | 'ItemExchange' | 'LoreUnlock' | 'BattleChallenge';
export type NPCData = {
  id: string;
  name: string;
  interactionType?: InteractionType;
  dialogue?: DialogueLine[];
  questFlagsToSet?: string[];
  itemsToGrant?: Record<string, number>;
  codexUnlockFlags?: string[];
};

export function validateNPC(npc: any): npc is NPCData {
  if (!npc || typeof npc !== 'object') return false;
  if (typeof npc.id !== 'string' || typeof npc.name !== 'string') return false;
  if (npc.dialogue && !Array.isArray(npc.dialogue)) return false;
  return true;
}
