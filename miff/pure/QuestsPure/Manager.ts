export type Quest = { id: string; title?: string; steps?: any[]; rewards?: any[] };

export class QuestsManager {
	private quests: Record<string, Quest> = {};
	listQuests(){ return { op:'listQuests', status:'ok' as const, result: Object.values(this.quests) } }
	updateQuest(id: string, data: Partial<Quest>){
		this.quests[id] = { ...(this.quests[id]||{ id }), ...data };
		return { op:'updateQuest', status:'ok' as const, result: this.quests[id] };
	}
}