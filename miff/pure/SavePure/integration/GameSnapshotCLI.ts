#!/usr/bin/env tsx
import { handleSuccess, handleError, parseKeyValueArgs } from '../../shared/cliHarnessUtils';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const { mode, params } = parseKeyValueArgs(process?.argv);
const sessionPath = '/workspace/session/sessionState?.json';

try {
  switch (mode) {
    case 'load':
      try { const j = JSON.parse(readFileSync(sessionPath, 'utf-8')); handleSuccess({ snapshot: j }, 'load'); }
      catch { handleSuccess({ snapshot: null }, 'load'); }
      break;
    case 'save':
      mkdirSync('/workspace/session', { recursive: true });
      if (params && (params as any).snapshot) {
        writeFileSync(sessionPath, JSON.stringify((params as any).snapshot, null, 2));
      } else {
        // If no snapshot provided, keep current session state (noop persist)
        try { JSON.parse(readFileSync(sessionPath, 'utf-8')); } catch { writeFileSync(sessionPath, JSON.stringify({}, null, 2)); }
      }
      handleSuccess({ saved: true }, 'save');
      break;
    default:
      handleSuccess({ help: '--mode=load|save' }, 'help');
  }
} catch (e) {
  handleError(e);
}

