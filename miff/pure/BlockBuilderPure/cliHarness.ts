#!/usr/bin/env tsx
import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { createBlockState, reduceBlockAction } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);

try {
  const base = createBlockState({ blocks: [{ type: 'stone', hardness: 3, color: '#777' }] });
  switch (mode) {
    case 'register': {
      const { block } = params as any;
      const next = reduceBlockAction(base, { type: 'register', block: (typeof block === 'string' ? JSON.parse(block) : block) });
      handleSuccess({ state: next }, 'register');
      break;
    }
    case 'tint': {
      const { blockType, color } = params as any;
      const next = reduceBlockAction(base, { type: 'tint', blockType: blockType || 'stone', color: color || '#444' });
      handleSuccess({ state: next }, 'tint');
      break;
    }
    default:
      handleSuccess({ help: '... --mode=register|tint' }, 'help');
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}

