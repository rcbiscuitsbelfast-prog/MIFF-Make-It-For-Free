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
      data: { position, blockType },
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

  private validateBlockPlacement(data: any): boolean {
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
    return {
      version: "1.0",
      baseScenario: this.session.baseScenario,
      changes: this.session.changes,
      assets: this.getUsedAssets(),
      remixSafe: this.validateRemixSafety(),
      shareableLink: this.generateShareableLink()
    };
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
        const { position, blockType } = change.data;
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