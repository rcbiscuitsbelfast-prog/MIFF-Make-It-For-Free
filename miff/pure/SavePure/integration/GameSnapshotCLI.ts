#!/usr/bin/env tsx
import { handleSuccess, handleError, parseKeyValueArgs } from '../../shared/cliHarnessUtils';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const { mode, params } = parseKeyValueArgs(process.argv);
const sessionPath = '/workspace/session/sessionState.json';

try {
  switch (mode) {
    case 'load':
      try { const j = JSON.parse(readFileSync(sessionPath, 'utf-8')); handleSuccess({ snapshot: j }, 'load'); }
      catch { handleSuccess({ snapshot: null }, 'load'); }
      break;
    case 'save':
      mkdirSync('/workspace/session', { recursive: true });
      writeFileSync(sessionPath, JSON.stringify(params?.snapshot || {}, null, 2));
      handleSuccess({ saved: true }, 'save');
      break;
    default:
      handleSuccess({ help: '--mode=load|save' }, 'help');
  }
} catch (e) {
  handleError(e);
}

