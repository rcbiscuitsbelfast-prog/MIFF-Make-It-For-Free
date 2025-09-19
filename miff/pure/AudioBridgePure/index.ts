// AudioBridgePure - comprehensive audio command processing

export type AudioCmd = 
  | { op: 'play'; id: string; volume?: number; loop?: boolean; fadeIn?: number }
  | { op: 'stop'; id: string; fadeOut?: number }
  | { op: 'pause'; id: string }
  | { op: 'resume'; id: string }
  | { op: 'setVolume'; id: string; volume: number; fadeTime?: number }
  | { op: 'setPitch'; id: string; pitch: number }
  | { op: 'setLoop'; id: string; loop: boolean }
  | { op: 'fadeIn'; id: string; duration: number; targetVolume?: number }
  | { op: 'fadeOut'; id: string; duration: number }
  | { op: 'stopAll' }
  | { op: 'list' }
  | { op: 'getState'; id: string };

export interface AudioState {
  id: string;
  playing: boolean;
  paused: boolean;
  volume: number;
  pitch: number;
  loop: boolean;
  fadeInProgress?: 'in' | 'out';
  fadeStartTime?: number;
  fadeDuration?: number;
  fadeTargetVolume?: number;
}

export interface AudioResult {
  op: 'audio';
  status: 'ok' | 'error';
  applied: AudioCmd[];
  state?: AudioState[];
  issues?: string[];
}

export class AudioManager {
  private audioStates = new Map<string, AudioState>();
  private currentTime = 0;

  process(cmds: AudioCmd[]): AudioResult {
    const applied: AudioCmd[] = [];
    const issues: string[] = [];

    for (const cmd of cmds) {
      try {
        this.processCommand(cmd);
        applied.push(cmd);
      } catch (error) {
        issues.push(`Failed to process ${cmd.op}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      op: 'audio',
      status: issues.length > 0 ? 'error' : 'ok',
      applied,
      state: Array.from(this.audioStates.values()),
      issues: issues.length > 0 ? issues : undefined
    };
  }

  private processCommand(cmd: AudioCmd): void {
    switch (cmd.op) {
      case 'play':
        this.playAudio(cmd.id, cmd.volume ?? 1.0, cmd.loop ?? false, cmd.fadeIn);
        break;
      case 'stop':
        this.stopAudio(cmd.id, cmd.fadeOut);
        break;
      case 'pause':
        this.pauseAudio(cmd.id);
        break;
      case 'resume':
        this.resumeAudio(cmd.id);
        break;
      case 'setVolume':
        this.setVolume(cmd.id, cmd.volume, cmd.fadeTime);
        break;
      case 'setPitch':
        this.setPitch(cmd.id, cmd.pitch);
        break;
      case 'setLoop':
        this.setLoop(cmd.id, cmd.loop);
        break;
      case 'fadeIn':
        this.fadeIn(cmd.id, cmd.duration, cmd.targetVolume ?? 1.0);
        break;
      case 'fadeOut':
        this.fadeOut(cmd.id, cmd.duration);
        break;
      case 'stopAll':
        this.stopAll();
        break;
      case 'list':
        // List command is handled in the result
        break;
      case 'getState':
        // Get state command is handled in the result
        break;
    }
  }

  private playAudio(id: string, volume: number, loop: boolean, fadeIn?: number): void {
    const state: AudioState = {
      id,
      playing: true,
      paused: false,
      volume: fadeIn ? 0 : volume,
      pitch: 1.0,
      loop
    };

    if (fadeIn) {
      state.fadeInProgress = 'in';
      state.fadeStartTime = this.currentTime;
      state.fadeDuration = fadeIn;
      state.fadeTargetVolume = volume;
    }

    this.audioStates.set(id, state);
  }

  private stopAudio(id: string, fadeOut?: number): void {
    const state = this.audioStates.get(id);
    if (!state) return;

    if (fadeOut) {
      state.fadeInProgress = 'out';
      state.fadeStartTime = this.currentTime;
      state.fadeDuration = fadeOut;
      state.fadeTargetVolume = 0;
    } else {
      state.playing = false;
      state.paused = false;
    }
  }

  private pauseAudio(id: string): void {
    const state = this.audioStates.get(id);
    if (state) {
      state.paused = true;
      state.playing = false;
    }
  }

  private resumeAudio(id: string): void {
    const state = this.audioStates.get(id);
    if (state) {
      state.paused = false;
      state.playing = true;
    }
  }

  private setVolume(id: string, volume: number, fadeTime?: number): void {
    const state = this.audioStates.get(id);
    if (!state) return;

    if (fadeTime) {
      state.fadeInProgress = 'in';
      state.fadeStartTime = this.currentTime;
      state.fadeDuration = fadeTime;
      state.fadeTargetVolume = volume;
    } else {
      state.volume = volume;
    }
  }

  private setPitch(id: string, pitch: number): void {
    const state = this.audioStates.get(id);
    if (state) {
      state.pitch = pitch;
    }
  }

  private setLoop(id: string, loop: boolean): void {
    const state = this.audioStates.get(id);
    if (state) {
      state.loop = loop;
    }
  }

  private fadeIn(id: string, duration: number, targetVolume: number): void {
    const state = this.audioStates.get(id);
    if (!state) return;

    state.fadeInProgress = 'in';
    state.fadeStartTime = this.currentTime;
    state.fadeDuration = duration;
    state.fadeTargetVolume = targetVolume;
  }

  private fadeOut(id: string, duration: number): void {
    const state = this.audioStates.get(id);
    if (!state) return;

    state.fadeInProgress = 'out';
    state.fadeStartTime = this.currentTime;
    state.fadeDuration = duration;
    state.fadeTargetVolume = 0;
  }

  private stopAll(): void {
    for (const state of this.audioStates.values()) {
      state.playing = false;
      state.paused = false;
    }
  }

  getState(id: string): AudioState | undefined {
    return this.audioStates.get(id);
  }

  getAllStates(): AudioState[] {
    return Array.from(this.audioStates.values());
  }
}

// Legacy function for backward compatibility
export function process(cmds: AudioCmd[]): AudioResult {
  const manager = new AudioManager();
  return manager.process(cmds);
}

