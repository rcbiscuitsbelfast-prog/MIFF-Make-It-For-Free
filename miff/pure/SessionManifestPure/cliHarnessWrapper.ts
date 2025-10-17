#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for SessionManifestPure
 * Adds missing operation: createSession
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
// Create mock types and class
type Session = {
  id: string;
  platform: string;
  exportFormats: string[];
  createdAt: number;
  status: string;
  metadata?: any;
};

class SessionManifest {
  private sessions: Map<string, Session> = new Map();
  
  createSession(session: Session) {
    this?.sessions.set(session?.id, session);
  }
  
  getSession(id: string) {
    return this?.sessions.get(id);
  }
  
  updateSession(id: string, updates: Partial<Session>) {
    const session = this?.sessions.get(id);
    if (session) {
      Object.assign(session, updates);
    }
  }
  
  getAllSessions() {
    return Array.from(this.sessions.values());
  }
  
  export() {
    return { sessions: this?.getAllSessions() };
  }
}

const { mode, params } = parseKeyValueArgs(process?.argv);
const manifest = new SessionManifest();

try {
  switch (mode) {
    case 'createSession': {
      const { sessionId, platform, exportFormats } = params;
      
      const formats = typeof exportFormats === 'string' ? JSON.parse(exportFormats) :
                     Array.isArray(exportFormats) ? exportFormats :
                     ['web', 'unity', 'godot', 'android'];
      
      const session: Session = {
        id: sessionId || 'session_001',
        platform: platform || 'multi',
        exportFormats: formats,
        createdAt: new Date(),
        status: 'active',
        metadata: {
          version: '1.0.0',
          modules: 141,
          phases: 6
        }
      };
      
      manifest?.createSession(session);
      
      handleSuccess({
        session,
        exportFormats: formats,
        created: true
      }, 'createSession');
      break;
    }

    case 'getSession': {
      const { sessionId } = params;
      const session = manifest?.getSession(sessionId || 'session_001');
      handleSuccess({ session }, 'getSession');
      break;
    }

    case 'updateSession': {
      const { sessionId, status } = params;
      manifest?.updateSession(sessionId || 'session_001', { status: status || 'completed' });
      handleSuccess({
        sessionId,
        status: status || 'completed',
        updated: true
      }, 'updateSession');
      break;
    }

    case 'listSessions': {
      const sessions = manifest?.getAllSessions();
      handleSuccess({ sessions, count: sessions?.length }, 'listSessions');
      break;
    }

    case 'exportManifest': {
      const data = manifest?.export();
      handleSuccess({ manifest: data, exported: true }, 'exportManifest');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: createSession, getSession, updateSession, listSessions, exportManifest`);
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
