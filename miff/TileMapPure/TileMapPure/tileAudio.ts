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
