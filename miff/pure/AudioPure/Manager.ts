export interface AudioConfig {
  masterVolume: number;
  enable3D: boolean;
  maxDistance: number;
  rolloffFactor: number;
  dopplerFactor: number;
}

export interface AudioClip {
  id: string;
  name: string;
  path: string;
  volume: number;
  loop?: boolean;
  is3D?: boolean;
  position?: { x: number; y: number; z: number };
}

export class AudioManager {
  private playing: AudioClip[] = [];

  play(clip: AudioClip): void {
    this.playing.push(clip);
  }

  stop(audioId: string): void {
    this.playing = this.playing.filter((c: any) => c.id !== audioId);
  }

  setVolume(audioId: string, volume: number): void {
    this.playing = this.playing.map((c: any) => c.id === audioId ? { ...c, volume } : c);
  }

  getPlaying(): AudioClip[] {
    return [...this.playing];
  }
}

export default AudioManager;
