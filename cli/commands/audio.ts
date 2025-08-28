/**
 * AudioPure CLI Commands
 * 
 * Provides command-line interface for testing and validating the AudioPure module.
 * Inspired by Panda3D AudioManager and Crystal Space FMOD plugin patterns.
 */

import { Command } from 'commander';
import { createAudioSystem, AudioConfig, SoundDefinition } from '../../src/modules/AudioPure/AudioPure';

const program = new Command();

program
  .name('audio')
  .description('AudioPure system commands')
  .version('1.0.0');

program
  .command('validate')
  .description('Validate audio configuration and test playback')
  .option('-s, --sample-rate <number>', 'Sample rate in Hz', '44100')
  .option('-c, --channels <number>', 'Number of audio channels', '2')
  .option('-b, --buffer-size <number>', 'Audio buffer size', '2048')
  .option('-m, --max-sounds <number>', 'Maximum simultaneous sounds', '8')
  .option('--spatial', 'Enable spatial audio', false)
  .option('--headless', 'Run in headless mode (no actual audio output)', false)
  .action(async (options: any) => {
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
    const report = audioSystem.generateAudioReport();
    console.log(report);

    console.log('\n✅ Audio validation completed successfully!');
  });

program
  .command('test')
  .description('Run comprehensive audio tests')
  .option('--headless', 'Run in headless mode', false)
  .option('--duration <seconds>', 'Test duration in seconds', '5')
  .action(async (options: any) => {
    console.log('🧪 Running comprehensive audio tests...');

    const audioSystem = createAudioSystem({
      sampleRate: 44100,
      channels: 2,
      bufferSize: 2048,
      spatialAudio: true,
      maxSimultaneousSounds: 16
    }, options.headless);

    // Register test sounds
    const sounds = [
      { id: 'bgm', name: 'Background Music', category: 'music', volume: 0.6, pitch: 1.0, loop: true, spatial: false },
      { id: 'sfx1', name: 'Sound Effect 1', category: 'sfx', volume: 0.8, pitch: 1.0, loop: false, spatial: false },
      { id: 'sfx2', name: 'Sound Effect 2', category: 'sfx', volume: 0.7, pitch: 1.0, loop: false, spatial: false },
      { id: 'voice', name: 'Voice Line', category: 'voice', volume: 0.9, pitch: 1.0, loop: false, spatial: false }
    ];

    sounds.forEach(sound => audioSystem.registerSound(sound));

    // Test sequence
    console.log('Starting test sequence...');
    
    // Start background music
    const bgmId = audioSystem.playSound('bgm');
    console.log(`🎵 Background music started: ${bgmId}`);

    // Play sound effects at intervals
    const testDuration = parseInt(options.duration) * 1000;
    const interval = testDuration / 10;

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const sfxId = audioSystem.playSound(i % 2 === 0 ? 'sfx1' : 'sfx2');
        console.log(`🔊 Sound effect ${i + 1}: ${sfxId}`);
      }, i * interval);
    }

    // Play voice line halfway through
    setTimeout(() => {
      const voiceId = audioSystem.playSound('voice');
      console.log(`🗣️ Voice line: ${voiceId}`);
    }, testDuration / 2);

    // Stop background music at the end
    setTimeout(() => {
      if (bgmId) {
        audioSystem.stopSound(bgmId);
        console.log('🛑 Background music stopped');
      }
      
      const report = audioSystem.generateAudioReport();
      console.log('\n📊 Final Test Report:');
      console.log(report);
      
      console.log('\n✅ Audio tests completed!');
    }, testDuration);
  });

program
  .command('simulate')
  .description('Simulate complex audio scenario')
  .option('--scenario <name>', 'Scenario to simulate', 'gameplay')
  .option('--headless', 'Run in headless mode', false)
  .action(async (options: any) => {
    console.log(`🎮 Simulating ${options.scenario} audio scenario...`);

    const audioSystem = createAudioSystem({
      sampleRate: 48000,
      channels: 2,
      bufferSize: 4096,
      spatialAudio: true,
      maxSimultaneousSounds: 32
    }, options.headless);

    // Register scenario-specific sounds
    const scenarioSounds = {
      gameplay: [
        { id: 'ambient', name: 'Ambient Background', category: 'ambient', volume: 0.4, pitch: 1.0, loop: true, spatial: false },
        { id: 'footsteps', name: 'Footsteps', category: 'sfx', volume: 0.6, pitch: 1.0, loop: false, spatial: true },
        { id: 'sword-swing', name: 'Sword Swing', category: 'sfx', volume: 0.8, pitch: 1.0, loop: false, spatial: true },
        { id: 'magic-cast', name: 'Magic Cast', category: 'sfx', volume: 0.7, pitch: 1.0, loop: false, spatial: true },
        { id: 'victory-fanfare', name: 'Victory Fanfare', category: 'music', volume: 0.9, pitch: 1.0, loop: false, spatial: false }
      ],
      menu: [
        { id: 'menu-bgm', name: 'Menu Background', category: 'music', volume: 0.5, pitch: 1.0, loop: true, spatial: false },
        { id: 'button-hover', name: 'Button Hover', category: 'ui', volume: 0.3, pitch: 1.0, loop: false, spatial: false },
        { id: 'button-click', name: 'Button Click', category: 'ui', volume: 0.4, pitch: 1.0, loop: false, spatial: false },
        { id: 'menu-transition', name: 'Menu Transition', category: 'ui', volume: 0.6, pitch: 1.0, loop: false, spatial: false }
      ]
    };

    const sounds = scenarioSounds[options.scenario as keyof typeof scenarioSounds] || scenarioSounds.gameplay;
    sounds.forEach(sound => audioSystem.registerSound(sound));

    // Simulate scenario
    if (options.scenario === 'gameplay') {
      console.log('Simulating gameplay audio...');
      
      // Start ambient background
      const ambientId = audioSystem.playSound('ambient');
      
      // Simulate player actions
      setTimeout(() => audioSystem.playSound('footsteps'), 1000);
      setTimeout(() => audioSystem.playSound('sword-swing'), 2000);
      setTimeout(() => audioSystem.playSound('magic-cast'), 3500);
      setTimeout(() => audioSystem.playSound('footsteps'), 4500);
      setTimeout(() => audioSystem.playSound('sword-swing'), 5500);
      setTimeout(() => audioSystem.playSound('victory-fanfare'), 7000);
      
      // Stop ambient after victory
      setTimeout(() => {
        if (ambientId) audioSystem.stopSound(ambientId);
        console.log('🎉 Gameplay scenario completed!');
      }, 8000);
      
    } else if (options.scenario === 'menu') {
      console.log('Simulating menu audio...');
      
      // Start menu background
      const menuBgmId = audioSystem.playSound('menu-bgm');
      
      // Simulate menu interactions
      setTimeout(() => audioSystem.playSound('button-hover'), 1000);
      setTimeout(() => audioSystem.playSound('button-click'), 1500);
      setTimeout(() => audioSystem.playSound('menu-transition'), 2000);
      setTimeout(() => audioSystem.playSound('button-hover'), 3000);
      setTimeout(() => audioSystem.playSound('button-click'), 3500);
      
      // Stop menu background
      setTimeout(() => {
        if (menuBgmId) audioSystem.stopSound(menuBgmId);
        console.log('📋 Menu scenario completed!');
      }, 5000);
    }

    // Generate final report
    setTimeout(() => {
      const report = audioSystem.generateAudioReport();
      console.log('\n📊 Scenario Report:');
      console.log(report);
    }, 10000);
  });

program.parse();