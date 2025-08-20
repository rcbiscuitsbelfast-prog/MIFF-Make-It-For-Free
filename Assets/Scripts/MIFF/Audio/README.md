# Audio System

A comprehensive, modular audio management system for the K-pop spirit battle game. This system provides BGM, SFX, and stem playback with precise musical synchronization and remix-safe architecture.

## Overview

The Audio System consists of five core components:

1. **AudioManager** - Central singleton service for audio playback management
2. **AudioClipRegistry** - Registry for mapping string IDs to audio clip references
3. **AudioChannel** - Enum defining audio channel types
4. **StemSyncHelper** - Helper for musical timing and synchronization
5. **AudioTrack** - Individual track management for playback control
6. **AudioTestHarness** - Console-based testing and validation system

## Core Components

### AudioManager

Central singleton service that manages all audio operations including BGM, SFX, and stem playback.

**Key Features:**
- **Singleton Pattern**: Global access via `AudioManager.Instance`
- **Multi-Channel Support**: BGM, SFX, and Stem channels with independent volume control
- **Stem Synchronization**: Precise timing for musical synchronization
- **Volume Management**: Master and per-channel volume control
- **Audio Queue**: Batch processing of audio requests
- **Event System**: Comprehensive events for remix hooks

**Core Methods:**
- `PlayBGM(string trackID)` - Play background music
- `PlaySFX(string sfxID)` - Play sound effects
- `PlayStemSynced(string stemID, double dspTime)` - Play stems with timing sync
- `SetVolume(AudioChannel channel, float volume)` - Set channel volume
- `SetMasterVolume(float volume)` - Set master volume
- `StopAllAudio()` - Stop all audio playback

**Configuration Options:**
- Audio enable/disable, stem sync, fade effects, crossfade
- Volume settings for all channels
- Audio quality, compression, concurrent limits
- Remix hooks for custom processors and logic

### AudioClipRegistry

Registry system for managing audio clip metadata and lookup.

**Key Features:**
- **Clip Registration**: Add, update, and remove audio clips
- **Metadata Tracking**: BPM, category, tags, and custom fields
- **Indexed Lookup**: Fast queries by channel, category, and BPM
- **Validation**: Automatic data integrity checking
- **Statistics**: Comprehensive registry analytics

**Core Methods:**
- `RegisterAudioClip(string clipID, string displayName, AudioChannel channel, double bpm)`
- `GetAudioClip(string clipID)` - Retrieve clip by ID
- `GetAudioClipsByChannel(AudioChannel channel)` - Get clips by channel
- `GetAudioClipsByBPM(double bpm, double tolerance)` - Get clips by BPM
- `SearchAudioClips(string searchTerm)` - Text-based search

### AudioChannel

Enum defining the different types of audio channels available.

**Channel Types:**
- **BGM** - Background Music (continuous music tracks)
- **SFX** - Sound Effects (short audio clips for actions)
- **Stem** - Individual instrument tracks for synchronization
- **Voice** - Character dialogue and vocals
- **Ambient** - Environmental and atmospheric sounds
- **UI** - User Interface interaction sounds
- **Battle** - Combat and battle-specific audio
- **Menu** - Menu navigation and selection sounds
- **Custom1-3** - Remixer-defined channels

### StemSyncHelper

Advanced helper class for musical timing and synchronization.

**Key Features:**
- **Bar Boundary Calculation**: `GetNextBarTime(double currentTime, double bpm)`
- **Beat Alignment**: `GetNextBeatTime(double currentTime, double bpm)`
- **Subdivision Support**: `GetNextSubdivisionTime(double currentTime, double bpm, int subdivision)`
- **Musical Position**: Current bar, beat, and subdivision tracking
- **Grid Alignment**: Time offset calculations for musical grid alignment
- **Groove Quantization**: Swing, shuffle, Latin, and funk patterns

**Musical Features:**
- **Time Signatures**: Support for various time signatures (default: 4/4)
- **BPM Range**: 1-300 BPM with validation
- **Sync Tolerance**: Configurable precision (default: 1ms)
- **Groove Patterns**: Built-in musical feel patterns
- **Custom Extensions**: Remixer-defined time signatures and subdivisions

### AudioTrack

Individual track management for playback control and effects.

**Key Features:**
- **Playback Control**: Start, stop, pause, resume, schedule
- **Volume Management**: Target volume with ramping support
- **Fade Effects**: Configurable fade in/out with custom timing
- **Scheduling**: Precise timing for future playback
- **State Tracking**: Comprehensive playback status monitoring

**Effects System:**
- **Fade In/Out**: Smooth volume transitions
- **Volume Ramping**: Gradual volume changes
- **Custom Curves**: Extensible fade curve system
- **Timing Control**: Precise effect timing

### AudioTestHarness

Console-based testing and validation system.

**Key Features:**
- **Interactive Mode**: Command-line interface for manual testing
- **Automated Tests**: Pre-built test scenarios
- **Performance Testing**: Performance benchmarking
- **Test Results**: Comprehensive test result tracking
- **Remix Hooks**: Custom test and validation support

**Test Commands:**
- `play <audioID> [channel]` - Play audio clips
- `stop [audioID]` - Stop audio playback
- `volume <channel> <value>` - Set channel volume
- `stem <stemID> <bpm>` - Play stems with BPM sync
- `sync <time> <bpm>` - Test stem synchronization
- `test [testName]` - Run automated tests

## Usage Examples

### Basic Audio Playback

```csharp
// Get audio manager instance
var audioManager = AudioManager.Instance;

// Play background music
audioManager.PlayBGM("bgm_main_theme");

// Play sound effect
audioManager.PlaySFX("sfx_button_click");

// Set volume
audioManager.SetVolume(AudioChannel.BGM, 0.8f);
audioManager.SetVolume(AudioChannel.SFX, 1.0f);
```

### Stem Synchronization

```csharp
// Get stem sync helper
var stemSync = new StemSyncHelper();

// Calculate next bar boundary
double currentTime = 2.5; // Current time in seconds
double bpm = 120.0;       // Beats per minute
double nextBarTime = stemSync.GetNextBarTime(currentTime, bpm);

// Play stem synchronized to musical timing
audioManager.PlayStemSynced("stem_drums", nextBarTime);
```

### Audio Registry Management

```csharp
// Get audio registry
var registry = new AudioClipRegistry();

// Register new audio clip
registry.RegisterAudioClip("custom_bgm", "Custom BGM", AudioChannel.BGM, 140.0);

// Search for clips
var results = registry.SearchAudioClips("custom");
var bgmClips = registry.GetAudioClipsByChannel(AudioChannel.BGM);
var fastClips = registry.GetAudioClipsByBPM(140.0, 10.0); // ±10 BPM tolerance
```

### Advanced Musical Timing

```csharp
// Get musical position
var position = stemSync.GetMusicalPosition(currentTime, bpm);
Console.WriteLine($"Bar {position.bar + 1}, Beat {position.beat + 1}");

// Calculate grid alignment
double barOffset = stemSync.CalculateGridAlignment(currentTime, bpm, GridAlignmentType.Bar);
double beatOffset = stemSync.CalculateGridAlignment(currentTime, bpm, GridAlignmentType.Beat);

// Apply groove quantization
double quantizedTime = stemSync.ApplyGrooveQuantization(currentTime, bpm, GroovePattern.Swing);
```

## Remix Safety Features

### Event System

All major operations emit events for remixers to hook into:

```csharp
// Listen for BGM events
AudioManager.Instance.OnBGMStarted += (manager, trackID) =>
{
    Console.WriteLine($"🎵 BGM started: {trackID}");
    // Custom logic here
};

// Listen for volume changes
AudioManager.Instance.OnVolumeChanged += (manager, channel, volume) =>
{
    Console.WriteLine($"🔊 {channel} volume changed to {volume}");
    // Custom volume logic
};

// Listen for audio errors
AudioManager.Instance.OnAudioError += (manager, error) =>
{
    Console.WriteLine($"❌ Audio error: {error}");
    // Custom error handling
};
```

### Custom Extensions

The system supports extensive customization:

```csharp
// Custom groove patterns
stemSync.enableCustomGroovePatterns = true;

// Custom fade curves
track.enableCustomFadeCurves = true;

// Custom audio processors
audioManager.enableCustomAudioProcessors = true;

// Custom validation
registry.enableCustomValidation = true;
```

### Configuration Hooks

All components provide configuration options:

```csharp
// Audio quality settings
audioManager.enableHighQuality = true;
audioManager.enableCompression = false;
audioManager.maxConcurrentSFX = 20;

// Sync precision
stemSync.enablePreciseSync = true;
stemSync.syncTolerance = 0.0005; // 0.5ms tolerance

// Test configuration
testHarness.enablePerformanceTests = true;
testHarness.enableStressTests = true;
```

## Testing and Validation

### Interactive Testing

```csharp
// Start interactive test harness
var testHarness = new AudioTestHarness();
testHarness.StartInteractiveHarness();

// Available commands:
// play bgm_main_theme
// play sfx_button_click sfx
// stem stem_drums 120
// volume bgm 0.5
// sync 2.5 140
// test all
```

### Automated Testing

```csharp
// Run specific tests
testHarness.RunSpecificTest("bgm");
testHarness.RunSpecificTest("sfx");
testHarness.RunSpecificTest("stem");
testHarness.RunSpecificTest("volume");
testHarness.RunSpecificTest("sync");
testHarness.RunSpecificTest("performance");

// Run all tests
testHarness.RunAllTests();

// View results
testHarness.ShowTestResults();
```

### Performance Testing

```csharp
// Performance benchmarks
var startTime = DateTime.Now;

// Test 1000 sync calculations
for (int i = 0; i < 1000; i++)
{
    stemSync.GetNextBarTime(i * 0.1, 120.0 + (i % 20));
}

var duration = DateTime.Now - startTime;
Console.WriteLine($"Performance: 1000 operations in {duration.TotalMilliseconds:F2}ms");
```

## Integration Points

### Game Systems

- **Battle System**: Combat audio, victory/defeat themes
- **Menu System**: UI sounds, navigation audio
- **Spirit System**: Evolution sounds, capture audio
- **Quest System**: Achievement sounds, progression audio

### External Systems

- **Audio Engine**: Unity Audio, FMOD, Wwise integration
- **Music Production**: DAW integration, stem export
- **Localization**: Multi-language audio support
- **Analytics**: Audio usage tracking and metrics

## Performance Considerations

### Memory Management

- **Clip Registry**: Efficient lookup with indexed queries
- **Track Management**: Object pooling for active tracks
- **Event System**: Optimized event dispatching
- **Garbage Collection**: Minimal allocation during playback

### CPU Optimization

- **Sync Calculations**: Cached musical timing calculations
- **Volume Updates**: Efficient volume ramping algorithms
- **Fade Effects**: Optimized fade curve calculations
- **Batch Processing**: Audio queue for reduced overhead

### Scalability

- **Concurrent Limits**: Configurable limits for SFX and stems
- **Quality Settings**: Adjustable audio quality for performance
- **Streaming Support**: Large audio file handling
- **Compression**: Optional audio compression for memory

## Future Enhancements

### Planned Features

1. **3D Audio**: Spatial audio positioning and effects
2. **Dynamic Music**: Adaptive music based on game state
3. **Audio Effects**: Reverb, echo, and filter effects
4. **MIDI Support**: MIDI file playback and control
5. **Network Audio**: Multiplayer audio synchronization

### Extension Points

1. **Custom Audio Engines**: Pluggable audio backend systems
2. **Advanced Effects**: Custom DSP and audio processing
3. **Machine Learning**: AI-driven audio analysis and generation
4. **Cloud Integration**: Remote audio streaming and storage

## Troubleshooting

### Common Issues

1. **Audio Not Playing**: Check audio enable flag and volume settings
2. **Sync Issues**: Verify BPM values and sync tolerance settings
3. **Performance Problems**: Adjust concurrent limits and quality settings
4. **Memory Issues**: Monitor clip registry size and active track count

### Debug Tools

```csharp
// Enable debug logging
Console.WriteLine(audioManager.GetAudioManagerSummary());
Console.WriteLine(stemSync.GetSyncHelperSummary());
Console.WriteLine(testHarness.GetTestHarnessSummary());

// Check audio status
var status = audioManager.GetAudioStatus();
Console.WriteLine(status.ToString());

// Validate registry
var registryStats = registry.GetStatistics();
Console.WriteLine(registryStats.ToString());
```

## License and Attribution

This system is part of the MIFF (Modular, Remix-Safe, Contributor-Friendly) framework. It is designed to be freely remixed and extended by contributors while maintaining system integrity and performance.

---

**Note**: This system is designed to be Unity-independent and can be used in any C# environment. For Unity integration, additional ScriptableObject wrappers and Unity Audio integration can be created to provide editor-friendly audio management.