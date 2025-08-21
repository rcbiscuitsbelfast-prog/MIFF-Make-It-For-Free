export type DialogChoice = {
  id: string;
  text: string;
  nextNodeId?: string;
  triggers?: { questId?: string; itemId?: string };
};

export type DialogNode = {
  id: string;
  text: string;
  choices: DialogChoice[];
};

export type DialogTree = {
  id: string;
  npc?: string;
  nodes: DialogNode[];
};

export type DialogResult = {
  dialogId: string;
  log: string[];
  triggers: { quests: string[]; items: string[] };
};

export interface Hooks {
  onDialogChoiceMade?: (dialogId: string, choiceId: string) => void;
  onDialogComplete?: (dialogId: string) => void;
  addItem?: (itemId: string, quantity?: number) => void;
  startQuest?: (questId: string) => void;
}

export class DialogSim {
  private dialogs = new Map<string, DialogTree>();
  private hooks: Hooks;
  private log: string[] = [];
  private inventory = new Map<string, number>();
  private quests = new Set<string>();

  constructor(hooks: Hooks = {}) {
    this.hooks = hooks;
  }

  loadFromObject(obj: { dialogs: DialogTree[] }) {
    this.dialogs.clear();
    for (const d of obj.dialogs) this.dialogs.set(d.id, d);
  }

  listDialogs(): string[] { return Array.from(this.dialogs.keys()); }

  getDialog(id: string): DialogTree | undefined { return this.dialogs.get(id); }

  exportDialog(id: string): DialogTree | undefined {
    const d = this.dialogs.get(id);
    return d ? JSON.parse(JSON.stringify(d)) : undefined;
  }

  simulateDialog(dialogId: string): DialogResult {
    const d = this.dialogs.get(dialogId);
    if (!d) throw new Error(`Dialog not found: ${dialogId}`);
    this.log.push(`DIALOG ${dialogId}`);
    const nodes = new Map(d.nodes.map(n => [n.id, n] as const));
    // pick first node as start
    let cur = d.nodes[0];
    while (cur) {
      this.log.push(`TXT ${cur.id} ${cur.text}`);
      if (!cur.choices || cur.choices.length === 0) break;
      const c = cur.choices[0];
      this.applyChoice(dialogId, c);
      if (!c.nextNodeId) break;
      const nxt = nodes.get(c.nextNodeId);
      if (!nxt) break;
      cur = nxt;
    }
    this.hooks.onDialogComplete?.(dialogId);
    return this.dumpResult(dialogId);
  }

  simulateChoice(dialogId: string, choiceId: string): DialogResult {
    const d = this.dialogs.get(dialogId);
    if (!d) throw new Error(`Dialog not found: ${dialogId}`);
    this.log.push(`CHOICE_RUN ${dialogId} ${choiceId}`);
    const nodes = new Map(d.nodes.map(n => [n.id, n] as const));
    const start = d.nodes[0];
    const choice = (start.choices || []).find(c => c.id === choiceId);
    if (!choice) throw new Error(`Choice not found on start node: ${choiceId}`);
    this.applyChoice(dialogId, choice);
    if (choice.nextNodeId) {
      const nxt = nodes.get(choice.nextNodeId);
      if (nxt) this.log.push(`TXT ${nxt.id} ${nxt.text}`);
    }
    this.hooks.onDialogComplete?.(dialogId);
    return this.dumpResult(dialogId);
  }

  private applyChoice(dialogId: string, c: DialogChoice) {
    this.log.push(`CHOICE ${c.id} ${c.text}`);
    this.hooks.onDialogChoiceMade?.(dialogId, c.id);
    if (c.triggers?.questId) {
      const q = c.triggers.questId;
      this.quests.add(q);
      this.hooks.startQuest?.(q);
      this.log.push(`QUEST ${q}`);
    }
    if (c.triggers?.itemId) {
      const it = c.triggers.itemId;
      const q = (this.inventory.get(it) || 0) + 1;
      this.inventory.set(it, q);
      this.hooks.addItem?.(it, 1);
      this.log.push(`ITEM ${it} x1`);
    }
  }

  private dumpResult(dialogId: string): DialogResult {
    return {
      dialogId,
      log: this.log.slice(),
      triggers: {
        quests: Array.from(this.quests.values()),
        items: Array.from(this.inventory.keys()),
      },
    };
  }
}

