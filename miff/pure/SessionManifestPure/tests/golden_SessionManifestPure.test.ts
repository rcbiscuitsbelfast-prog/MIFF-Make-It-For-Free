import { SessionManifestManager } from '../Manager';
import { SessionManifestPure } from '../index';
import * as fs from 'fs';
import * as path from 'path';

describe('SessionManifestPure Golden Tests', () => {
  let manager: SessionManifestManager;

  beforeEach(() => {
    manager = new SessionManifestManager({
      maxPlayers: 4,
      sessionTimeout: 30,
      allowSpectators: true
    });
  });

  test('creates session with players', () => {
    const result = manager.createSession('golden-test', 'toppler', [
      { playerId: 'p1', avatar: 'presets/avatars/barbarian.json', style: '2d-side' },
      { playerId: 'p2', avatar: 'presets/avatars/mage.json', style: '2d-side' }
    ], 12345);

    expect(result.ok).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session?.id).toBe('golden-test');
    expect(result.session?.zone).toBe('toppler');
    expect(result.session?.players).toHaveLength(2);
    expect(result.session?.seed).toBe(12345);
  });

  test('validates session manifest', () => {
    const validManifest = {
      id: 'test-session',
      zone: 'witcher_grove',
      players: [
        { playerId: 'p1', avatar: 'avatar1.json', style: '3d' }
      ],
      seed: 54321,
      createdAt: '2025-09-18T10:00:00.000Z'
    };

    const validation = SessionManifestPure.validate(validManifest);
    expect(validation.ok).toBe(true);
    expect(validation.errors).toHaveLength(0);

    const invalidManifest = {
      zone: 'test',
      // missing id and players
    };

    const invalidValidation = SessionManifestPure.validate(invalidManifest);
    expect(invalidValidation.ok).toBe(false);
    expect(invalidValidation.errors).toContain('id missing');
    expect(invalidValidation.errors).toContain('players missing');
  });

  test('manages player operations', () => {
    // Create session
    const createResult = manager.createSession('player-ops', 'toppler', [
      { playerId: 'p1', avatar: 'avatar1.json', style: '2d-side' }
    ]);
    expect(createResult.ok).toBe(true);

    // Add player
    const addResult = manager.addPlayer('player-ops', {
      playerId: 'p2',
      avatar: 'avatar2.json',
      style: '2d-side',
      team: 'blue'
    });
    expect(addResult.ok).toBe(true);
    expect(addResult.session?.players).toHaveLength(2);

    // Update player status
    const statusResult = manager.updatePlayerStatus('player-ops', 'p1', 'inactive');
    expect(statusResult.ok).toBe(true);
    expect(statusResult.session?.players[0!].status).toBe('inactive');

    // Remove player
    const removeResult = manager.removePlayer('player-ops', 'p2');
    expect(removeResult.ok).toBe(true);
    expect(removeResult.session?.players).toHaveLength(1);
  });

  test('lists and filters sessions', () => {
    // Create test sessions
    manager.createSession('toppler-1', 'toppler', []);
    manager.createSession('grove-1', 'witcher_grove', []);
    manager.createSession('toppler-2', 'toppler', []);

    // List all sessions
    const allSessions = manager.listSessions();
    expect(allSessions.ok).toBe(true);
    expect(allSessions.total).toBeGreaterThanOrEqual(3);

    // Filter by zone
    const topplerSessions = manager.listSessions({ zone: 'toppler' });
    expect(topplerSessions.sessions.every(s => s.zone === 'toppler')).toBe(true);

    const groveSessions = manager.listSessions({ zone: 'witcher_grove' });
    expect(groveSessions.sessions.every(s => s.zone === 'witcher_grove')).toBe(true);
  });

  test('generates session statistics', () => {
    // Create sessions with different player counts
    manager.createSession('stats-1', 'toppler', [
      { playerId: 'p1', avatar: 'avatar1.json', style: '2d-side' }
    ]);
    manager.createSession('stats-2', 'witcher_grove', [
      { playerId: 'p2', avatar: 'avatar2.json', style: '3d' },
      { playerId: 'p3', avatar: 'avatar3.json', style: '3d' }
    ]);

    const stats = manager.getStats();
    expect(stats.totalSessions).toBeGreaterThanOrEqual(2);
    expect(stats.activeSessions).toBeGreaterThanOrEqual(2);
    expect(stats.totalPlayers).toBeGreaterThanOrEqual(3);
    expect(stats.averageSessionDuration).toBeGreaterThanOrEqual(0);
  });

  test('simulates session activity', () => {
    // Create session for simulation
    const createResult = manager.createSession('sim-test', 'toppler', [
      { playerId: 'p1', avatar: 'avatar1.json', style: '2d-side' },
      { playerId: 'p2', avatar: 'avatar2.json', style: '2d-side' }
    ]);
    expect(createResult.ok).toBe(true);

    // Run simulation
    const simResult = manager.simulate('sim-test', 20);
    expect(simResult.ok).toBe(true);
    expect(simResult.simulation).toBeDefined();
    expect(simResult.simulation?.sessionId).toBe('sim-test');
    expect(simResult.simulation?.duration).toBe(20);
    expect(simResult.simulation?.playerCount).toBe(2);
    expect(Array.isArray(simResult.simulation?.events)).toBe(true);
  });

  test('exports session data in different formats', () => {
    // Create session for export
    const createResult = manager.createSession('export-test', 'witcher_grove', [
      { playerId: 'p1', avatar: 'avatar1.json', style: '3d', team: 'red' }
    ], 99999);
    expect(createResult.ok).toBe(true);

    // Test JSON export
    const jsonExport = manager.exportSession('export-test', 'json');
    expect(jsonExport.ok).toBe(true);
    expect(jsonExport.data?.id).toBe('export-test');

    // Test manifest export
    const manifestExport = manager.exportSession('export-test', 'manifest');
    expect(manifestExport.ok).toBe(true);
    expect(manifestExport.data?.schema).toBe('miff.session.manifest.v1');
    expect(manifestExport.data?.session).toBeDefined();
    expect(manifestExport.data?.metadata).toBeDefined();

    // Test summary export
    const summaryExport = manager.exportSession('export-test', 'summary');
    expect(summaryExport.ok).toBe(true);
    expect(summaryExport.data?.id).toBe('export-test');
    expect(summaryExport.data?.playerCount).toBe(1);
    expect(summaryExport.data?.seed).toBe(99999);
  });

  test('handles session cleanup', () => {
    // Create session
    manager.createSession('cleanup-test', 'toppler', []);
    
    // Verify session exists
    const getResult = manager.getSession('cleanup-test');
    expect(getResult.ok).toBe(true);

    // Delete session
    const deleteResult = manager.deleteSession('cleanup-test');
    expect(deleteResult.ok).toBe(true);

    // Verify session no longer exists
    const getAfterDelete = manager.getSession('cleanup-test');
    expect(getAfterDelete.ok).toBe(false);
    expect(getAfterDelete.errors).toContain('Session cleanup-test not found');
  });

  test('validates fixture file', () => {
    const fixturePath = path.join(__dirname, '../fixtures/validate_session.json');
    expect(fs.existsSync(fixturePath)).toBe(true);
    
    const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    const validation = SessionManifestPure.validate(fixtureData);
    
    expect(validation.ok).toBe(true);
    expect(fixtureData.id).toBe('test-validation');
    expect(fixtureData.zone).toBe('witcher_grove');
    expect(fixtureData.players).toHaveLength(2);
  });

  test('handles error cases gracefully', () => {
    // Attempt to get non-existent session
    const getResult = manager.getSession('non-existent');
    expect(getResult.ok).toBe(false);
    expect(getResult.errors).toContain('Session non-existent not found');

    // Attempt to add player to non-existent session
    const addResult = manager.addPlayer('non-existent', {
      playerId: 'p1',
      avatar: 'avatar.json',
      style: '2d-side'
    });
    expect(addResult.ok).toBe(false);
    expect(addResult.errors).toContain('Session non-existent not found');

    // Attempt to create session with duplicate ID
    manager.createSession('duplicate', 'toppler', []);
    const duplicateResult = manager.createSession('duplicate', 'toppler', []);
    expect(duplicateResult.ok).toBe(false);
    expect(duplicateResult.errors).toContain('Session duplicate already exists');
  });
});