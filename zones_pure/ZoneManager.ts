export type ZoneId = string;

export type QuestStatus = 'Active' | 'Completed' | 'Failed';

export type Condition =
  | { type: 'requiresItem'; itemId: string; quantity?: number }
  | { type: 'requiresQuestState'; questId: string; status?: QuestStatus; minStep?: number }
  | { type: 'flag'; key: string; equals?: string | number | boolean };

export type TransitionEffect =
  | { type: 'dialog'; dialogId: string }
  | { type: 'rewardItem'; itemId: string; quantity?: number }
  | { type: 'questAdvance'; questId: string; step?: number; status?: QuestStatus }
  | { type: 'lightingPreset'; preset: string }
  | { type: 'overlay'; action: 'fadeIn' | 'fadeOut' | 'tint' | 'flash'; color?: string; duration?: number };

export type ZoneTrigger = {
  id: string;
  fromZone?: ZoneId; // optional origin; undefined => any
  toZone?: ZoneId;   // optional destination; may be set by effects/logic
  kind: 'enter' | 'exit' | 'interact';
  conditions?: Condition[];
  effects?: TransitionEffect[];
  tags?: string[];
};

export interface DialogEvents {
  startDialog: (dialogId: string) => void;
}

export interface InventoryEvents {
  addItem: (itemId: string, quantity: number) => void;
  hasItem: (itemId: string, minQuantity: number) => boolean;
}

export interface QuestEvents {
  setFlag: (questId: string, step?: number, status?: QuestStatus) => void;
  getState: (questId: string) => { step: number; status: QuestStatus } | undefined;
}

export interface WorldHooks {
  setLightingPreset?: (preset: string) => void;
  overlay?: (action: 'fadeIn' | 'fadeOut' | 'tint' | 'flash', color?: string, duration?: number) => void;
}

export interface ZoneManagerDeps {
  dialog?: DialogEvents;
  inventory?: InventoryEvents;
  quests?: QuestEvents;
  world?: WorldHooks;
  logger?: (msg: string) => void;
}

export type ZoneDefinition = { id: ZoneId; name?: string; tags?: string[] };

export class ZoneManager {
  private zones = new Map<ZoneId, ZoneDefinition>();
  private triggers = new Map<string, ZoneTrigger>();
  private flags = new Map<string, string | number | boolean>();
  private currentZone: ZoneId | '' = '';
  private deps: ZoneManagerDeps;

  constructor(deps: ZoneManagerDeps = {}) {
    this.deps = deps;
  }

  defineZone(z: ZoneDefinition) {
    this.zones.set(z.id, z);
    this.log(`ZONE DEF ${z.id}`);
  }

  setFlag(key: string, value: string | number | boolean) {
    this.flags.set(key, value);
    this.log(`FLAG ${key}=${String(value)}`);
  }

  registerTrigger(t: ZoneTrigger) {
    this.triggers.set(t.id, t);
    this.log(`TRIGGER REG ${t.id} ${t.kind}`);
  }

  getCurrentZone() {
    return this.currentZone;
  }

  enter(zoneId: ZoneId) {
    this.currentZone = zoneId;
    this.log(`ENTER ${zoneId}`);
    this.fireKind('enter', zoneId);
  }

  exit(zoneId: ZoneId) {
    if (this.currentZone === zoneId) this.currentZone = '';
    this.log(`EXIT ${zoneId}`);
    this.fireKind('exit', zoneId);
  }

  interact(triggerId?: string) {
    if (triggerId) {
      const t = this.triggers.get(triggerId);
      if (t && t.kind === 'interact') {
        this.tryTrigger(t);
        return;
      }
    }
    // fallback: run all interact triggers applicable to current zone
    for (const t of this.triggers.values()) {
      if (t.kind === 'interact' && this.appliesToCurrent(t)) this.tryTrigger(t);
    }
  }

  private fireKind(kind: ZoneTrigger['kind'], zoneId: ZoneId) {
    for (const t of this.triggers.values()) {
      if (t.kind !== kind) continue;
      if (kind === 'enter' && t.toZone && t.toZone !== zoneId) continue;
      if (kind === 'exit' && t.fromZone && t.fromZone !== zoneId) continue;
      if (this.appliesToCurrent(t)) this.tryTrigger(t);
    }
  }

  private appliesToCurrent(t: ZoneTrigger) {
    if (t.fromZone && this.currentZone && t.kind !== 'enter' && t.fromZone !== this.currentZone) return false;
    if (t.toZone && t.kind === 'enter' && t.toZone !== this.currentZone) return false;
    return true;
  }

  private tryTrigger(t: ZoneTrigger) {
    if (!this.checkConditions(t.conditions || [])) {
      this.log(`TRIGGER SKIP ${t.id} (conditions)`);
      return false;
    }
    this.applyEffects(t.effects || [], t);
    this.log(`TRIGGER OK ${t.id}`);
    return true;
  }

  private checkConditions(conds: Condition[]) {
    for (const c of conds) {
      if (c.type === 'requiresItem') {
        const qty = c.quantity ?? 1;
        if (!this.deps.inventory?.hasItem(c.itemId, qty)) return false;
      } else if (c.type === 'requiresQuestState') {
        const s = this.deps.quests?.getState(c.questId);
        if (!s) return false;
        if (c.status && s.status !== c.status) return false;
        if (c.minStep != null && s.step < c.minStep) return false;
      } else if (c.type === 'flag') {
        const v = this.flags.get(c.key);
        if (c.equals !== undefined) { if (v !== c.equals) return false; }
        else if (v === undefined || v === false || v === 0 || v === '') return false;
      }
    }
    return true;
  }

  private applyEffects(effects: TransitionEffect[], t: ZoneTrigger) {
    for (const e of effects) {
      if (e.type === 'dialog') {
        this.deps.dialog?.startDialog(e.dialogId);
        this.log(`DIALOG ${e.dialogId}`);
      } else if (e.type === 'rewardItem') {
        const q = e.quantity ?? 1;
        this.deps.inventory?.addItem(e.itemId, q);
        this.log(`REWARD ${e.itemId} x${q}`);
      } else if (e.type === 'questAdvance') {
        this.deps.quests?.setFlag(e.questId, e.step, e.status);
        this.log(`QUEST ${e.questId} -> step=${e.step ?? 'keep'} status=${e.status ?? 'keep'}`);
      } else if (e.type === 'lightingPreset') {
        this.deps.world?.setLightingPreset?.(e.preset);
        this.log(`LIGHT ${e.preset}`);
      } else if (e.type === 'overlay') {
        this.deps.world?.overlay?.(e.action, e.color, e.duration);
        const d = e.duration ?? 0;
        this.log(`OVERLAY ${e.action}${e.color ? ' ' + e.color : ''} ${d}`.trim());
      }
    }
  }

  private log(msg: string) {
    this.deps.logger?.(msg);
  }
}

