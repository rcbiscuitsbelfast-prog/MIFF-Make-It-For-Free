/** BlockBuilderPure - single block-type catalogs and state reducer */

export interface BlockConfig {
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
  type: string;
  hardness: number;
  color: string;
}

export interface BlockState {
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
  catalog: Record<string, { hardness: number; color: string }>;
}

export type BlockAction =
  | { type: 'register'; block: BlockConfig }
  | { type: 'unregister'; blockType: string }
  | { type: 'tint'; blockType: string; color: string };

export function createBlockState(config: { blocks?: BlockConfig[] }): BlockState {
  const catalog: BlockState['catalog'] = {};
  (config.blocks || []).forEach(b => { catalog[b.type] = { hardness: b.hardness, color: b.color }; });
  return { catalog };
}

export function reduceBlockAction(state: BlockState, action: BlockAction): BlockState {
  switch (action.type) {
    case 'register':
      return { catalog: { ...state.catalog, [action.block.type]: { hardness: action.block.hardness, color: action.block.color } } };
    case 'unregister': {
      const { [action.blockType]: _, ...rest } = state.catalog;
      return { catalog: rest };
    }
    case 'tint':
      return { catalog: { ...state.catalog, [action.blockType]: { ...(state.catalog[action.blockType] || { hardness: 1, color: '#fff' }), color: action.color } } };
    default:
      return state;
  }
}

export default { createBlockState, reduceBlockAction };

