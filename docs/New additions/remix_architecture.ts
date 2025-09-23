// remix-mode-core.ts
// Core architecture for MIFF's in-game map builder

export interface RemixSession {
  baseScenario: string;
  currentMap: MapConfig;
  changes: RemixChange[];
  metadata: RemixMetadata;
}

export interface MapConfig {
  gridSize: [number, number];
  blocks: PlacedBlock[];
  props: PlacedProp[];
  npcs?: PlacedNPC[];
  questTriggers?: QuestTrigger[];
}

export interface RemixChange {
  id: string;
  timestamp: number;
  action: 'place_block' | 'remove_block' | 'place_prop' | 'rename_file';
  data: any;
  reversible: boolean;
}

export interface RemixMetadata {
  created: string;
  remixOf: string;
  safeForSharing: boolean;
  contributorMode: boolean;
  validationHash?: string;
}

// --- Missing types filled in ---
export interface PlacedBlock {
  id: string;
  position: [number, number];
  type: string;
}

export interface PlacedProp {
  id: string;
  position: [number, number];
  type: string;
  rotation?: number;
}

export interface PlacedNPC {
  id: string;
  name: string;
  position: [number, number];
}

export interface QuestTrigger {
  id: string;
  area: { min: [number, number]; max: [number, number] };
  onEnter?: string;
  onExit?: string;
}

export interface RemixManifest {
  version: string;
  baseScenario: string;
  changes: RemixChange[];
  assets: string[];
  remixSafe: boolean;
  shareableLink: string;
  firstChange?: {
    pos: [number, number];
    block: string;
  };
}

// Core remix mode manager
export class RemixModeManager {
  private session: RemixSession;
  private undoStack: RemixChange[] = [];
  private redoStack: RemixChange[] = [];
  
  constructor(baseScenario: string) {
    this.session = this.initializeSession(baseScenario);
  }

  // Phase 1: Basic block placement
  placeBlock(position: [number, number], blockType: string): boolean {
    const change: RemixChange = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action: 'place_block',
      data: { pos: position, block: blockType },
      reversible: true
    };

    // Validate placement (collision, bounds, remix-safe assets)
    if (!this.validateChange(change)) {
      return false;
    }

    // Apply change
    this.applyChange(change);
    this.session.changes.push(change);
    this.undoStack.push(change);
    this.redoStack = []; // Clear redo on new action
    
    return true;
  }

  // Phase 2: File operations with safety checks
  saveAs(newFileName: string): Promise<boolean> {
    // Contributor mode check
    if (!this.session.metadata.contributorMode) {
      // Sandbox mode - can only save to user directory
      if (!this.isValidSandboxPath(newFileName)) {
        throw new Error("Remix mode: Use contributor mode to save outside sandbox");
      }
    }

    const change: RemixChange = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action: 'rename_file',
      data: { 
        originalName: this.session.baseScenario,
        newName: newFileName,
        safePath: this.getSafePath(newFileName)
      },
      reversible: true
    };

    return this.commitChanges(change);
  }

  // Phase 3: Validation and safety
  private validateChange(change: RemixChange): boolean {
    switch (change.action) {
      case 'place_block':
        return this.validateBlockPlacement(change.data);
      case 'rename_file':
        return this.validateFileName(change.data.newName);
      default:
        return false;
    }
  }

  private validateBlockPlacement(data: { position: [number, number]; blockType: string }): boolean {
    const { position, blockType } = data;
    
    // Check bounds
    if (!this.isWithinBounds(position)) return false;
    
    // Check if asset is remix-safe
    if (!this.isRemixSafeAsset(blockType)) {
      if (!this.session.metadata.contributorMode) {
        return false; // Block unsafe assets in remix mode
      }
    }
    
    // Check for collisions with existing blocks
    return !this.hasCollision(position);
  }

  // Helper methods
  private isRemixSafeAsset(assetType: string): boolean {
    // Check against whitelist of CC0/GPL assets
    const remixSafeAssets = [
      'stone_block', 'grass_block', 'tree_basic', 'water_tile'
      // ... load from asset manifest
    ];
    return remixSafeAssets.includes(assetType);
  }

  private getSafePath(fileName: string): string {
    // Ensure file goes to user's remix directory
    const userDir = this.session.metadata.contributorMode ? 'scenarios/' : 'my_remixes/';
    return `${userDir}${fileName}.json`;
  }

  // Phase 4: Export and sharing
  generateRemixManifest(): RemixManifest {
    const manifest: RemixManifest = {
      version: "1.0",
      baseScenario: this.session.baseScenario,
      changes: this.session.changes,
      assets: this.getUsedAssets(),
      remixSafe: this.validateRemixSafety(),
      shareableLink: this.generateShareableLink()
    };
    
    // Add firstChange if there are changes
    if (this.session.changes.length > 0) {
      const firstChange = this.session.changes[0];
      if (firstChange.action === 'place_block' && firstChange.data) {
        manifest.firstChange = {
          pos: firstChange.data.pos,
          block: firstChange.data.block
        };
      }
    }
    
    return manifest;
  }

  // Undo/Redo system
  undo(): boolean {
    if (this.undoStack.length === 0) return false;
    
    const change = this.undoStack.pop()!;
    this.revertChange(change);
    this.redoStack.push(change);
    
    return true;
  }

  redo(): boolean {
    if (this.redoStack.length === 0) return false;
    
    const change = this.redoStack.pop()!;
    this.applyChange(change);
    this.undoStack.push(change);
    
    return true;
  }

  private applyChange(change: RemixChange): void {
    switch (change.action) {
      case 'place_block':
        const { position, blockType } = change.data as { position: [number, number]; blockType: string };
        this.session.currentMap.blocks.push({
          position,
          type: blockType,
          id: change.id
        });
        break;
      // Handle other change types...
    }
  }

  private revertChange(change: RemixChange): void {
    switch (change.action) {
      case 'place_block':
        this.session.currentMap.blocks = this.session.currentMap.blocks
          .filter(block => block.id !== change.id);
        break;
      // Handle other reverts...
    }
  }
}

// UI Integration helpers
export class RemixUI {
  private manager: RemixModeManager;
  private palette: BlockPalette;
  
  constructor(baseScenario: string) {
    this.manager = new RemixModeManager(baseScenario);
    this.palette = new BlockPalette();
  }

  // Phase 1: Simple grid interface
  handleGridClick(gridPosition: [number, number]): void {
    const selectedBlock = this.palette.getSelected();
    if (selectedBlock) {
      const success = this.manager.placeBlock(gridPosition, selectedBlock.type);
      if (!success) {
        this.showTooltip("Cannot place block here", gridPosition);
      }
    }
  }

  // Phase 2: File management UI
  showSaveDialog(): void {
    const modal = this.createSaveModal();
    modal.onConfirm = (fileName: string) => {
      this.manager.saveAs(fileName)
        .then(() => this.showSuccess(`Saved as ${fileName}`))
        .catch(err => this.showError(err.message));
    };
  }

  // Phase 3: Tutorial integration
  startTutorial(): void {
    const steps = [
      { text: "Welcome to Remix Mode! Click any grid square to place a block.", highlight: "grid" },
      { text: "Choose different blocks from this palette.", highlight: "palette" },
      { text: "Save your creation with a new name.", highlight: "save-button" },
      { text: "Share your remix with the community!", highlight: "share-button" }
    ];
    
    this.showTutorialOverlay(steps);
  }
}

// --- Minimal helper implementations ---
export class BlockPalette {
  private selected: { type: string } | null = { type: 'stone_block' };
  getSelected(): { type: string } | null { return this.selected; }
  setSelected(t: string): void { this.selected = { type: t }; }
}

// RemixModeManager private helper definitions
// Initialize a fresh session with an empty map
// Note: kept public for documentation clarity
export interface InternalInitOptions {
  gridSize?: [number, number];
}

export class RemixModeManagerHelpers {
  static defaultGrid: [number, number] = [16, 12];
}

// Augment class with helper methods
export interface RemixModeManager {
  initializeSession(baseScenario: string, opts?: InternalInitOptions): RemixSession;
  isValidSandboxPath(name: string): boolean;
  isWithinBounds(pos: [number, number]): boolean;
  hasCollision(pos: [number, number]): boolean;
  validateFileName(name: string): boolean;
  commitChanges(change: RemixChange): Promise<boolean>;
  getUsedAssets(): string[];
  validateRemixSafety(): boolean;
  generateShareableLink(): string;
}

// Provide concrete method bodies via prototype to keep file concise
(RemixModeManager as any).prototype.initializeSession = function(baseScenario: string, opts?: InternalInitOptions): RemixSession {
  const grid = opts?.gridSize || RemixModeManagerHelpers.defaultGrid;
  return {
    baseScenario,
    currentMap: { gridSize: grid, blocks: [], props: [], npcs: [], questTriggers: [] },
    changes: [],
    metadata: {
      created: new Date().toISOString(),
      remixOf: baseScenario,
      safeForSharing: true,
      contributorMode: false
    }
  } as RemixSession;
};

(RemixModeManager as any).prototype.isValidSandboxPath = function(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name);
};

(RemixModeManager as any).prototype.isWithinBounds = function(pos: [number, number]): boolean {
  const [gx, gy] = this.session.currentMap.gridSize;
  const [x, y] = pos;
  return x >= 0 && y >= 0 && x < gx && y < gy;
};

(RemixModeManager as any).prototype.hasCollision = function(pos: [number, number]): boolean {
  return this.session.currentMap.blocks.some((b: PlacedBlock) => b.position[0] === pos[0] && b.position[1] === pos[1]);
};

(RemixModeManager as any).prototype.validateFileName = function(name: string): boolean {
  return /^[a-zA-Z0-9._-]{1,64}$/.test(name);
};

(RemixModeManager as any).prototype.commitChanges = async function(change: RemixChange): Promise<boolean> {
  // In a real app, persist to storage; here we just record the change
  this.session.changes.push(change);
  return true;
};

(RemixModeManager as any).prototype.getUsedAssets = function(): string[] {
  const assets = new Set<string>();
  for (const b of this.session.currentMap.blocks) assets.add(b.type);
  for (const p of this.session.currentMap.props) assets.add(p.type);
  return Array.from(assets.values());
};

(RemixModeManager as any).prototype.validateRemixSafety = function(): boolean {
  const safe = this.getUsedAssets().every((a: string) => this.isRemixSafeAsset(a));
  return safe && this.session.metadata.safeForSharing;
};

(RemixModeManager as any).prototype.generateShareableLink = function(): string {
  const base = 'https://miff.example/remix';
  const params = new URLSearchParams({ base: this.session.baseScenario });
  return `${base}?${params.toString()}`;
};

// UI shim methods (no-ops for documentation example)
export interface RemixUI {
  createSaveModal(): { onConfirm?: (name: string) => void };
  showTooltip(text: string, at: [number, number]): void;
  showSuccess(text: string): void;
  showError(text: string): void;
  showTutorialOverlay(steps: Array<{ text: string; highlight: string }>): void;
}

(RemixUI as any).prototype.createSaveModal = function() { return {}; };
(RemixUI as any).prototype.showTooltip = function(_text: string, _at: [number, number]) { /* no-op */ };
(RemixUI as any).prototype.showSuccess = function(_text: string) { /* no-op */ };
(RemixUI as any).prototype.showError = function(_text: string) { /* no-op */ };
(RemixUI as any).prototype.showTutorialOverlay = function(_steps: Array<{ text: string; highlight: string }>) { /* no-op */ };