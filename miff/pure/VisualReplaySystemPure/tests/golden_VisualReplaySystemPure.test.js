const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Golden test for VisualReplaySystemPure
 * Tests deterministic visual replay functionality for MIFF scenario tests
 * 
 * Remix-safe expectations:
 * - Replay system is deterministic and pure
 * - Visual hooks are properly captured and analyzed
 * - Performance metrics are accurately calculated
 * - Input patterns are correctly identified
 * - Export functionality works consistently
 */
describe('VisualReplaySystemPure golden tests', () => {
  const root = path.resolve(__dirname, '..');
  
  test('golden visual replay flow', () => {
    // Test comprehensive visual replay functionality
    const replayFixture = path.resolve(root, 'fixtures/visual_replay.json');
    
    const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), replayFixture], { encoding: 'utf-8' });
    
    const result = JSON.parse(out);
    
    // Verify replay result structure
    expect(result.op).toBe('replay');
    expect(result.session).toBeDefined();
    expect(result.frames).toBeDefined();
    expect(result.statistics).toBeDefined();
    expect(result.analysis).toBeDefined();
    expect(result.exportable).toBe(true);
    
    // Verify session data
    expect(result.session.id).toMatch(/^replay_/);
    expect(result.session.scenarioId).toBe('toppler_physics_demo');
    expect(result.session.version).toBe('1.0.0');
    expect(result.session.timestamp).toBeGreaterThan(0);
    expect(result.session.frameCount).toBe(3);
    expect(result.session.inputStream).toHaveLength(1);
    
    // Verify frames
    expect(result.frames).toHaveLength(3);
    expect(result.frames[0].frameNumber).toBe(1);
    expect(result.frames[1].frameNumber).toBe(2);
    expect(result.frames[2].frameNumber).toBe(3);
    
    // Verify visual hooks
    expect(result.frames[0].visualHooks).toHaveLength(2); // player_sprite, block_sprite
    expect(result.frames[1].visualHooks).toHaveLength(1); // player_sprite update
    expect(result.frames[2].visualHooks).toHaveLength(3); // player_sprite, jump_sound, jump_particles
    
    // Verify input events
    expect(result.session.inputStream[0].type).toBe('keydown');
    expect(result.session.inputStream[0].data.key).toBe('Space');
    
    // Verify outcome
    expect(result.session.outcome.success).toBe(true);
    expect(result.session.outcome.score).toBe(150);
    expect(result.session.outcome.completion).toBe(0.25);
    expect(result.session.outcome.achievements).toContain('First Jump');
    
    // Verify checkpoints
    expect(result.session.outcome.checkpoints).toHaveLength(1);
    expect(result.session.outcome.checkpoints[0].passed).toBe(true);
    expect(result.session.outcome.checkpoints[0].description).toBe('Player successfully jumped');
  });
  
  test('golden visual replay - statistics calculation', () => {
    // Test statistics calculation accuracy
    const replayFixture = path.resolve(root, 'fixtures/visual_replay.json');
    
    const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), replayFixture], { encoding: 'utf-8' });
    
    const result = JSON.parse(out);
    const { statistics } = result;
    
    // Verify basic statistics
    expect(statistics.totalFrames).toBe(3);
    expect(statistics.totalDuration).toBeGreaterThan(0);
    expect(statistics.averageFrameRate).toBeGreaterThan(0);
    expect(statistics.inputEvents).toBe(1);
    expect(statistics.visualHooks).toBe(6); // 2 + 1 + 3
    
    // Verify performance metrics
    expect(statistics.performanceMetrics.minCpu).toBeGreaterThan(0);
    expect(statistics.performanceMetrics.maxCpu).toBeGreaterThan(0);
    expect(statistics.performanceMetrics.avgCpu).toBeGreaterThan(0);
    expect(statistics.performanceMetrics.minMemory).toBeGreaterThan(0);
    expect(statistics.performanceMetrics.maxMemory).toBeGreaterThan(0);
    expect(statistics.performanceMetrics.avgMemory).toBeGreaterThan(0);
    expect(statistics.performanceMetrics.minRenderTime).toBeGreaterThan(0);
    expect(statistics.performanceMetrics.maxRenderTime).toBeGreaterThan(0);
    expect(statistics.performanceMetrics.avgRenderTime).toBeGreaterThan(0);
    
    // Verify input analysis
    expect(statistics.inputAnalysis.keyPresses).toBe(1);
    expect(statistics.inputAnalysis.mouseClicks).toBe(0);
    expect(statistics.inputAnalysis.gamepadInputs).toBe(0);
    expect(statistics.inputAnalysis.touchEvents).toBe(0);
    
    // Verify visual analysis
    expect(statistics.visualAnalysis.spriteUpdates).toBeGreaterThan(0);
    expect(statistics.visualAnalysis.animationTriggers).toBe(0);
    expect(statistics.visualAnalysis.particleEffects).toBe(1);
    expect(statistics.visualAnalysis.soundPlays).toBe(1);
    expect(statistics.visualAnalysis.uiChanges).toBe(0);
    expect(statistics.visualAnalysis.cameraMoves).toBe(0);
    
    // Verify ReplayMetadata includes frame count and render duration
    expect(result.session.metadata.frameCount).toBe(3);
    expect(result.session.metadata.renderDuration).toBeGreaterThan(0);
  });
  
  test('golden visual replay - analysis generation', () => {
    // Test replay analysis functionality
    const replayFixture = path.resolve(root, 'fixtures/visual_replay.json');
    
    const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), replayFixture], { encoding: 'utf-8' });
    
    const result = JSON.parse(out);
    const { analysis } = result;
    
    // Verify analysis structure
    expect(analysis.inputPatterns).toBeDefined();
    expect(analysis.visualSequences).toBeDefined();
    expect(analysis.performanceBottlenecks).toBeDefined();
    expect(analysis.criticalMoments).toBeDefined();
    expect(analysis.recommendations).toBeDefined();
    
    // Verify input patterns
    expect(Array.isArray(analysis.inputPatterns)).toBe(true);
    if (analysis.inputPatterns.length > 0) {
      const keydownPattern = analysis.inputPatterns.find((p) => p.type === 'keydown');
      expect(keydownPattern).toBeDefined();
      expect(keydownPattern.frequency).toBe(1);
      expect(keydownPattern.timing).toHaveLength(1);
    }
    
    // Verify visual sequences
    expect(Array.isArray(analysis.visualSequences)).toBe(true);
    if (analysis.visualSequences.length > 0) {
      const spriteSequence = analysis.visualSequences.find((s) => s.type === 'sprite');
      expect(spriteSequence).toBeDefined();
      expect(spriteSequence.startFrame).toBe(1);
      expect(spriteSequence.endFrame).toBe(3);
      expect(spriteSequence.duration).toBe(2);
    }
    
    // Verify performance bottlenecks
    expect(Array.isArray(analysis.performanceBottlenecks)).toBe(true);
    
    // Verify critical moments
    expect(Array.isArray(analysis.criticalMoments)).toBe(true);
    
    // Verify recommendations
    expect(Array.isArray(analysis.recommendations)).toBe(true);
  });
  
  test('golden visual replay - export functionality', () => {
    // Test export functionality with different formats
    const replayFixture = path.resolve(root, 'fixtures/visual_replay.json');
    
    // Test JSON export (default)
    const jsonOut = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), replayFixture], { encoding: 'utf-8' });
    
    const jsonResult = JSON.parse(jsonOut);
    expect(jsonResult.op).toBe('replay');
    expect(jsonResult.session).toBeDefined();
    
    // Test CSV export
    const csvFixture = JSON.parse(fs.readFileSync(replayFixture, 'utf-8'));
    csvFixture.exportFormat = 'csv';
    
    const tempCsvFixture = path.resolve(root, 'fixtures/temp_csv.json');
    fs.writeFileSync(tempCsvFixture, JSON.stringify(csvFixture, null, 2));
    
    try {
      const csvOut = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), tempCsvFixture], { encoding: 'utf-8' });
      
      const csvResult = JSON.parse(csvOut);
      expect(csvResult.op).toBe('replay');
      expect(csvResult.session).toBeDefined();
      
    } finally {
      fs.unlinkSync(tempCsvFixture);
    }
    
    // Test summary export
    const summaryFixture = JSON.parse(fs.readFileSync(replayFixture, 'utf-8'));
    summaryFixture.exportFormat = 'summary';
    
    const tempSummaryFixture = path.resolve(root, 'fixtures/temp_summary.json');
    fs.writeFileSync(tempSummaryFixture, JSON.stringify(summaryFixture, null, 2));
    
    try {
      const summaryOut = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), tempSummaryFixture], { encoding: 'utf-8' });
      
      const summaryResult = JSON.parse(summaryOut);
      expect(summaryResult.op).toBe('replay');
      expect(summaryResult.session).toBeDefined();
      
    } finally {
      fs.unlinkSync(tempSummaryFixture);
    }
  });
  
  test('golden visual replay - visual hooks validation', () => {
    // Test visual hooks capture and analysis
    const replayFixture = path.resolve(root, 'fixtures/visual_replay.json');
    
    const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), replayFixture], { encoding: 'utf-8' });
    
    const result = JSON.parse(out);
    
    // Verify visual hook types
    const allHooks = result.frames.flatMap((f) => f.visualHooks);
    const hookTypes = [...new Set(allHooks.map((h) => h.type))];
    
    expect(hookTypes).toContain('sprite');
    expect(hookTypes).toContain('sound');
    expect(hookTypes).toContain('particle');
    
    // Verify visual hook actions
    const actions = [...new Set(allHooks.map((h) => h.action))];
    expect(actions).toContain('show');
    expect(actions).toContain('update');
    expect(actions).toContain('play');
    expect(actions).toContain('trigger');
    
    // Verify visual hook data
    const playerHook = allHooks.find((h) => h.id === 'player_sprite');
    expect(playerHook).toBeDefined();
    expect(playerHook.target).toBe('player');
    expect(playerHook.position).toBeDefined();
    expect(playerHook.position.x).toBe(100);
    expect(playerHook.position.y).toBe(100);
    
    // Verify sound hook
    const soundHook = allHooks.find((h) => h.id === 'jump_sound');
    expect(soundHook).toBeDefined();
    expect(soundHook.type).toBe('sound');
    expect(soundHook.action).toBe('play');
    expect(soundHook.data.sound).toBe('jump.wav');
    expect(soundHook.data.volume).toBe(0.8);
    
    // Verify particle hook
    const particleHook = allHooks.find((h) => h.id === 'jump_particles');
    expect(particleHook).toBeDefined();
    expect(particleHook.type).toBe('particle');
    expect(particleHook.action).toBe('trigger');
    expect(particleHook.data.effect).toBe('dust_trail');
    expect(particleHook.data.count).toBe(5);
  });
  
  test('golden visual replay - performance analysis', () => {
    // Test performance analysis and bottleneck detection
    const replayFixture = path.resolve(root, 'fixtures/visual_replay.json');
    
    const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), replayFixture], { encoding: 'utf-8' });
    
    const result = JSON.parse(out);
    
    // Verify frame metadata
    result.frames.forEach((frame) => {
      expect(frame.metadata.frameRate).toBe(60);
      expect(frame.metadata.deltaTime).toBe(16.67);
      expect(frame.metadata.performance).toBeDefined();
      expect(frame.metadata.performance.cpuUsage).toBeGreaterThan(0);
      expect(frame.metadata.performance.memoryUsage).toBeGreaterThan(0);
      expect(frame.metadata.performance.renderTime).toBeGreaterThan(0);
      expect(frame.metadata.debug).toBeDefined();
      expect(frame.metadata.debug.entities).toBeGreaterThan(0);
      expect(frame.metadata.debug.systems).toBeGreaterThan(0);
    });
    
    // Verify performance metrics consistency
    const { statistics } = result;
    expect(statistics.performanceMetrics.minCpu).toBeLessThanOrEqual(statistics.performanceMetrics.avgCpu);
    expect(statistics.performanceMetrics.avgCpu).toBeLessThanOrEqual(statistics.performanceMetrics.maxCpu);
    expect(statistics.performanceMetrics.minMemory).toBeLessThanOrEqual(statistics.performanceMetrics.avgMemory);
    expect(statistics.performanceMetrics.avgMemory).toBeLessThanOrEqual(statistics.performanceMetrics.maxMemory);
    expect(statistics.performanceMetrics.minRenderTime).toBeLessThanOrEqual(statistics.performanceMetrics.avgRenderTime);
    expect(statistics.performanceMetrics.avgRenderTime).toBeLessThanOrEqual(statistics.performanceMetrics.maxRenderTime);
    
    // Verify frame rate calculation
    if (result.frames.length > 1) {
      const firstFrame = result.frames[0];
      const lastFrame = result.frames[result.frames.length - 1];
      const duration = lastFrame.timestamp - firstFrame.timestamp;
      if (duration > 0) {
        const expectedFrameRate = result.frames.length / (duration / 1000);
        expect(statistics.averageFrameRate).toBeCloseTo(expectedFrameRate, 1);
      }
    }
  });
  
  test('golden visual replay - input analysis', () => {
    // Test input event analysis and pattern detection
    const replayFixture = path.resolve(root, 'fixtures/visual_replay.json');
    
    const out = execFileSync('npx', ['ts-node', '--compiler-options', '{"module":"commonjs"}', path.resolve(root, 'cliHarness.ts'), replayFixture], { encoding: 'utf-8' });
    
    const result = JSON.parse(out);
    
    // Verify input state capture
    result.frames.forEach((frame) => {
      expect(frame.inputState).toBeDefined();
      expect(frame.inputState.keys).toBeDefined();
      expect(frame.inputState.mouse).toBeDefined();
      expect(frame.inputState.gamepad).toBeDefined();
      expect(frame.inputState.touch).toBeDefined();
      
      // Verify mouse state
      expect(frame.inputState.mouse.x).toBeGreaterThan(0);
      expect(frame.inputState.mouse.y).toBeGreaterThan(0);
      expect(frame.inputState.mouse.buttons).toBeDefined();
      
      // Verify gamepad state
      expect(typeof frame.inputState.gamepad.connected).toBe('boolean');
      expect(Array.isArray(frame.inputState.gamepad.axes)).toBe(true);
      expect(frame.inputState.gamepad.buttons).toBeDefined();
      
      // Verify touch state
      expect(typeof frame.inputState.touch.active).toBe('boolean');
      expect(Array.isArray(frame.inputState.touch.points)).toBe(true);
    });
    
    // Verify input event recording
    const { inputStream } = result.session;
    expect(inputStream).toHaveLength(1);
    expect(inputStream[0].frameNumber).toBe(3);
    expect(inputStream[0].type).toBe('keydown');
    expect(inputStream[0].data.key).toBe('Space');
    expect(inputStream[0].timestamp).toBeGreaterThan(0);
    
    // Verify input analysis statistics
    const { statistics } = result;
    expect(statistics.inputAnalysis.keyPresses).toBe(1);
    expect(statistics.inputAnalysis.mouseClicks).toBe(0);
    expect(statistics.inputAnalysis.gamepadInputs).toBe(0);
    expect(statistics.inputAnalysis.touchEvents).toBe(0);
  });
});