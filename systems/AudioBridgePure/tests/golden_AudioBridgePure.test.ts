import path from 'path';
import fs from 'fs';

/**
 * Golden test for AudioBridgePure CLI harness
 * Tests deterministic audio command processing
 * 
 * Remix-safe expectations:
 * - Audio command processing is deterministic and pure
 * - Commands are processed in order without side effects
 * - Output reflects the exact input commands
 * - No actual audio playback, just command validation
 */
test('golden audio bridge flow', () => {
  const root = path.resolve(__dirname, '..');
  const audio = path.resolve(root, 'fixtures/audio.json');
  
  // Run CLI harness with audio commands
  const out = (global as any).testUtils.runCLI(
    path.resolve(root, 'cliHarness.ts'), 
    [audio]
  );
  
  const got = JSON.parse(out);
  
  // Verify expected structure
  expect(got.op).toBe('audio');
  expect(got.status).toBe('ok');
  expect(got.applied).toBeDefined();
  expect(got.applied).toHaveLength(4);
  
  // Verify deterministic command processing
  const commands = got.applied;
  
  // First command: play music_001
  expect(commands[0].op).toBe('play');
  expect(commands[0].id).toBe('music_001');
  
  // Second command: set volume for music_001
  expect(commands[1].op).toBe('setVolume');
  expect(commands[1].id).toBe('music_001');
  expect(commands[1].volume).toBe(0.8);
  
  // Third command: play sfx_jump
  expect(commands[2].op).toBe('play');
  expect(commands[2].id).toBe('sfx_jump');
  
  // Fourth command: stop music_001
  expect(commands[3].op).toBe('stop');
  expect(commands[3].id).toBe('music_001');
});