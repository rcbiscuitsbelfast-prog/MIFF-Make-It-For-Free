export interface Quest {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  description: string;
  completed: boolean;
}

const quests = new Map<string, Quest>();

export function addQuest(id: string, description: string): void {
  quests.set(id, { id, description, completed: false });
}

export function completeQuest(id: string): void {
  const quest = quests.get(id);
  if (quest) quest.completed = true;
}

export function getQuestStatus(id: string): Quest | undefined {
  return quests.get(id);
}

export function listQuests(): Quest[] {
  return Array.from(quests.values());
}
