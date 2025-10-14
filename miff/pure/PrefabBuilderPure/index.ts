/**
 * PrefabBuilderPure - stateless prefab assembly with pure reducers
 */

export type PrefabId = string;
export type AssetId = string;

export interface PrefabConfig {
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
  id: PrefabId;
  name: string;
  blocks: Array<{ type: string; x: number; y: number; z: number }>;
  tags?: string[];
}

export interface PrefabState {
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
  id: PrefabId;
  name: string;
  blocks: Array<{ id: string; type: string; x: number; y: number; z: number }>;
  metadata: { tags: string[]; createdAt: number; version: number };
}

export type PrefabAction =
  | { type: 'add_block'; block: { id?: string; type: string; x: number; y: number; z: number } }
  | { type: 'remove_block'; blockId: string }
  | { type: 'translate'; dx: number; dy: number; dz: number }
  | { type: 'rename'; name: string }
  | { type: 'tag'; tag: string }
  | { type: 'untag'; tag: string };

export function createPrefabState(config: PrefabConfig): PrefabState {
  return {
    id: config.id,
    name: config.name,
    blocks: config.blocks.map((b, i) => ({ id: `${config.id}_b${i}`, ...b })),
    metadata: { tags: [...(config.tags || [])], createdAt: Date.now(), version: 1 }
  };
}

export function reducePrefabAction(state: PrefabState, action: PrefabAction): PrefabState {
  switch (action.type) {
    case 'add_block': {
      const id = action.block.id || `${state.id}_b${state.blocks.length}`;
      return {
        ...state,
        blocks: [...state.blocks, { id, type: action.block.type, x: action.block.x, y: action.block.y, z: action.block.z }]
      };
    }
    case 'remove_block': {
      return { ...state, blocks: state.blocks.filter(b => b.id !== action.blockId) };
    }
    case 'translate': {
      return {
        ...state,
        blocks: state.blocks.map(b => ({ ...b, x: b.x + action.dx, y: b.y + action.dy, z: b.z + action.dz }))
      };
    }
    case 'rename': {
      return { ...state, name: action.name };
    }
    case 'tag': {
      if (state.metadata.tags.includes(action.tag)) return state;
      return { ...state, metadata: { ...state.metadata, tags: [...state.metadata.tags, action.tag] } };
    }
    case 'untag': {
      return { ...state, metadata: { ...state.metadata, tags: state.metadata.tags.filter(t => t !== action.tag) } };
    }
    default:
      return state;
  }
}

export default { createPrefabState, reducePrefabAction };

