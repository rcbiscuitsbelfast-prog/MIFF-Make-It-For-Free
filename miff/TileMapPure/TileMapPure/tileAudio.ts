import { TileType } from './tileTypes';

type AudioCue = {
  sound: string;
  volume: number;
};

const audioMap = new Map<TileType, AudioCue>();

export function registerTileAudio(type: TileType, cue: AudioCue): void {
  audioMap.set(type, cue);
}

export function getTileAudio(type: TileType): AudioCue | undefined {
  return audioMap.get(type);
}

// Example: ambient sounds
registerTileAudio(TileType.Forest, { sound: 'forest_ambience.mp3', volume: 0.6 });
registerTileAudio(TileType.Water, { sound: 'waves.mp3', volume: 0.8 });

// Additional functions for orchestrator integration
const activeAudio = new Map<string, { sound: string; volume: number; loop: boolean }>();

export function playTileAudio(sound: string, x: number, y: number, volume: number = 1.0, loop: boolean = false): void {
  const key = `${x},${y}`;
  activeAudio.set(key, { sound, volume, loop });
  // Emit audio event for rendering bridge
  console.log(`Playing audio: ${sound} at (${x}, ${y})`);
}

export function stopTileAudio(x: number, y: number): void {
  const key = `${x},${y}`;
  activeAudio.delete(key);
  console.log(`Stopped audio at (${x}, ${y})`);
}

export function setTileAmbient(x: number, y: number, sound: string, volume: number = 0.5): void {
  playTileAudio(sound, x, y, volume, true);
}
