#!/usr/bin/env tsx
import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { createSnapState, reduceSnapAction } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);

try {
  switch (mode) {
    case 'grid': {
      const { x, y, z } = params as any;
      const state = createSnapState({ grid: { x: Number(x)||1, y: Number(y)||1, z: Number(z)||1 } });
      handleSuccess({ state }, 'grid');
      break;
    }
    case 'snap': {
      const { x, y, z } = params as any;
      const state = createSnapState({ grid: { x: 1, y: 1, z: 1 } });
      const result = reduceSnapAction(state, { type: 'snap_point', point: { x: Number(x)||0.4, y: Number(y)||0.6, z: Number(z)||0.2 } }) as any;
      handleSuccess(result, 'snap');
      break;
    }
    default:
      handleSuccess({ help: '... --mode=grid|snap' }, 'help');
  }
} catch (error) {
  handleError(error);
}

