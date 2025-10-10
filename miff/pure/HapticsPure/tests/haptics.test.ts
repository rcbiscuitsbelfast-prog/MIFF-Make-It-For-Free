import { HapticsManager } from '../Manager';

describe('HapticsPure', () => {
  let hapticsManager: HapticsManager;

  beforeEach(() => {
    hapticsManager = new HapticsManager();
  });

  it('schedules and plays patterns deterministically', async () => {
    // Enqueue haptic patterns
    hapticsManager.enqueue([
      { id: 'a', pattern: { type: 'impact', style: 'light' } },
      { id: 'b', pattern: { type: 'notification', level: 'success' } },
      { id: 'c', pattern: { type: 'custom', durationMs: 100, intensity: 0.5 } }
    ]);

    // Play all patterns
    const results = await hapticsManager.playAll();
    
    // Verify all patterns were played successfully
    expect(results.map(r => r.status)).toEqual(['played', 'played', 'played']);
    
    // Verify specific pattern details
    expect(results[0].id).toBe('a');
    expect(results[0].status).toBe('played');
    
    expect(results[1].id).toBe('b');
    expect(results[1].status).toBe('played');
    
    expect(results[2].id).toBe('c');
    expect(results[2].status).toBe('played');
  });

  it('handles device connection and disconnection', () => {
    // Test device connection
    const deviceId = 'test_device';
    const connected = hapticsManager.connectDevice(deviceId, {
      id: deviceId,
      type: 'gamepad' as any,
      name: 'Test Device',
      capabilities: {
        supportsWaveforms: true,
        supportsAmplitudeControl: true,
        supportsFrequencyControl: true,
        supportsDurationControl: true,
        supportsLocationControl: false,
        supportsMultipleActuators: false,
        maxSimultaneousEffects: 1,
        supportedEffects: ['buzz' as any, 'click' as any],
        latency: 5
      },
      connected: true,
      supportedWaveforms: ['sine' as any, 'square' as any],
      maxIntensity: 1.0,
      maxFrequency: 1000,
      maxDuration: 5000
    });

    expect(connected).toBe(true);
    expect(hapticsManager.isDeviceConnected(deviceId)).toBe(true);

    // Test device disconnection
    const disconnected = hapticsManager.disconnectDevice(deviceId);
    expect(disconnected).toBe(true);
    expect(hapticsManager.isDeviceConnected(deviceId)).toBe(false);
  });

  it('manages haptic sequences correctly', () => {
    const sequenceId = 'test_sequence';
    const sequence = {
      id: sequenceId,
      name: 'Test Sequence',
      type: 'simple' as any,
      patterns: [
        { type: 'impact' as const, style: 'light' as const },
        { type: 'impact' as const, style: 'medium' as const },
        { type: 'impact' as const, style: 'heavy' as const }
      ],
      timing: [0, 100, 200],
      loop: false,
      adaptive: false
    };

    // Create sequence
    const created = hapticsManager.createSequence(sequence);
    expect(created).toBe(true);

    // Get sequence
    const retrieved = hapticsManager.getSequence(sequenceId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(sequenceId);
    expect(retrieved?.patterns).toEqual(sequence.patterns);

    // Play sequence
    const playResult = hapticsManager.playSequence(sequenceId);
    expect(playResult).toBe(true);
  });

  it('handles environmental responses', () => {
    const response = {
      condition: 'low_battery',
      threshold: 0.2,
      pattern: { type: 'impact' as const, style: 'heavy' as const },
      cooldown: 1000
    };

    // Add environmental response
    const added = hapticsManager.addEnvironmentalResponse(response);
    expect(added).toBe(true);

    // Get environmental responses
    const responses = hapticsManager.getEnvironmentalResponses();
    expect(responses).toContain(response);
  });

  it('manages priority queue correctly', async () => {
    // Add high priority request
    hapticsManager.enqueue([{
      id: 'high_priority',
      pattern: { type: 'impact', style: 'heavy' as any },
      priority: 10
    }]);

    // Add low priority request
    hapticsManager.enqueue([{
      id: 'low_priority',
      pattern: { type: 'impact', style: 'light' as any },
      priority: 1
    }]);

    // Play all - high priority should be processed first
    const results = await hapticsManager.playAll();
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('high_priority');
    expect(results[1].id).toBe('low_priority');
  });

  it('handles device capabilities correctly', () => {
    const capabilities = hapticsManager.getDeviceCapabilities('gamepad' as any);
    expect(capabilities).toBeDefined();
    expect(capabilities?.supportsWaveforms).toBe(true);
    expect(capabilities?.maxSimultaneousEffects).toBeGreaterThan(0);
  });

  it('provides proper error handling', async () => {
    // Test with invalid pattern
    hapticsManager.enqueue([{
      id: 'invalid',
      pattern: { type: 'invalid' as any, style: 'light' as any }
    }]);

    const results = await hapticsManager.playAll();
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('error');
    expect(results[0].reason).toBeDefined();
  });

  it('manages rhythm engines correctly', () => {
    const engineId = 'test_rhythm';
    const engine = {
      id: engineId,
      name: 'Test Rhythm',
      bpm: 120,
      timeSignature: [4, 4] as [number, number],
      patterns: new Map([['default', [{ type: 'impact' as const, style: 'light' as const }]]]),
      currentPattern: 'default',
      playing: false,
      position: 0,
      intensity: 0.8,
      adaptive: false
    };

    // Create rhythm engine
    const created = hapticsManager.createRhythmEngine(engine);
    expect(created).toBe(true);

    // Get rhythm engine
    const retrieved = hapticsManager.getRhythmEngine(engineId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(engineId);
    expect(retrieved?.bpm).toBe(120);

    // Start rhythm
    const started = hapticsManager.startRhythm(engineId);
    expect(started).toBe(true);

    // Stop rhythm
    const stopped = hapticsManager.stopRhythm(engineId);
    expect(stopped).toBe(true);
  });
});