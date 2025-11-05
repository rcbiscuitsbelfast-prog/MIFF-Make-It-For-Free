/**
 * RhythmInputPure - Rhythm Input System for K-Pop Monster Hunter
 * 
 * Handles rhythm-based input detection with timing windows, accuracy scoring,
 * and mobile-first touch controls. Core mechanic for spirit capture and boss battles.
 * 
 * Features:
 * - Tap, hold, and swipe gesture recognition
 * - Configurable timing windows (casual/standard/expert)
 * - Beat map synchronization
 * - Input accuracy scoring (perfect/good/miss)
 * - Mobile-optimized touch handling
 * 
 * @module RhythmInputPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Input types for rhythm mechanics
 */
export enum RhythmInputType {
  TAP = 'tap',
  HOLD = 'hold',
  SWIPE_UP = 'swipe_up',
  SWIPE_DOWN = 'swipe_down',
  SWIPE_LEFT = 'swipe_left',
  SWIPE_RIGHT = 'swipe_right'
}

/**
 * Difficulty levels affecting timing windows
 */
export enum RhythmDifficulty {
  CASUAL = 'casual',
  STANDARD = 'standard',
  EXPERT = 'expert'
}

/**
 * Accuracy grades for rhythm inputs
 */
export enum RhythmAccuracy {
  PERFECT = 'perfect',
  GOOD = 'good',
  MISS = 'miss'
}

/**
 * Beat note interface
 */
export interface IRhythmNote {
  id: string;
  time: number; // milliseconds from track start
  type: RhythmInputType;
  duration?: number; // for HOLD notes
  lane?: number; // optional lane number (0-3)
  color?: 'light' | 'shadow'; // for light vs shadow tone mechanics
}

/**
 * Beat map interface
 */
export interface IBeatMap {
  id: string;
  name: string;
  bpm: number;
  duration: number; // total track length in ms
  notes: IRhythmNote[];
  difficulty: RhythmDifficulty;
  audioFile: string;
  gender?: 'male' | 'female'; // vocal variant
}

/**
 * Timing window configuration
 */
export interface ITimingWindow {
  perfectWindow: number; // ms
  goodWindow: number; // ms
  holdToleranceWindow: number; // ms for hold notes
  swipeMinDistance: number; // pixels
  swipeMaxTime: number; // ms
}

/**
 * Input result
 */
export interface IRhythmInputResult {
  noteId: string;
  accuracy: RhythmAccuracy;
  timingOffset: number; // ms offset from perfect timing (positive = late, negative = early)
  timestamp: number;
  score: number;
}

/**
 * Default timing windows per difficulty
 */
export const TIMING_WINDOWS: Record<RhythmDifficulty, ITimingWindow> = {
  [RhythmDifficulty.CASUAL]: {
    perfectWindow: 100,
    goodWindow: 200,
    holdToleranceWindow: 150,
    swipeMinDistance: 50,
    swipeMaxTime: 300
  },
  [RhythmDifficulty.STANDARD]: {
    perfectWindow: 75,
    goodWindow: 150,
    holdToleranceWindow: 100,
    swipeMinDistance: 75,
    swipeMaxTime: 250
  },
  [RhythmDifficulty.EXPERT]: {
    perfectWindow: 50,
    goodWindow: 100,
    holdToleranceWindow: 75,
    swipeMinDistance: 100,
    swipeMaxTime: 200
  }
};

/**
 * Scoring values per accuracy
 */
export const ACCURACY_SCORES: Record<RhythmAccuracy, number> = {
  [RhythmAccuracy.PERFECT]: 100,
  [RhythmAccuracy.GOOD]: 50,
  [RhythmAccuracy.MISS]: -10
};

/**
 * Touch input data
 */
export interface ITouchInput {
  x: number;
  y: number;
  timestamp: number;
  type: 'start' | 'move' | 'end';
}

/**
 * Rhythm Input Manager
 */
export class RhythmInputManager {
  private beatMap: IBeatMap | null = null;
  private difficulty: RhythmDifficulty = RhythmDifficulty.STANDARD;
  private timingWindow: ITimingWindow;
  private currentTime: number = 0;
  private hitNotes: Set<string> = new Set();
  private missedNotes: Set<string> = new Set();
  private inputResults: IRhythmInputResult[] = [];
  private isPlaying: boolean = false;
  private startTime: number = 0;

  // Touch tracking
  private touchStart: ITouchInput | null = null;
  private activeHolds: Map<string, ITouchInput> = new Map();

  constructor(difficulty: RhythmDifficulty = RhythmDifficulty.STANDARD) {
    this.difficulty = difficulty;
    this.timingWindow = TIMING_WINDOWS[difficulty];
  }

  /**
   * Load beat map
   */
  loadBeatMap(beatMap: IBeatMap): void {
    this.beatMap = beatMap;
    this.reset();
  }

  /**
   * Start rhythm sequence
   */
  start(): void {
    if (!this.beatMap) {
      throw new Error('No beat map loaded');
    }
    this.isPlaying = true;
    this.startTime = Date.now();
    this.currentTime = 0;
  }

  /**
   * Stop rhythm sequence
   */
  stop(): void {
    this.isPlaying = false;
  }

  /**
   * Reset state
   */
  reset(): void {
    this.currentTime = 0;
    this.hitNotes.clear();
    this.missedNotes.clear();
    this.inputResults = [];
    this.isPlaying = false;
    this.startTime = 0;
    this.touchStart = null;
    this.activeHolds.clear();
  }

  /**
   * Update current time (call each frame)
   */
  update(deltaTime: number): void {
    if (!this.isPlaying) return;
    
    this.currentTime += deltaTime;
    this.checkMissedNotes();
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Handle tap input
   */
  handleTap(x: number, y: number, timestamp: number): IRhythmInputResult | null {
    if (!this.beatMap || !this.isPlaying) return null;

    const note = this.findNoteAtTime(timestamp, RhythmInputType.TAP);
    if (!note) {
      return this.createMissResult('no_note', timestamp);
    }

    const timingOffset = timestamp - note.time;
    const accuracy = this.calculateAccuracy(Math.abs(timingOffset));
    
    if (accuracy !== RhythmAccuracy.MISS) {
      this.hitNotes.add(note.id);
      const result = this.createResult(note.id, accuracy, timingOffset, timestamp);
      this.inputResults.push(result);
      return result;
    }

    return this.createMissResult(note.id, timestamp);
  }

  /**
   * Handle hold start
   */
  handleHoldStart(x: number, y: number, timestamp: number): IRhythmInputResult | null {
    if (!this.beatMap || !this.isPlaying) return null;

    const note = this.findNoteAtTime(timestamp, RhythmInputType.HOLD);
    if (!note) {
      return this.createMissResult('no_note', timestamp);
    }

    const timingOffset = timestamp - note.time;
    const accuracy = this.calculateAccuracy(Math.abs(timingOffset));
    
    if (accuracy !== RhythmAccuracy.MISS) {
      this.activeHolds.set(note.id, { x, y, timestamp, type: 'start' });
      return null; // Don't score until hold is released
    }

    return this.createMissResult(note.id, timestamp);
  }

  /**
   * Handle hold end
   */
  handleHoldEnd(noteId: string, timestamp: number): IRhythmInputResult | null {
    if (!this.beatMap || !this.isPlaying) return null;

    const holdStart = this.activeHolds.get(noteId);
    if (!holdStart) {
      return this.createMissResult(noteId, timestamp);
    }

    const note = this.beatMap.notes.find(n => n.id === noteId);
    if (!note || !note.duration) {
      return this.createMissResult(noteId, timestamp);
    }

    const holdDuration = timestamp - holdStart.timestamp;
    const expectedDuration = note.duration;
    const durationDiff = Math.abs(holdDuration - expectedDuration);

    const accuracy = this.calculateHoldAccuracy(durationDiff);
    
    if (accuracy !== RhythmAccuracy.MISS) {
      this.hitNotes.add(note.id);
      const result = this.createResult(note.id, accuracy, durationDiff, timestamp);
      this.inputResults.push(result);
      this.activeHolds.delete(noteId);
      return result;
    }

    this.activeHolds.delete(noteId);
    return this.createMissResult(noteId, timestamp);
  }

  /**
   * Handle swipe input
   */
  handleSwipe(startX: number, startY: number, endX: number, endY: number, duration: number, timestamp: number): IRhythmInputResult | null {
    if (!this.beatMap || !this.isPlaying) return null;

    const swipeType = this.detectSwipeDirection(startX, startY, endX, endY);
    if (!swipeType) {
      return this.createMissResult('invalid_swipe', timestamp);
    }

    const note = this.findNoteAtTime(timestamp, swipeType);
    if (!note) {
      return this.createMissResult('no_note', timestamp);
    }

    const timingOffset = timestamp - note.time;
    const accuracy = this.calculateAccuracy(Math.abs(timingOffset));
    
    if (accuracy !== RhythmAccuracy.MISS && duration <= this.timingWindow.swipeMaxTime) {
      this.hitNotes.add(note.id);
      const result = this.createResult(note.id, accuracy, timingOffset, timestamp);
      this.inputResults.push(result);
      return result;
    }

    return this.createMissResult(note.id, timestamp);
  }

  /**
   * Detect swipe direction
   */
  private detectSwipeDirection(startX: number, startY: number, endX: number, endY: number): RhythmInputType | null {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < this.timingWindow.swipeMinDistance) {
      return null; // Too short to be a swipe
    }

    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    if (angle >= -45 && angle <= 45) return RhythmInputType.SWIPE_RIGHT;
    if (angle >= 45 && angle <= 135) return RhythmInputType.SWIPE_DOWN;
    if (angle >= -135 && angle <= -45) return RhythmInputType.SWIPE_UP;
    return RhythmInputType.SWIPE_LEFT;
  }

  /**
   * Find note at current time
   */
  private findNoteAtTime(timestamp: number, type: RhythmInputType): IRhythmNote | null {
    if (!this.beatMap) return null;

    for (const note of this.beatMap.notes) {
      if (note.type !== type) continue;
      if (this.hitNotes.has(note.id) || this.missedNotes.has(note.id)) continue;

      const timeDiff = Math.abs(timestamp - note.time);
      if (timeDiff <= this.timingWindow.goodWindow) {
        return note;
      }
    }

    return null;
  }

  /**
   * Calculate accuracy based on timing offset
   */
  private calculateAccuracy(offset: number): RhythmAccuracy {
    if (offset <= this.timingWindow.perfectWindow) {
      return RhythmAccuracy.PERFECT;
    }
    if (offset <= this.timingWindow.goodWindow) {
      return RhythmAccuracy.GOOD;
    }
    return RhythmAccuracy.MISS;
  }

  /**
   * Calculate hold accuracy based on duration difference
   */
  private calculateHoldAccuracy(durationDiff: number): RhythmAccuracy {
    if (durationDiff <= this.timingWindow.holdToleranceWindow / 2) {
      return RhythmAccuracy.PERFECT;
    }
    if (durationDiff <= this.timingWindow.holdToleranceWindow) {
      return RhythmAccuracy.GOOD;
    }
    return RhythmAccuracy.MISS;
  }

  /**
   * Check for missed notes
   */
  private checkMissedNotes(): void {
    if (!this.beatMap) return;

    for (const note of this.beatMap.notes) {
      if (this.hitNotes.has(note.id) || this.missedNotes.has(note.id)) continue;

      if (this.currentTime > note.time + this.timingWindow.goodWindow) {
        this.missedNotes.add(note.id);
        const result = this.createMissResult(note.id, this.currentTime);
        this.inputResults.push(result);
      }
    }
  }

  /**
   * Create input result
   */
  private createResult(noteId: string, accuracy: RhythmAccuracy, timingOffset: number, timestamp: number): IRhythmInputResult {
    return {
      noteId,
      accuracy,
      timingOffset,
      timestamp,
      score: ACCURACY_SCORES[accuracy]
    };
  }

  /**
   * Create miss result
   */
  private createMissResult(noteId: string, timestamp: number): IRhythmInputResult {
    const result: IRhythmInputResult = {
      noteId,
      accuracy: RhythmAccuracy.MISS,
      timingOffset: 0,
      timestamp,
      score: ACCURACY_SCORES[RhythmAccuracy.MISS]
    };
    this.inputResults.push(result);
    return result;
  }

  /**
   * Get all input results
   */
  getInputResults(): IRhythmInputResult[] {
    return [...this.inputResults];
  }

  /**
   * Get accuracy statistics
   */
  getAccuracyStats(): { perfect: number; good: number; miss: number; total: number; accuracy: number } {
    const perfect = this.inputResults.filter(r => r.accuracy === RhythmAccuracy.PERFECT).length;
    const good = this.inputResults.filter(r => r.accuracy === RhythmAccuracy.GOOD).length;
    const miss = this.inputResults.filter(r => r.accuracy === RhythmAccuracy.MISS).length;
    const total = this.inputResults.length;
    const accuracy = total > 0 ? ((perfect + good) / total) * 100 : 0;

    return { perfect, good, miss, total, accuracy };
  }

  /**
   * Get total score
   */
  getTotalScore(): number {
    return this.inputResults.reduce((sum, result) => sum + result.score, 0);
  }

  /**
   * Get combo count
   */
  getCombo(): number {
    let maxCombo = 0;
    let currentCombo = 0;

    for (const result of this.inputResults) {
      if (result.accuracy !== RhythmAccuracy.MISS) {
        currentCombo++;
        maxCombo = Math.max(maxCombo, currentCombo);
      } else {
        currentCombo = 0;
      }
    }

    return maxCombo;
  }

  /**
   * Check if rhythm sequence is complete
   */
  isComplete(): boolean {
    if (!this.beatMap) return false;
    return this.currentTime >= this.beatMap.duration;
  }

  /**
   * Check if rhythm sequence was successful (for spirit capture)
   */
  isSuccess(requiredAccuracy: number = 70): boolean {
    const stats = this.getAccuracyStats();
    return stats.accuracy >= requiredAccuracy;
  }
}

/**
 * Beat Map Generator (for testing)
 */
export class BeatMapGenerator {
  /**
   * Generate simple beat map
   */
  static generateSimple(bpm: number, duration: number, difficulty: RhythmDifficulty): IBeatMap {
    const notes: IRhythmNote[] = [];
    const beatInterval = (60 / bpm) * 1000; // ms per beat

    let currentTime = beatInterval * 2; // Start after 2 beats
    let noteId = 0;

    while (currentTime < duration - beatInterval) {
      notes.push({
        id: `note_${noteId++}`,
        time: currentTime,
        type: RhythmInputType.TAP,
        lane: Math.floor(Math.random() * 4)
      });

      currentTime += beatInterval;
    }

    return {
      id: 'generated_simple',
      name: 'Simple Beat Map',
      bpm,
      duration,
      notes,
      difficulty,
      audioFile: 'test_track.mp3'
    };
  }

  /**
   * Generate complex beat map with holds and swipes
   */
  static generateComplex(bpm: number, duration: number, difficulty: RhythmDifficulty): IBeatMap {
    const notes: IRhythmNote[] = [];
    const beatInterval = (60 / bpm) * 1000;
    const types = [RhythmInputType.TAP, RhythmInputType.HOLD, RhythmInputType.SWIPE_UP, RhythmInputType.SWIPE_DOWN];

    let currentTime = beatInterval * 2;
    let noteId = 0;

    while (currentTime < duration - beatInterval * 2) {
      const type = types[Math.floor(Math.random() * types.length)];
      const note: IRhythmNote = {
        id: `note_${noteId++}`,
        time: currentTime,
        type,
        lane: Math.floor(Math.random() * 4),
        color: Math.random() > 0.5 ? 'light' : 'shadow'
      };

      if (type === RhythmInputType.HOLD) {
        note.duration = beatInterval * (Math.random() > 0.5 ? 2 : 3);
      }

      notes.push(note);
      currentTime += beatInterval * (Math.random() > 0.7 ? 0.5 : 1);
    }

    return {
      id: 'generated_complex',
      name: 'Complex Beat Map',
      bpm,
      duration,
      notes,
      difficulty,
      audioFile: 'boss_battle.mp3'
    };
  }
}

/**
 * Utility functions
 */
export const RhythmInputUtils = {
  /**
   * Calculate BPM from tempo
   */
  tempoToBPM(tempo: number): number {
    return tempo;
  },

  /**
   * Convert beat to milliseconds
   */
  beatToMs(beat: number, bpm: number): number {
    return (beat / bpm) * 60 * 1000;
  },

  /**
   * Convert milliseconds to beat
   */
  msToBeat(ms: number, bpm: number): number {
    return (ms / 1000 / 60) * bpm;
  },

  /**
   * Create test beat map for spirit capture
   */
  createCaptureBeatMap(difficulty: RhythmDifficulty = RhythmDifficulty.STANDARD): IBeatMap {
    return BeatMapGenerator.generateSimple(120, 15000, difficulty); // 15 second capture sequence
  },

  /**
   * Create test beat map for boss battle
   */
  createBossBeatMap(difficulty: RhythmDifficulty = RhythmDifficulty.STANDARD): IBeatMap {
    return BeatMapGenerator.generateComplex(140, 120000, difficulty); // 2 minute boss battle
  }
};

export default RhythmInputManager;
