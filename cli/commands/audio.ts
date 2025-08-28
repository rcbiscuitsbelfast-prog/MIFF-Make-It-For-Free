#!/usr/bin/env node

/**
 * audio.ts - CLI commands for AudioPure module
 * 
 * Provides commands for validating, testing, and managing audio systems.
 */

import { Command } from 'commander';
import { createAudioSystem, AudioConfig, SoundDefinition } from '../miff/pure/AudioPure/AudioPure';

const program = new Command();

program
  .name('audio')
  .description('Audio and sound management commands for MIFF games')
  .version('1.0.0');

program
  .command('validate')
  .description('Validate audio system configuration and test sound playback')
  .option('-s, --sample-rate <number>', 'Sample rate in Hz', '44100')
  .option('-c, --channels <number>', 'Number of audio channels', '2')
  .option('-b, --buffer-size <number>', 'Audio buffer size', '1024')
  .option('-m, --max-sounds <number>', 'Maximum simultaneous sounds', '8')
  .option('--spatial', 'Enable spatial audio', false)
  .option('--headless', 'Run in headless mode (no actual audio output)', false)
  .action(async (options) => {
    console.log('🔊 Validating AudioPure system...');

    const config: AudioConfig = {
      sampleRate: parseInt(options.sampleRate),
      channels: parseInt(options.channels),
      bufferSize: parseInt(options.bufferSize),
      spatialAudio: options.spatial,
      maxSimultaneousSounds: parseInt(options.maxSounds)
    };

    console.log('Configuration:', JSON.stringify(config, null, 2));

    const audioSystem = createAudioSystem(config, options.headless);

    // Register test sounds
    const testSounds: SoundDefinition[] = [
      {
        id: 'test-bgm',
        name: 'Test Background Music',
        category: 'music',
        volume: 0.7,
        pitch: 1.0,
        loop: true,
        spatial: false
      },
      {
        id: 'test-sfx',
        name: 'Test Sound Effect',
        category: 'sfx',
        volume: 0.8,
        pitch: 1.0,
        loop: false,
        spatial: true
      },
      {
        id: 'test-voice',
        name: 'Test Voice Line',
        category: 'voice',
        volume: 0.9,
        pitch: 1.0,
        loop: false,
        spatial: false
      }
    ];

    console.log('Registering test sounds...');
    testSounds.forEach(sound => {
      audioSystem.registerSound(sound);
      console.log(`✅ Registered: ${sound.name} (${sound.category})`);
    });

    // Test basic playback
    console.log('\nTesting basic sound playback...');
    const bgmId = audioSystem.playSound('test-bgm', 0.5);
    if (bgmId) {
      console.log(`✅ Background music playing: ${bgmId}`);
    }

    const sfxId = audioSystem.playSound('test-sfx', 0.8);
    if (sfxId) {
      console.log(`✅ Sound effect playing: ${sfxId}`);
    }

    // Test spatial audio if enabled
    if (config.spatialAudio) {
      console.log('\nTesting spatial audio...');
      const spatialId = audioSystem.playSpatialSound('test-sfx', {
        position: { x: 10, y: 0, z: 0 },
        velocity: { x: 1, y: 0, z: 0 },
        volume: 0.7,
        pitch: 1.1,
        dopplerEffect: true
      });
      if (spatialId) {
        console.log(`✅ Spatial sound playing: ${spatialId}`);
      }
    }

    // Test volume control
    console.log('\nTesting volume control...');
    if (bgmId) {
      audioSystem.setVolume(bgmId, 0.3);
      console.log('✅ Volume adjusted for background music');
    }

    // Test maximum sounds limit
    console.log('\nTesting maximum sounds limit...');
    let soundCount = 0;
    for (let i = 0; i < 15; i++) {
      const id = audioSystem.playSound('test-sfx');
      if (id) soundCount++;
    }
    console.log(`✅ Created ${soundCount} sound instances (max: ${config.maxSimultaneousSounds})`);

    // Generate report
    console.log('\n📊 Audio System Report:');
    console.log(audioSystem.generateAudioReport());

    // Cleanup
    audioSystem.stopAllSounds();
    console.log('\n✅ Audio validation completed');
  });

program
  .command('test')
  .description('Run comprehensive audio system tests')
  .option('--headless', 'Run in headless mode', false)
  .action(async (options) => {
    console.log('🧪 Running AudioPure tests...');

    const config: AudioConfig = {
      sampleRate: 44100,
      channels: 2,
      bufferSize: 1024,
      spatialAudio: true,
      maxSimultaneousSounds: 4
    };

    const audioSystem = createAudioSystem(config, options.headless);

    // Test 1: Basic sound registration
    console.log('Test 1: Sound registration...');
    const soundDef: SoundDefinition = {
      id: 'test-sound',
      name: 'Test Sound',
      category: 'sfx',
      volume: 0.8,
      pitch: 1.0,
      loop: false,
      spatial: false
    };

    audioSystem.registerSound(soundDef);
    const registeredSound = audioSystem.getSoundDefinition('test-sound');
    if (registeredSound) {
      console.log('✅ Sound registration successful');
    } else {
      console.log('❌ Sound registration failed');
    }

    // Test 2: Sound playback
    console.log('Test 2: Sound playback...');
    const instanceId = audioSystem.playSound('test-sound');
    if (instanceId) {
      console.log('✅ Sound playback successful');
      
      // Test volume control
      audioSystem.setVolume(instanceId, 0.5);
      console.log('✅ Volume control working');
      
      // Test stopping
      audioSystem.stopSound(instanceId);
      console.log('✅ Sound stopping working');
    } else {
      console.log('❌ Sound playback failed');
    }

    // Test 3: Spatial audio
    console.log('Test 3: Spatial audio...');
    const spatialSound: SoundDefinition = {
      id: 'spatial-sound',
      name: 'Spatial Sound',
      category: 'sfx',
      volume: 0.8,
      pitch: 1.0,
      loop: false,
      spatial: true
    };

    audioSystem.registerSound(spatialSound);
    const spatialId = audioSystem.playSpatialSound('spatial-sound', {
      position: { x: 5, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      volume: 0.7,
      pitch: 1.0,
      dopplerEffect: true
    });

    if (spatialId) {
      console.log('✅ Spatial audio working');
      audioSystem.updateSpatialAudio();
      console.log('✅ Spatial audio update working');
    } else {
      console.log('❌ Spatial audio failed');
    }

    // Test 4: Event callbacks
    console.log('Test 4: Event callbacks...');
    let eventCount = 0;
    const callback = () => {
      eventCount++;
    };

    audioSystem.addCallback(callback);
    audioSystem.playSound('test-sound');
    audioSystem.stopAllSounds();

    if (eventCount > 0) {
      console.log(`✅ Event callbacks working (${eventCount} events)`);
    } else {
      console.log('❌ Event callbacks failed');
    }

    // Test 5: Maximum sounds limit
    console.log('Test 5: Maximum sounds limit...');
    const limitSound: SoundDefinition = {
      id: 'limit-test',
      name: 'Limit Test',
      category: 'sfx',
      volume: 0.8,
      pitch: 1.0,
      loop: false,
      spatial: false
    };

    audioSystem.registerSound(limitSound);
    
    const instances = [];
    for (let i = 0; i < 10; i++) {
      const id = audioSystem.playSound('limit-test');
      if (id) instances.push(id);
    }

    const activeSounds = audioSystem.getActiveSounds();
    if (activeSounds.length <= config.maxSimultaneousSounds) {
      console.log(`✅ Maximum sounds limit working (${activeSounds.length}/${config.maxSimultaneousSounds})`);
    } else {
      console.log('❌ Maximum sounds limit failed');
    }

    console.log('\n📊 Final Test Report:');
    console.log(audioSystem.generateAudioReport());
    console.log('\n✅ Audio tests completed');
  });

program
  .command('simulate')
  .description('Simulate complex audio scenario with multiple sounds')
  .option('-d, --duration <seconds>', 'Simulation duration in seconds', '5')
  .option('--headless', 'Run in headless mode', false)
  .action(async (options) => {
    const duration = parseInt(options.duration);
    console.log(`🎵 Simulating audio scenario for ${duration} seconds...`);

    const config: AudioConfig = {
      sampleRate: 44100,
      channels: 2,
      bufferSize: 1024,
      spatialAudio: true,
      maxSimultaneousSounds: 6
    };

    const audioSystem = createAudioSystem(config, options.headless);

    // Register game-like sounds
    const gameSounds = [
      { id: 'bgm', name: 'Background Music', category: 'music', volume: 0.6, pitch: 1.0, loop: true, spatial: false },
      { id: 'jump', name: 'Jump Sound', category: 'sfx', volume: 0.8, pitch: 1.0, loop: false, spatial: true },
      { id: 'coin', name: 'Coin Collect', category: 'sfx', volume: 0.9, pitch: 1.2, loop: false, spatial: false },
      { id: 'explosion', name: 'Explosion', category: 'sfx', volume: 0.7, pitch: 0.8, loop: false, spatial: true },
      { id: 'voice', name: 'Character Voice', category: 'voice', volume: 0.8, pitch: 1.0, loop: false, spatial: false }
    ];

    gameSounds.forEach(sound => audioSystem.registerSound(sound));

    // Start background music
    const bgmId = audioSystem.playSound('bgm', 0.5);
    console.log('🎵 Background music started');

    // Simulate game events
    const events = [
      { time: 1000, sound: 'jump', spatial: true, position: { x: 0, y: 0, z: 0 } },
      { time: 2000, sound: 'coin', spatial: false },
      { time: 3000, sound: 'jump', spatial: true, position: { x: 5, y: 0, z: 0 } },
      { time: 4000, sound: 'explosion', spatial: true, position: { x: 10, y: 0, z: 0 } },
      { time: 5000, sound: 'voice', spatial: false },
      { time: 6000, sound: 'coin', spatial: false },
      { time: 7000, sound: 'jump', spatial: true, position: { x: -5, y: 0, z: 0 } }
    ];

    const startTime = Date.now();
    const eventPromises = events.map(event => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          if (event.spatial) {
            audioSystem.playSpatialSound(event.sound, {
              position: event.position,
              velocity: { x: 0, y: 0, z: 0 },
              volume: 0.8,
              pitch: 1.0,
              dopplerEffect: true
            });
          } else {
            audioSystem.playSound(event.sound);
          }
          console.log(`🎵 Played: ${event.sound}`);
          resolve();
        }, event.time);
      });
    });

    // Update spatial audio periodically
    const spatialUpdateInterval = setInterval(() => {
      audioSystem.updateSpatialAudio();
    }, 100);

    // Wait for all events
    await Promise.all(eventPromises);

    // Let sounds play for remaining time
    const remainingTime = (duration * 1000) - (Date.now() - startTime);
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    // Cleanup
    clearInterval(spatialUpdateInterval);
    audioSystem.stopAllSounds();

    console.log('\n📊 Simulation Report:');
    console.log(audioSystem.generateAudioReport());
    console.log('\n✅ Audio simulation completed');
  });

export default program;