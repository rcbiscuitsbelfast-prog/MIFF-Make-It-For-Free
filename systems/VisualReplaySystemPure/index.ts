// VisualReplaySystemPure - Deterministic visual replay system for MIFF scenario tests

export interface ReplayFrame {
  frameNumber: number;
  timestamp: number;
  gameState: any;
  inputState: InputState;
  visualHooks: VisualHook[];
  metadata: FrameMetadata;
}

export interface InputState {
  keys: Record<string, boolean>;
  mouse: {
    x: number;
    y: number;
    buttons: Record<string, boolean>;
  };
  gamepad: {
    connected: boolean;
    axes: number[];
    buttons: Record<string, boolean>;
  };
  touch: {
    active: boolean;
    points: Array<{
      id: number;
      x: number;
      y: number;
      pressure: number;
    }>;
  };
}

export interface VisualHook {
  id: string;
  type: 'sprite' | 'animation' | 'particle' | 'sound' | 'ui' | 'camera' | 'light';
  target: string;
  action: 'show' | 'hide' | 'play' | 'stop' | 'update' | 'trigger';
  data: any;
  position?: {
    x: number;
    y: number;
    z?: number;
  };
  scale?: {
    x: number;
    y: number;
    z?: number;
  };
  rotation?: number;
  duration?: number;
  easing?: string;
}

export interface FrameMetadata {
  frameRate: number;
  deltaTime: number;
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    renderTime: number;
  };
  debug: {
    entities: number;
    systems: number;
    events: number;
  };
}

export interface ReplaySession {
  id: string;
  scenarioId: string;
  version: string;
  timestamp: number;
  duration: number;
  frameCount: number;
  inputStream: InputEvent[];
  outcome: ReplayOutcome;
  metadata: ReplayMetadata;
}

export interface InputEvent {
  frameNumber: number;
  timestamp: number;
  type: 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'mousemove' | 'gamepad' | 'touch';
  data: any;
}

export interface ReplayOutcome {
  success: boolean;
  score?: number;
  completion: number; // 0.0 to 1.0
  achievements: string[];
  failures: string[];
  duration: number;
  checkpoints: Checkpoint[];
}

export interface Checkpoint {
  frameNumber: number;
  timestamp: number;
  description: string;
  passed: boolean;
  metrics: Record<string, number>;
}

export interface ReplayMetadata {
  engine: string;
  platform: string;
  resolution: {
    width: number;
    height: number;
  };
  quality: {
    graphics: string;
    audio: string;
    physics: string;
  };
  recording: {
    method: string;
    compression: string;
    size: number;
  };
  tags: string[];
  notes: string;
}

export interface ReplayConfig {
  frameRate: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  captureInput: boolean;
  captureVisual: boolean;
  capturePerformance: boolean;
  compression: boolean;
  maxFrames: number;
}

export interface ReplayResult {
  op: 'replay';
  session: ReplaySession;
  frames: ReplayFrame[];
  statistics: ReplayStatistics;
  analysis: ReplayAnalysis;
  exportable: boolean;
}

export interface ReplayStatistics {
  totalFrames: number;
  totalDuration: number;
  averageFrameRate: number;
  inputEvents: number;
  visualHooks: number;
  performanceMetrics: {
    minCpu: number;
    maxCpu: number;
    avgCpu: number;
    minMemory: number;
    maxMemory: number;
    avgMemory: number;
    minRenderTime: number;
    maxRenderTime: number;
    avgRenderTime: number;
  };
  inputAnalysis: {
    keyPresses: number;
    mouseClicks: number;
    gamepadInputs: number;
    touchEvents: number;
  };
  visualAnalysis: {
    spriteUpdates: number;
    animationTriggers: number;
    particleEffects: number;
    soundPlays: number;
    uiChanges: number;
    cameraMoves: number;
  };
}

export interface ReplayAnalysis {
  inputPatterns: InputPattern[];
  visualSequences: VisualSequence[];
  performanceBottlenecks: PerformanceBottleneck[];
  criticalMoments: CriticalMoment[];
  recommendations: string[];
}

export interface InputPattern {
  type: string;
  frequency: number;
  timing: number[];
  correlation: string[];
}

export interface VisualSequence {
  type: string;
  startFrame: number;
  endFrame: number;
  duration: number;
  intensity: number;
}

export interface PerformanceBottleneck {
  frameNumber: number;
  timestamp: number;
  type: 'cpu' | 'memory' | 'render';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metrics: Record<string, number>;
}

export interface CriticalMoment {
  frameNumber: number;
  timestamp: number;
  type: 'input' | 'visual' | 'performance' | 'gameplay';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  context: any;
}

/**
 * createReplaySession - Create a new replay session
 */
export function createReplaySession(
  scenarioId: string,
  config: ReplayConfig,
  metadata: Partial<ReplayMetadata> = {}
): ReplaySession {
  const timestamp = Date.now();
  
  return {
    id: generateReplayId(),
    scenarioId,
    version: '1.0.0',
    timestamp,
    duration: 0,
    frameCount: 0,
    inputStream: [],
    outcome: {
      success: false,
      completion: 0,
      achievements: [],
      failures: [],
      duration: 0,
      checkpoints: []
    },
    metadata: {
      engine: 'pure',
      platform: 'node',
      resolution: { width: 1920, height: 1080 },
      quality: { graphics: 'medium', audio: 'medium', physics: 'medium' },
      recording: { method: 'frame-capture', compression: 'none', size: 0 },
      tags: [],
      notes: '',
      ...metadata
    }
  };
}

/**
 * recordFrame - Record a frame in the replay session
 */
export function recordFrame(
  session: ReplaySession,
  frameNumber: number,
  gameState: any,
  inputState: InputState,
  visualHooks: VisualHook[],
  metadata: FrameMetadata
): ReplayFrame {
  const frame: ReplayFrame = {
    frameNumber,
    timestamp: Date.now(),
    gameState,
    inputState,
    visualHooks,
    metadata
  };
  
  // Update session statistics
  session.frameCount = Math.max(session.frameCount, frameNumber);
  session.duration = frame.timestamp - session.timestamp;
  
  return frame;
}

/**
 * recordInputEvent - Record an input event in the replay session
 */
export function recordInputEvent(
  session: ReplaySession,
  frameNumber: number,
  type: InputEvent['type'],
  data: any
): InputEvent {
  const event: InputEvent = {
    frameNumber,
    timestamp: Date.now(),
    type,
    data
  };
  
  session.inputStream.push(event);
  return event;
}

/**
 * updateReplayOutcome - Update the replay outcome with final results
 */
export function updateReplayOutcome(
  session: ReplaySession,
  outcome: Partial<ReplayOutcome>
): ReplayOutcome {
  session.outcome = {
    ...session.outcome,
    ...outcome
  };
  
  return session.outcome;
}

/**
 * addCheckpoint - Add a checkpoint to the replay session
 */
export function addCheckpoint(
  session: ReplaySession,
  frameNumber: number,
  description: string,
  passed: boolean,
  metrics: Record<string, number> = {}
): Checkpoint {
  const checkpoint: Checkpoint = {
    frameNumber,
    timestamp: Date.now(),
    description,
    passed,
    metrics
  };
  
  session.outcome.checkpoints.push(checkpoint);
  return checkpoint;
}

/**
 * generateReplayResult - Generate a complete replay result from session and frames
 */
export function generateReplayResult(
  session: ReplaySession,
  frames: ReplayFrame[]
): ReplayResult {
  const statistics = calculateReplayStatistics(session, frames);
  const analysis = analyzeReplay(session, frames);
  
  return {
    op: 'replay',
    session,
    frames,
    statistics,
    analysis,
    exportable: true
  };
}

/**
 * calculateReplayStatistics - Calculate comprehensive replay statistics
 */
function calculateReplayStatistics(session: ReplaySession, frames: ReplayFrame[]): ReplayStatistics {
  const totalFrames = frames.length;
  // Calculate duration from frame timestamps if available
  let totalDuration = session.duration;
  if (frames.length > 1) {
    const firstFrame = frames[0];
    const lastFrame = frames[frames.length - 1];
    totalDuration = lastFrame.timestamp - firstFrame.timestamp;
  }
  const averageFrameRate = totalDuration > 0 ? totalFrames / (totalDuration / 1000) : 0;
  
  // Performance metrics
  const cpuUsage = frames.map(f => f.metadata.performance.cpuUsage);
  const memoryUsage = frames.map(f => f.metadata.performance.memoryUsage);
  const renderTimes = frames.map(f => f.metadata.performance.renderTime);
  
  // Input analysis
  const inputEvents = session.inputStream;
  const keyPresses = inputEvents.filter(e => e.type.startsWith('key')).length;
  const mouseClicks = inputEvents.filter(e => e.type.includes('mouse')).length;
  const gamepadInputs = inputEvents.filter(e => e.type === 'gamepad').length;
  const touchEvents = inputEvents.filter(e => e.type === 'touch').length;
  
  // Visual analysis
  const visualHooks = frames.flatMap(f => f.visualHooks);
  const spriteUpdates = visualHooks.filter(h => h.type === 'sprite').length;
  const animationTriggers = visualHooks.filter(h => h.type === 'animation').length;
  const particleEffects = visualHooks.filter(h => h.type === 'particle').length;
  const soundPlays = visualHooks.filter(h => h.type === 'sound').length;
  const uiChanges = visualHooks.filter(h => h.type === 'ui').length;
  const cameraMoves = visualHooks.filter(h => h.type === 'camera').length;
  
  return {
    totalFrames,
    totalDuration,
    averageFrameRate,
    inputEvents: inputEvents.length,
    visualHooks: visualHooks.length,
    performanceMetrics: {
      minCpu: Math.min(...cpuUsage),
      maxCpu: Math.max(...cpuUsage),
      avgCpu: cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length,
      minMemory: Math.min(...memoryUsage),
      maxMemory: Math.max(...memoryUsage),
      avgMemory: memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length,
      minRenderTime: Math.min(...renderTimes),
      maxRenderTime: Math.max(...renderTimes),
      avgRenderTime: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
    },
    inputAnalysis: {
      keyPresses,
      mouseClicks,
      gamepadInputs,
      touchEvents
    },
    visualAnalysis: {
      spriteUpdates,
      animationTriggers,
      particleEffects,
      soundPlays,
      uiChanges,
      cameraMoves
    }
  };
}

/**
 * analyzeReplay - Analyze replay data for patterns and insights
 */
function analyzeReplay(session: ReplaySession, frames: ReplayFrame[]): ReplayAnalysis {
  const inputPatterns = analyzeInputPatterns(session.inputStream);
  const visualSequences = analyzeVisualSequences(frames);
  const performanceBottlenecks = analyzePerformanceBottlenecks(frames);
  const criticalMoments = identifyCriticalMoments(session, frames);
  const recommendations = generateRecommendations(session, frames);
  
  return {
    inputPatterns,
    visualSequences,
    performanceBottlenecks,
    criticalMoments,
    recommendations
  };
}

/**
 * analyzeInputPatterns - Analyze input patterns for insights
 */
function analyzeInputPatterns(inputEvents: InputEvent[]): InputPattern[] {
  const patterns: InputPattern[] = [];
  
  // Group events by type
  const eventTypes = new Map<string, InputEvent[]>();
  inputEvents.forEach(event => {
    if (!eventTypes.has(event.type)) {
      eventTypes.set(event.type, []);
    }
    eventTypes.get(event.type)!.push(event);
  });
  
  // Analyze each event type
  eventTypes.forEach((events, type) => {
    const frequency = events.length;
    const timing = events.map(e => e.timestamp);
    const correlation = findCorrelatedEvents(events, inputEvents);
    
    patterns.push({
      type,
      frequency,
      timing,
      correlation
    });
  });
  
  return patterns;
}

/**
 * analyzeVisualSequences - Analyze visual sequences for patterns
 */
function analyzeVisualSequences(frames: ReplayFrame[]): VisualSequence[] {
  const sequences: VisualSequence[] = [];
  
  // Group visual hooks by type across frames
  const hookTypes = new Map<string, Array<{ frame: number; hook: VisualHook }>>();
  
  frames.forEach(frame => {
    frame.visualHooks.forEach(hook => {
      if (!hookTypes.has(hook.type)) {
        hookTypes.set(hook.type, []);
      }
      hookTypes.get(hook.type)!.push({ frame: frame.frameNumber, hook });
    });
  });
  
  // Find sequences for each hook type
  hookTypes.forEach((hooks, type) => {
    if (hooks.length > 1) {
      const startFrame = Math.min(...hooks.map(h => h.frame));
      const endFrame = Math.max(...hooks.map(h => h.frame));
      const duration = endFrame - startFrame;
      const intensity = hooks.length / duration;
      
      sequences.push({
        type,
        startFrame,
        endFrame,
        duration,
        intensity
      });
    }
  });
  
  return sequences;
}

/**
 * analyzePerformanceBottlenecks - Identify performance bottlenecks
 */
function analyzePerformanceBottlenecks(frames: ReplayFrame[]): PerformanceBottleneck[] {
  const bottlenecks: PerformanceBottleneck[] = [];
  
  frames.forEach(frame => {
    const { performance } = frame.metadata;
    
    // CPU bottleneck
    if (performance.cpuUsage > 80) {
      bottlenecks.push({
        frameNumber: frame.frameNumber,
        timestamp: frame.timestamp,
        type: 'cpu',
        severity: performance.cpuUsage > 95 ? 'critical' : performance.cpuUsage > 90 ? 'high' : 'medium',
        description: `High CPU usage: ${performance.cpuUsage.toFixed(1)}%`,
        metrics: { cpuUsage: performance.cpuUsage }
      });
    }
    
    // Memory bottleneck
    if (performance.memoryUsage > 1000) { // MB
      bottlenecks.push({
        frameNumber: frame.frameNumber,
        timestamp: frame.timestamp,
        type: 'memory',
        severity: performance.memoryUsage > 2000 ? 'critical' : performance.memoryUsage > 1500 ? 'high' : 'medium',
        description: `High memory usage: ${performance.memoryUsage.toFixed(1)} MB`,
        metrics: { memoryUsage: performance.memoryUsage }
      });
    }
    
    // Render bottleneck
    if (performance.renderTime > 16.67) { // 60 FPS threshold
      bottlenecks.push({
        frameNumber: frame.frameNumber,
        timestamp: frame.timestamp,
        type: 'render',
        severity: performance.renderTime > 33.33 ? 'critical' : performance.renderTime > 25 ? 'high' : 'medium',
        description: `Slow render time: ${performance.renderTime.toFixed(2)}ms`,
        metrics: { renderTime: performance.renderTime }
      });
    }
  });
  
  return bottlenecks;
}

/**
 * identifyCriticalMoments - Identify critical moments in the replay
 */
function identifyCriticalMoments(session: ReplaySession, frames: ReplayFrame[]): CriticalMoment[] {
  const moments: CriticalMoment[] = [];
  
  // Check for input spikes
  const inputSpikes = findInputSpikes(session.inputStream);
  inputSpikes.forEach(spike => {
    moments.push({
      frameNumber: spike.frameNumber,
      timestamp: spike.timestamp,
      type: 'input',
      description: `Input spike: ${spike.count} events in ${spike.duration}ms`,
      impact: spike.count > 10 ? 'high' : spike.count > 5 ? 'medium' : 'low',
      context: { eventCount: spike.count, duration: spike.duration }
    });
  });
  
  // Check for visual intensity changes
  const visualIntensity = findVisualIntensityChanges(frames);
  visualIntensity.forEach(change => {
    moments.push({
      frameNumber: change.frameNumber,
      timestamp: change.timestamp,
      type: 'visual',
      description: `Visual intensity change: ${change.change > 0 ? '+' : ''}${change.change}`,
      impact: Math.abs(change.change) > 10 ? 'high' : Math.abs(change.change) > 5 ? 'medium' : 'low',
      context: { intensityChange: change.change, newIntensity: change.intensity }
    });
  });
  
  // Check for performance drops
  const performanceDrops = findPerformanceDrops(frames);
  performanceDrops.forEach(drop => {
    moments.push({
      frameNumber: drop.frameNumber,
      timestamp: drop.timestamp,
      type: 'performance',
      description: `Performance drop: ${drop.drop.toFixed(1)}%`,
      impact: drop.drop > 50 ? 'critical' : drop.drop > 30 ? 'high' : drop.drop > 15 ? 'medium' : 'low',
      context: { performanceDrop: drop.drop, metric: drop.metric }
    });
  });
  
  return moments;
}

/**
 * generateRecommendations - Generate recommendations based on replay analysis
 */
function generateRecommendations(session: ReplaySession, frames: ReplayFrame[]): string[] {
  const recommendations: string[] = [];
  
  // Performance recommendations
  const avgFrameRate = frames.length / (session.duration / 1000);
  if (avgFrameRate < 30) {
    recommendations.push('Consider reducing visual effects or optimizing rendering for better frame rate');
  }
  
  // Input recommendations
  if (session.inputStream.length > 1000) {
    recommendations.push('High input event count detected - consider input buffering or event coalescing');
  }
  
  // Visual recommendations
  const totalVisualHooks = frames.reduce((sum, frame) => sum + frame.visualHooks.length, 0);
  if (totalVisualHooks > 500) {
    recommendations.push('High visual hook count - consider batching visual updates or reducing effects');
  }
  
  // Memory recommendations
  const avgMemory = frames.reduce((sum, frame) => sum + frame.metadata.performance.memoryUsage, 0) / frames.length;
  if (avgMemory > 1000) {
    recommendations.push('High memory usage detected - consider asset pooling or memory management optimization');
  }
  
  return recommendations;
}

/**
 * findCorrelatedEvents - Find events that correlate with the given events
 */
function findCorrelatedEvents(events: InputEvent[], allEvents: InputEvent[]): string[] {
  const correlations: string[] = [];
  const timeWindow = 100; // 100ms window
  
  events.forEach(event => {
    const nearbyEvents = allEvents.filter(e => 
      e !== event && 
      Math.abs(e.timestamp - event.timestamp) < timeWindow
    );
    
    nearbyEvents.forEach(nearby => {
      const correlation = `${event.type}->${nearby.type}`;
      if (!correlations.includes(correlation)) {
        correlations.push(correlation);
      }
    });
  });
  
  return correlations;
}

/**
 * findInputSpikes - Find spikes in input events
 */
function findInputSpikes(inputEvents: InputEvent[]): Array<{ frameNumber: number; timestamp: number; count: number; duration: number }> {
  const spikes: Array<{ frameNumber: number; timestamp: number; count: number; duration: number }> = [];
  const timeWindow = 50; // 50ms window
  
  for (let i = 0; i < inputEvents.length; i++) {
    const event = inputEvents[i];
    const nearbyEvents = inputEvents.filter(e => 
      Math.abs(e.timestamp - event.timestamp) < timeWindow
    );
    
    if (nearbyEvents.length > 3) { // Spike threshold
      const duration = Math.max(...nearbyEvents.map(e => e.timestamp)) - Math.min(...nearbyEvents.map(e => e.timestamp));
      spikes.push({
        frameNumber: event.frameNumber,
        timestamp: event.timestamp,
        count: nearbyEvents.length,
        duration
      });
    }
  }
  
  return spikes;
}

/**
 * findVisualIntensityChanges - Find significant changes in visual intensity
 */
function findVisualIntensityChanges(frames: ReplayFrame[]): Array<{ frameNumber: number; timestamp: number; change: number; intensity: number }> {
  const changes: Array<{ frameNumber: number; timestamp: number; change: number; intensity: number }> = [];
  
  for (let i = 1; i < frames.length; i++) {
    const prevIntensity = frames[i - 1].visualHooks.length;
    const currIntensity = frames[i].visualHooks.length;
    const change = currIntensity - prevIntensity;
    
    if (Math.abs(change) > 2) { // Significant change threshold
      changes.push({
        frameNumber: frames[i].frameNumber,
        timestamp: frames[i].timestamp,
        change,
        intensity: currIntensity
      });
    }
  }
  
  return changes;
}

/**
 * findPerformanceDrops - Find significant performance drops
 */
function findPerformanceDrops(frames: ReplayFrame[]): Array<{ frameNumber: number; timestamp: number; drop: number; metric: string }> {
  const drops: Array<{ frameNumber: number; timestamp: number; drop: number; metric: string }> = [];
  
  for (let i = 1; i < frames.length; i++) {
    const prevFrame = frames[i - 1];
    const currFrame = frames[i];
    
    // Check CPU usage drop
    const cpuDrop = ((prevFrame.metadata.performance.cpuUsage - currFrame.metadata.performance.cpuUsage) / prevFrame.metadata.performance.cpuUsage) * 100;
    if (cpuDrop > 15) {
      drops.push({
        frameNumber: currFrame.frameNumber,
        timestamp: currFrame.timestamp,
        drop: cpuDrop,
        metric: 'cpu'
      });
    }
    
    // Check render time increase (performance drop)
    const renderDrop = ((currFrame.metadata.performance.renderTime - prevFrame.metadata.performance.renderTime) / prevFrame.metadata.performance.renderTime) * 100;
    if (renderDrop > 20) {
      drops.push({
        frameNumber: currFrame.frameNumber,
        timestamp: currFrame.timestamp,
        drop: renderDrop,
        metric: 'render'
      });
    }
  }
  
  return drops;
}

/**
 * generateReplayId - Generate a unique replay ID
 */
function generateReplayId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `replay_${timestamp}_${random}`;
}

/**
 * exportReplayData - Export replay data in various formats
 */
export function exportReplayData(replay: ReplayResult, format: 'json' | 'csv' | 'summary'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(replay, null, 2);
    
    case 'csv':
      return generateCSVExport(replay);
    
    case 'summary':
      return generateSummaryExport(replay);
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * generateCSVExport - Generate CSV export of replay data
 */
function generateCSVExport(replay: ReplayResult): string {
  let csv = 'Frame,Timestamp,InputEvents,VisualHooks,CPU,Memory,RenderTime\n';
  
  replay.frames.forEach(frame => {
    const inputCount = replay.session.inputStream.filter(e => e.frameNumber === frame.frameNumber).length;
    const visualCount = frame.visualHooks.length;
    const { cpuUsage, memoryUsage, renderTime } = frame.metadata.performance;
    
    csv += `${frame.frameNumber},${frame.timestamp},${inputCount},${visualCount},${cpuUsage},${memoryUsage},${renderTime}\n`;
  });
  
  return csv;
}

/**
 * generateSummaryExport - Generate human-readable summary export
 */
function generateSummaryExport(replay: ReplayResult): string {
  const { session, statistics, analysis } = replay;
  
  let summary = `Visual Replay Summary\n`;
  summary += `===================\n\n`;
  
  summary += `Session: ${session.id}\n`;
  summary += `Scenario: ${session.scenarioId}\n`;
  summary += `Duration: ${(session.duration / 1000).toFixed(2)}s\n`;
  summary += `Frames: ${statistics.totalFrames}\n`;
  summary += `Average FPS: ${statistics.averageFrameRate.toFixed(2)}\n\n`;
  
  summary += `Input Events: ${statistics.inputEvents}\n`;
  summary += `Visual Hooks: ${statistics.visualHooks}\n\n`;
  
  summary += `Performance:\n`;
  summary += `  CPU: ${statistics.performanceMetrics.avgCpu.toFixed(1)}% avg\n`;
  summary += `  Memory: ${statistics.performanceMetrics.avgMemory.toFixed(1)} MB avg\n`;
  summary += `  Render: ${statistics.performanceMetrics.avgRenderTime.toFixed(2)}ms avg\n\n`;
  
  summary += `Critical Moments: ${analysis.criticalMoments.length}\n`;
  summary += `Performance Bottlenecks: ${analysis.performanceBottlenecks.length}\n\n`;
  
  if (analysis.recommendations.length > 0) {
    summary += `Recommendations:\n`;
    analysis.recommendations.forEach(rec => summary += `  - ${rec}\n`);
  }
  
  return summary;
}