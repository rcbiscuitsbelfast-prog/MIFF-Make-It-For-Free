#!/usr/bin/env tsx
import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { createPrefabState, reducePrefabAction } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);

try {
  switch (mode) {
    case 'create': {
      const { id, name, blocks, tags } = params as any;
      const state = createPrefabState({ id: id || 'prefab_001', name: name || 'Prefab', blocks: (typeof blocks === 'string' ? JSON.parse(blocks) : (blocks || [])), tags: (typeof tags === 'string' ? JSON.parse(tags) : (tags || [])) });
      handleSuccess({ state }, 'create');
      break;
    }
    case 'add': {
      const { id, block } = params as any;
      const initial = createPrefabState({ id: id || 'prefab_001', name: 'Prefab', blocks: [] });
      const next = reducePrefabAction(initial, { type: 'add_block', block: (typeof block === 'string' ? JSON.parse(block) : block) });
      handleSuccess({ state: next }, 'add');
      break;
    }
    case 'translate': {
      const { id, dx, dy, dz } = params as any;
      const initial = createPrefabState({ id: id || 'prefab_001', name: 'Prefab', blocks: [{ type: 'stone', x: 0, y: 0, z: 0 }] });
      const next = reducePrefabAction(initial, { type: 'translate', dx: Number(dx) || 1, dy: Number(dy) || 0, dz: Number(dz) || 0 });
      handleSuccess({ state: next }, 'translate');
      break;
    }
    default: {
      handleSuccess({ help: 'miff/pure/PrefabBuilderPure/cliHarness.ts --mode=create|add|translate ...' }, 'help');
    }
  }
} catch (error) {
  handleError(error);
}

