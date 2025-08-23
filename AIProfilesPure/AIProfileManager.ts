export type Role = 'vendor' | 'questGiver' | 'wanderer' | 'guard' | 'custom';

export type ScheduleEntry = { time: string; action: string };

export type AIProfile = {
  id: string;
  role: Role;
  behaviorTree?: string;
  schedule?: ScheduleEntry[];
  dialogId?: string;
  questId?: string;
};

export type BehaviorResult = {
  npcId: string;
  role: Role;
  actions: string[];
  dialogId?: string;
  questId?: string;
};

export interface Hooks {
  onNPCInteract?: (npcId: string, role: Role) => void;
  onScheduleTrigger?: (npcId: string, entry: ScheduleEntry) => void;
  onRoleAssigned?: (npcId: string, role: Role) => void;
}

export class AIProfileManager {
  private profiles = new Map<string, AIProfile>();
  private hooks: Hooks;

  constructor(hooks: Hooks = {}) {
    this.hooks = hooks;
  }

  load(profiles: AIProfile[]) {
    this.profiles.clear();
    for (const p of profiles) this.profiles.set(p.id, p);
  }

  listProfiles(): string[] {
    return Array.from(this.profiles.keys());
  }

  getProfile(npcId: string): AIProfile | undefined {
    return this.profiles.get(npcId);
  }

  assignRole(npcId: string, role: Role) {
    const p = this.ensure(npcId);
    p.role = role;
    this.hooks.onRoleAssigned?.(npcId, role);
  }

  linkDialog(npcId: string, dialogId: string) {
    const p = this.ensure(npcId);
    p.dialogId = dialogId;
  }

  linkQuest(npcId: string, questId: string) {
    const p = this.ensure(npcId);
    p.questId = questId;
  }

  getSchedule(npcId: string): ScheduleEntry[] {
    return this.ensure(npcId).schedule || [];
  }

  simulateBehavior(npcId: string): BehaviorResult {
    const p = this.ensure(npcId);
    this.hooks.onNPCInteract?.(npcId, p.role);
    const actions: string[] = [];
    switch (p.role) {
      case 'vendor':
        actions.push('openShop');
        if (p.dialogId) actions.push('talk');
        break;
      case 'questGiver':
        if (p.questId) actions.push(`offerQuest:${p.questId}`);
        if (p.dialogId) actions.push('talk');
        break;
      case 'wanderer':
        actions.push('wander');
        break;
      case 'guard':
        actions.push('patrol');
        break;
      case 'custom':
        if (p.behaviorTree) actions.push(`runBT:${p.behaviorTree}`); else actions.push('idle');
        break;
    }
    // Trigger first schedule entry (if any) for deterministic output
    const first = (p.schedule || [])[0];
    if (first) {
      actions.push(`schedule:${first.time}:${first.action}`);
      this.hooks.onScheduleTrigger?.(npcId, first);
    }
    return { npcId, role: p.role, actions, dialogId: p.dialogId, questId: p.questId };
  }

  private ensure(npcId: string): AIProfile {
    let p = this.profiles.get(npcId);
    if (!p) {
      p = { id: npcId, role: 'wanderer' };
      this.profiles.set(npcId, p);
    }
    return p;
  }
}

