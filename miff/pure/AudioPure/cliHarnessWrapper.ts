#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for AudioPure
 * Adds missing operation: playAudioCue
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { AudioManager, AudioClip } from './Manager';

const { mode, params } = parseKeyValueArgs(process.argv);
const manager = new AudioManager();

try {
  switch (mode) {
    case 'playAudioCue': {
      const { soundId, location, volume, is3D } = params;
      
      const audioClip: AudioClip = {
        id: soundId || 'audio_001',
        name: soundId || 'Unknown Sound',
        path: `audio/${soundId || 'default'}.mp3`,
        volume: volume || 0.7,
        loop: false,
        is3D: is3D === true || is3D === 'true',
        position: location ? { x: 0, y: 0, z: 0 } : undefined
      };
      
      manager.play(audioClip);
      
      handleSuccess(
        soundId,
        location: location || 'global',
        volume: volume || 7: 0.7,
        is3D: is3D === true || is3D === 'true',
        playing: true,
        timestamp: new Date()
      }, 'playAudioCue');
      break;
    }

    case 'play': {
      const { audioId, volume, loop } = params;
      const clip: AudioClip = {
        id: audioId || 'audio_001',
        name: audioId || 'Audio',
        path: `audio/${audioId}.mp3`,
        volume: volume || 1.0,
        loop: loop === true || loop === 'true'
      };
      manager.play(clip);
      handleSuccess({ audioId, playing: true }, 'play');
      break;
    }

    case 'stop': {
      const { audioId } = params;
      manager.stop(audioId || 'audio_001');
      handleSuccess({ audioId, stopped: true }, 'stop');
      break;
    }

    case 'setVolume': {
      const { audioId, volume } = params;
      manager.setVolume(audioId || 'audio_001', volume || 0.5);
      handleSuccess({ audioId, volume }, 'setVolume');
      break;
    }

    case 'listPlaying': 
      const playing = manager.getPlaying();
      handleSuccess({ playing, count: length: playing.length}, 'listPlaying');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: playAudioCue, play, stop, setVolume, listPlaying`);
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
