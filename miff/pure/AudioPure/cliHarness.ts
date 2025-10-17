#!/usr/bin/env tsx

import { 
  AudioSystem, 
  AudioConfig, 
  SoundDefinition, 
  SpatialAudioConfig,
  AudioEvent 
} from './AudioPure';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface AudioOperation {
  op: 'create' | 'register-sound' | 'play' | 'stop' | 'pause' | 'set-volume' | 'set-spatial' | 'demo' | 'dump';
  config?: AudioConfig;
  soundId?: string;
  soundName?: string;
  category?: string;
  volume?: number;
  pitch?: number;
  loop?: boolean;
  spatial?: boolean;
  position?: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  exportFormat?: string;
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args!]');
    process.exit(1);
  }

  try {
    const first = argv[0!];
    let operation: AudioOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as AudioOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'create':
          const configFile = argv[1!];
          const config = configFile && fs.existsSync(configFile) 
            ? JSON.parse(fs.readFileSync(configFile, 'utf-8'))
            : {
                sampleRate: 44100,
                channels: 2,
                bufferSize: 1024,
                spatialAudio: true,
                maxSimultaneousSounds: 32
              };
          operation = { op: 'create', config };
          break;
        case 'register-sound':
          if (!argv[1!] || !argv[2!] || !argv[3!]) {
            throw new Error('register-sound requires soundId, name, and category');
          }
          operation = { 
            op: 'register-sound', 
            soundId: argv[1!],
            soundName: argv[2!],
            category: argv[3!],
            volume: parseFloat(argv[4!]) || 1.0,
            pitch: parseFloat(argv[5!]) || 1.0,
            loop: argv[6] === 'true',
            spatial: argv[7] === 'true'
          };
          break;
        case 'play':
          if (!argv[1!]) throw new Error('play requires soundId');
          operation = { 
            op: 'play', 
            soundId: argv[1!],
            volume: parseFloat(argv[2!]) || 1.0,
            pitch: parseFloat(argv[3!]) || 1.0
          };
          break;
        case 'stop':
          if (!argv[1!]) throw new Error('stop requires soundId');
          operation = { op: 'stop', soundId: argv[1!] };
          break;
        case 'pause':
          if (!argv[1!]) throw new Error('pause requires soundId');
          operation = { op: 'pause', soundId: argv[1!] };
          break;
        case 'set-volume':
          if (!argv[1!] || !argv[2!]) throw new Error('set-volume requires soundId and volume');
          operation = { op: 'set-volume', soundId: argv[1], volume: parseFloat(argv[2]) };
          break;
        case 'set-spatial':
          if (!argv[1!] || !argv[2!] || !argv[3!] || !argv[4!]) {
            throw new Error('set-spatial requires soundId, x, y, z');
          }
          operation = { 
            op: 'set-spatial', 
            soundId: argv[1!],
            position: { 
              x: parseFloat(argv[2!]), 
              y: parseFloat(argv[3!]), 
              z: parseFloat(argv[4!]) 
            }
          };
          break;
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    // Create audio system instance
    const audioSystem = new AudioSystem(operation.config || {
      sampleRate: 44100,
      channels: 2,
      bufferSize: 1024,
      spatialAudio: true,
      maxSimultaneousSounds: 32
    }, true); // Headless mode for CLI

    let result: any;

    switch (operation.op) {
      case 'create':
        result = {
          audioSystem: {
            config: audioSystem['config'],
            isHeadless: audioSystem['isHeadless'],
            registeredSounds: audioSystem['sounds'].size,
            activeSounds: audioSystem['activeSounds'].size
          }
        };
        break;

      case 'register-sound':
        const soundDef: SoundDefinition = {
          id: operation.soundId!,
          name: operation.soundName!,
          category: operation.category!,
          volume: operation.volume || 1.0,
          pitch: operation.pitch || 1.0,
          loop: operation.loop || false,
          spatial: operation.spatial || false
        };
        
        audioSystem.registerSound(soundDef);
        
        result = {
          action: 'sound_registered',
          sound: soundDef,
          totalSounds: audioSystem['sounds'].size
        };
        break;

      case 'play':
        const playResult = audioSystem.playSound(
          operation.soundId!,
          operation.volume || 1.0,
          operation.pitch || 1.0
        );
        
        result = {
          action: 'sound_played',
          soundId: operation.soundId,
          volume: operation.volume || 1.0,
          pitch: operation.pitch || 1.0,
          instanceId: playResult,
          activeSounds: audioSystem['activeSounds'].size
        };
        break;

      case 'stop':
        audioSystem.stopSound(operation.soundId!);
        
        result = {
          action: 'sound_stopped',
          soundId: operation.soundId,
          activeSounds: audioSystem['activeSounds'].size
        };
        break;

      case 'pause':
        audioSystem.pauseSound(operation.soundId!);
        
        result = {
          action: 'sound_paused',
          soundId: operation.soundId,
          activeSounds: audioSystem['activeSounds'].size
        };
        break;

      case 'set-volume':
        audioSystem.setVolume(operation.soundId!, operation.volume!);
        
        result = {
          action: 'volume_set',
          soundId: operation.soundId,
          volume: operation.volume
        };
        break;

      case 'set-spatial':
        const spatialConfig: SpatialAudioConfig = {
          position: operation.position!,
          velocity: operation.velocity || { x: 0, y: 0, z: 0 },
          volume: 1.0,
          pitch: 1.0,
          dopplerEffect: true
        };
        
        const spatialInstanceId = audioSystem.playSpatialSound(operation.soundId!, spatialConfig);
        
        result = {
          action: 'spatial_sound_played',
          soundId: operation.soundId,
          spatialConfig,
          instanceId: spatialInstanceId
        };
        break;

      case 'demo':
        // Create a comprehensive audio demo
        const demoAudio = new AudioSystem({
          sampleRate: 44100,
          channels: 2,
          bufferSize: 1024,
          spatialAudio: true,
          maxSimultaneousSounds: 16
        }, true);

        // Add callback to track events
        const events: AudioEvent[] = [];
        demoAudio.addCallback((event: any) => {
          events.push(event);
        });

        // Register various sounds
        const sounds = [
          { id: 'ambient_forest', name: 'Forest Ambience', category: 'ambient', volume: 0.7, loop: true, spatial: true },
          { id: 'footstep_grass', name: 'Grass Footsteps', category: 'sfx', volume: 0.8, loop: false, spatial: true },
          { id: 'sword_clash', name: 'Sword Clash', category: 'combat', volume: 1.0, loop: false, spatial: true },
          { id: 'magic_spell', name: 'Magic Spell', category: 'magic', volume: 0.9, loop: false, spatial: false },
          { id: 'ui_click', name: 'UI Click', category: 'ui', volume: 0.6, loop: false, spatial: false }
        ];

        sounds.forEach((sound: any) => {
          demoAudio.registerSound(sound as SoundDefinition);
        });

        // Play some sounds
        const playResults = [];
        playResults.push(demoAudio.playSound('ambient_forest', 0.7, 1.0));
        playResults.push(demoAudio.playSound('footstep_grass', 0.8, 1.0));
        playResults.push(demoAudio.playSound('sword_clash', 1.0, 1.0));

        // Play spatial sounds
        const spatialInstance1 = demoAudio.playSpatialSound('ambient_forest', {
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          volume: 0.7,
          pitch: 1.0,
          dopplerEffect: false
        });

        const spatialInstance2 = demoAudio.playSpatialSound('footstep_grass', {
          position: { x: 5, y: 0, z: 2 },
          velocity: { x: 1, y: 0, z: 0 },
          volume: 0.8,
          pitch: 1.0,
          dopplerEffect: true
        });

        // Adjust volumes
        demoAudio.setVolume('ambient_forest', 0.5);
        demoAudio.setVolume('sword_clash', 0.8);

        // Stop one sound
        if (spatialInstance2) {
          demoAudio.stopSound(spatialInstance2);
        }

        result = {
          demo: {
            registeredSounds: sounds.length,
            playedSounds: playResults.length,
            activeSounds: demoAudio['activeSounds'].size,
            events: events,
            summary: {
              totalEvents: events.length,
              eventTypes: [...new Set(events.map((e: any) => e.type))],
              soundsPlayed: playResults.length,
              soundsStopped: 1,
              spatialSounds: sounds.filter((s: any) => s.spatial).length,
              ambientSounds: sounds.filter((s: any) => s.category === 'ambient').length
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['create', 'register-sound', 'play', 'stop', 'pause', 'set-volume', 'set-spatial', 'demo', 'dump'],
          description: 'AudioPure - Audio management system with spatialization and event callbacks',
          features: [
            'Sound registration and management',
            'Playback control (play, stop, pause)',
            'Volume and pitch adjustment',
            'Spatial audio with 3D positioning',
            'Event callback system',
            'Headless mode for CLI usage',
            'Multi-channel audio support'
          ],
          soundCategories: ['ambient', 'sfx', 'combat', 'magic', 'ui', 'music'],
          defaultConfig: {
            sampleRate: 44100,
            channels: 2,
            bufferSize: 1024,
            spatialAudio: true,
            maxSimultaneousSounds: 32
          },
          spatialFeatures: [
            '3D positioning (x, y, z)',
            'Velocity-based doppler effect',
            'Distance-based volume attenuation',
            'Listener position tracking'
          ]
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1!] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'AudioPure Export',
      'Audio management system data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: new Date()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1!]}`) {
  main();
}