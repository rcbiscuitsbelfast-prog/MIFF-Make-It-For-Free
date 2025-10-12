/**
 * SpeechRecognitionPure Manager - Advanced Speech Recognition Management System
 *
 * Comprehensive speech recognition system with:
 * - Audio preprocessing and feature extraction
 * - Speech-to-text conversion
 * - Speaker identification and verification
 * - Language detection and adaptation
 * - Real-time processing and streaming
 * - Noise reduction and enhancement
 * - Voice activity detection
 * - Performance optimization
 *
 * @version 1.0.0
 * @author MIFF Framework

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';
 */

export interface SpeechRecognitionConfig {
  enableAudioPreprocessing: boolean;
  enableFeatureExtraction: boolean;
  enableSpeechToText: boolean;
  enableSpeakerIdentification: boolean;
  enableSpeakerVerification: boolean;
  enableLanguageDetection: boolean;
  enableLanguageAdaptation: boolean;
  enableRealTimeProcessing: boolean;
  enableStreaming: boolean;
  enableNoiseReduction: boolean;
  enableVoiceActivityDetection: boolean;
  enablePerformanceOptimization: boolean;
  maxAudios: number;
  maxModels: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface SpeechRecognition {
  id: string;
  name: string;
  type: RecognitionType;
  status: RecognitionStatus;
  audios: AudioData[];
  models: SpeechModel[];
  pipelines: SpeechPipeline[];
  languages: LanguageInfo[];
  analytics: SpeechAnalytics;
  metadata: SpeechMetadata;
  version: string;
  created: number;
  modified: number;
}

export enum RecognitionType {
  SPEECH_TO_TEXT = 'speech_to_text',
  SPEAKER_IDENTIFICATION = 'speaker_identification',
  SPEAKER_VERIFICATION = 'speaker_verification',
  LANGUAGE_DETECTION = 'language_detection',
  VOICE_COMMAND = 'voice_command',
  CUSTOM = 'custom'
}

export enum RecognitionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROCESSING = 'processing',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface AudioData {
  id: string;
  name: string;
  type: AudioType;
  status: AudioStatus;
  data: AudioInfo;
  preprocessing: AudioPreprocessing;
  features: AudioFeatures;
  transcription: TranscriptionData;
  metadata: Map<string, any>;
}

export enum AudioType {
  WAV = 'wav',
  MP3 = 'mp3',
  FLAC = 'flac',
  OGG = 'ogg',
  M4A = 'm4a',
  CUSTOM = 'custom'
}

export enum AudioStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface AudioInfo {
  duration: number;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  format: string;
  size: number;
  metadata: Map<string, any>;
}

export interface AudioPreprocessing {
  normalization: NormalizationConfig;
  filtering: FilteringConfig;
  noiseReduction: NoiseReductionConfig;
  voiceActivityDetection: VADConfig;
  metadata: Map<string, any>;
}

export interface NormalizationConfig {
  enabled: boolean;
  method: NormalizationMethod;
  targetLevel: number;
  metadata: Map<string, any>;
}

export enum NormalizationMethod {
  PEAK = 'peak',
  RMS = 'rms',
  LUFS = 'lufs',
  CUSTOM = 'custom'
}

export interface FilteringConfig {
  enabled: boolean;
  highPass: HighPassFilter;
  lowPass: LowPassFilter;
  bandPass: BandPassFilter;
  metadata: Map<string, any>;
}

export interface HighPassFilter {
  enabled: boolean;
  frequency: number;
  order: number;
  metadata: Map<string, any>;
}

export interface LowPassFilter {
  enabled: boolean;
  frequency: number;
  order: number;
  metadata: Map<string, any>;
}

export interface BandPassFilter {
  enabled: boolean;
  lowFrequency: number;
  highFrequency: number;
  order: number;
  metadata: Map<string, any>;
}

export interface NoiseReductionConfig {
  enabled: boolean;
  algorithm: NoiseReductionAlgorithm;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum NoiseReductionAlgorithm {
  SPECTRAL_SUBTRACTION = 'spectral_subtraction',
  WIENER_FILTER = 'wiener_filter',
  DEEP_LEARNING = 'deep_learning',
  CUSTOM = 'custom'
}

export interface VADConfig {
  enabled: boolean;
  algorithm: VADAlgorithm;
  threshold: number;
  metadata: Map<string, any>;
}

export enum VADAlgorithm {
  ENERGY_BASED = 'energy_based',
  SPECTRAL_BASED = 'spectral_based',
  MACHINE_LEARNING = 'machine_learning',
  CUSTOM = 'custom'
}

export interface AudioFeatures {
  mfcc: MFCCFeatures;
  spectrogram: SpectrogramFeatures;
  pitch: PitchFeatures;
  energy: EnergyFeatures;
  metadata: Map<string, any>;
}

export interface MFCCFeatures {
  coefficients: number[][];
  delta: number[][];
  deltaDelta: number[][];
  metadata: Map<string, any>;
}

export interface SpectrogramFeatures {
  magnitude: number[][];
  phase: number[][];
  melSpectrogram: number[][];
  metadata: Map<string, any>;
}

export interface PitchFeatures {
  fundamental: number[];
  harmonics: number[][];
  metadata: Map<string, any>;
}

export interface EnergyFeatures {
  frameEnergy: number[];
  spectralEnergy: number[];
  metadata: Map<string, any>;
}

export interface TranscriptionData {
  text: string;
  confidence: number;
  words: WordInfo[];
  timestamps: TimestampInfo[];
  language: string;
  metadata: Map<string, any>;
}

export interface WordInfo {
  word: string;
  confidence: number;
  startTime: number;
  endTime: number;
  metadata: Map<string, any>;
}

export interface TimestampInfo {
  start: number;
  end: number;
  text: string;
  metadata: Map<string, any>;
}

export interface SpeechModel {
  id: string;
  name: string;
  type: ModelType;
  status: ModelStatus;
  architecture: ModelArchitecture;
  training: ModelTraining;
  performance: ModelPerformance;
  languages: string[];
  metadata: Map<string, any>;
}

export enum ModelType {
  ACOUSTIC = 'acoustic',
  LANGUAGE = 'language',
  PRONUNCIATION = 'pronunciation',
  SPEAKER = 'speaker',
  CUSTOM = 'custom'
}

export enum ModelStatus {
  TRAINING = 'training',
  TRAINED = 'trained',
  DEPLOYED = 'deployed',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface ModelArchitecture {
  type: ArchitectureType;
  layers: LayerInfo[];
  parameters: number;
  vocabulary: number;
  contextWindow: number;
  metadata: Map<string, any>;
}

export enum ArchitectureType {
  HIDDEN_MARKOV_MODEL = 'hidden_markov_model',
  DEEP_NEURAL_NETWORK = 'deep_neural_network',
  RECURRENT_NEURAL_NETWORK = 'recurrent_neural_network',
  CONVOLUTIONAL_NEURAL_NETWORK = 'convolutional_neural_network',
  TRANSFORMER = 'transformer',
  CUSTOM = 'custom'
}

export interface LayerInfo {
  type: string;
  size: number;
  activation: string;
  dropout: number;
  metadata: Map<string, any>;
}

export interface ModelTraining {
  dataset: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: string;
  loss: string;
  validationSplit: number;
  metadata: Map<string, any>;
}

export interface ModelPerformance {
  accuracy: number;
  wordErrorRate: number;
  characterErrorRate: number;
  realTimeFactor: number;
  latency: number;
  metadata: Map<string, any>;
}

export interface SpeechPipeline {
  id: string;
  name: string;
  type: PipelineType;
  status: PipelineStatus;
  steps: PipelineStep[];
  input: PipelineInput;
  output: PipelineOutput;
  performance: PipelinePerformance;
  metadata: Map<string, any>;
}

export enum PipelineType {
  SPEECH_TO_TEXT = 'speech_to_text',
  SPEAKER_IDENTIFICATION = 'speaker_identification',
  SPEAKER_VERIFICATION = 'speaker_verification',
  LANGUAGE_DETECTION = 'language_detection',
  VOICE_COMMAND = 'voice_command',
  CUSTOM = 'custom'
}

export enum PipelineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROCESSING = 'processing',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface PipelineStep {
  id: string;
  name: string;
  type: StepType;
  order: number;
  model: string;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum StepType {
  PREPROCESSING = 'preprocessing',
  FEATURE_EXTRACTION = 'feature_extraction',
  INFERENCE = 'inference',
  POSTPROCESSING = 'postprocessing',
  CUSTOM = 'custom'
}

export interface PipelineInput {
  type: InputType;
  format: string;
  sampleRate: number;
  channels: number;
  metadata: Map<string, any>;
}

export enum InputType {
  AUDIO_FILE = 'audio_file',
  AUDIO_STREAM = 'audio_stream',
  MICROPHONE = 'microphone',
  CUSTOM = 'custom'
}

export interface PipelineOutput {
  type: OutputType;
  format: string;
  confidence: boolean;
  timestamps: boolean;
  metadata: Map<string, any>;
}

export enum OutputType {
  TEXT = 'text',
  TRANSCRIPTION = 'transcription',
  SPEAKER_ID = 'speaker_id',
  LANGUAGE = 'language',
  COMMANDS = 'commands',
  CUSTOM = 'custom'
}

export interface PipelinePerformance {
  processingTime: number;
  throughput: number;
  accuracy: number;
  realTimeFactor: number;
  metadata: Map<string, any>;
}

export interface LanguageInfo {
  code: string;
  name: string;
  family: string;
  models: string[];
  acousticModels: string[];
  languageModels: string[];
  metadata: Map<string, any>;
}

export interface SpeechAnalytics {
  totalAudios: number;
  totalModels: number;
  totalPipelines: number;
  totalLanguages: number;
  averageProcessingTime: number;
  averageAccuracy: number;
  averageWordErrorRate: number;
  performance: PerformanceMetrics;
  lastUpdate: number;
  metadata: Map<string, any>;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  networkUsage: number;
  metadata: Map<string, any>;
}

export interface SpeechMetadata {
  author: string;
  version: string;
  tags: string[];
  description: string;
  customMetadata: Map<string, any>;
}

export interface SpeechStats {
  totalAudios: number;
  totalModels: number;
  totalPipelines: number;
  totalLanguages: number;
  averageProcessingTime: number;
  averageAccuracy: number;
  averageWordErrorRate: number;
  lastUpdate: number;
}

export class SpeechRecognitionManager {
  private config: SpeechRecognitionConfig;
  private recognitions: Map<string, SpeechRecognition> = new Map();
  private stats: SpeechStats = this.initializeStats();
  private isInitialized: boolean = false;
  private logger: StructuredLogger;
  private memoryId: string;

  constructor(config: Partial<SpeechRecognitionConfig> = {}) {
    this.config = {
      enableAudioPreprocessing: true,
      enableFeatureExtraction: true,
      enableSpeechToText: true,
      enableSpeakerIdentification: true,
      enableSpeakerVerification: true,
      enableLanguageDetection: true,
      enableLanguageAdaptation: true,
      enableRealTimeProcessing: true,
      enableStreaming: true,
      enableNoiseReduction: true,
      enableVoiceActivityDetection: true,
      enablePerformanceOptimization: true,
      maxAudios: 10000,
      maxModels: 1000,
      enableCloudSync: true,
      enableBackup: true,
      enableVersioning: true,
      ...config
  
    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {

        'SpeechRecognitionManager': LogLevel.DEBUG
      

      


      }
      };
    });

    // Register with memory manager
    this.memoryId = `SpeechRecognitionManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'SpeechRecognitionManager');
  };
  }

  /**
   * Initialize speech recognition manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize speech recognition manager
      await this.initializeSpeechRecognitionManager();
      
      // Load default speech recognitions
      await this.loadDefaultSpeechRecognitions();
      
      this.isInitialized = true;
      this.logger.info('SpeechRecognitionManager', 'Speech recognition manager initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('SpeechRecognitionManager', 'Failed to initialize speech recognition manager:', error);
      return false;
    }
  }

  /**
   * Create new speech recognition
   */
  createSpeechRecognition(recognition: Partial<SpeechRecognition>): SpeechRecognition | null {
    const newRecognition: SpeechRecognition = {
      id: `recognition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: recognition.name || 'New Speech Recognition',
      type: recognition.type || RecognitionType.SPEECH_TO_TEXT,
      status: RecognitionStatus.ACTIVE,
      audios: recognition.audios || [],
      models: recognition.models || [],
      pipelines: recognition.pipelines || [],
      languages: recognition.languages || [],
      analytics: recognition.analytics || this.createDefaultAnalytics(),
      metadata: recognition.metadata || this.createDefaultMetadata(),
      version: '1.0.0',
      created: Date.now(),
      modified: Date.now()
    };

    this.recognitions.set(newRecognition.id, newRecognition);
    this.updateStats('create_recognition', newRecognition);

    this.logger.info('SpeechRecognitionManager', `Created speech recognition: ${newRecognition.name}`);
    return newRecognition;
  }

  /**
   * Create audio data
   */
  createAudioData(recognitionId: string, audio: Partial<AudioData>): AudioData | null {
    const recognition = this.recognitions.get(recognitionId);
    if (!recognition) {
      this.logger.warn('SpeechRecognitionManager', `Speech recognition ${recognitionId} not found`);
      return null;
    }

    if (recognition.audios.length >= this.config.maxAudios) {
      this.logger.warn('SpeechRecognitionManager', 'Maximum number of audios reached');
      return null;
    }

    try {
      const newAudio: AudioData = {
        id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: audio.name || 'New Audio',
        type: audio.type || AudioType.WAV,
        status: AudioStatus.UPLOADED,
        data: audio.data || this.createDefaultAudioInfo(),
        preprocessing: audio.preprocessing || this.createDefaultAudioPreprocessing(),
        features: audio.features || this.createDefaultAudioFeatures(),
        transcription: audio.transcription || this.createDefaultTranscriptionData(),
        metadata: audio.metadata || new Map()
      };

      recognition.audios.push(newAudio);
      recognition.modified = Date.now();

      this.updateStats('create_audio', recognition);
      this.logger.info('SpeechRecognitionManager', `Created audio data: ${newAudio.name}`);
      return newAudio;
    } catch (error) {
      this.logger.error('SpeechRecognitionManager', `Failed to create audio data in speech recognition ${recognitionId}:`, error);
      return null;
    }
  }

  /**
   * Create speech model
   */
  createSpeechModel(recognitionId: string, model: Partial<SpeechModel>): SpeechModel | null {
    const recognition = this.recognitions.get(recognitionId);
    if (!recognition) {
      this.logger.warn('SpeechRecognitionManager', `Speech recognition ${recognitionId} not found`);
      return null;
    }

    if (recognition.models.length >= this.config.maxModels) {
      this.logger.warn('SpeechRecognitionManager', 'Maximum number of models reached');
      return null;
    }

    try {
      const newModel: SpeechModel = {
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: model.name || 'New Model',
        type: model.type || ModelType.ACOUSTIC,
        status: ModelStatus.TRAINING,
        architecture: model.architecture || this.createDefaultModelArchitecture(),
        training: model.training || this.createDefaultModelTraining(),
        performance: model.performance || this.createDefaultModelPerformance(),
        languages: model.languages || ['en'],
        metadata: model.metadata || new Map()
      };

      recognition.models.push(newModel);
      recognition.modified = Date.now();

      this.updateStats('create_model', recognition);
      this.logger.info('SpeechRecognitionManager', `Created speech model: ${newModel.name}`);
      return newModel;
    } catch (error) {
      this.logger.error('SpeechRecognitionManager', `Failed to create speech model in speech recognition ${recognitionId}:`, error);
      return null;
    }
  }

  /**
   * Get speech recognition
   */
  getSpeechRecognition(recognitionId: string): SpeechRecognition | null {
    return this.recognitions.get(recognitionId) || null;
  }

  /**
   * Get all speech recognitions
   */
  getSpeechRecognitions(): SpeechRecognition[] {
    return Array.from(this.recognitions.values());
  }

  /**
   * Get speech recognitions by type
   */
  getSpeechRecognitionsByType(type: RecognitionType): SpeechRecognition[] {
    return Array.from(this.recognitions.values())
      .filter(recognition => recognition.type === type);
  }

  /**
   * Get manager statistics
   */
  getManagerStats(): SpeechStats {
    return { ...this.stats };
  }

  /**
   * Initialize speech recognition manager
   */
  private async initializeSpeechRecognitionManager(): Promise<void> {
    this.logger.info('SpeechRecognitionManager', 'Initializing speech recognition manager...');
  }

  /**
   * Load default speech recognitions
   */
  private async loadDefaultSpeechRecognitions(): Promise<void> {
    // Load default speech recognitions
    const defaultRecognitions = [
      this.createDefaultSpeechToText(),
      this.createDefaultSpeakerIdentification(),
      this.createDefaultLanguageDetection()
    ];

    for (const recognition of defaultRecognitions) {
      if (recognition) {
        this.recognitions.set(recognition.id, recognition);
      }
    }

    this.logger.info('SpeechRecognitionManager', `Loaded ${defaultRecognitions.length} default speech recognitions`);
  }

  /**
   * Create default audio info
   */
  private createDefaultAudioInfo(): AudioInfo {
    return {
      duration: 0,
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
      format: 'wav',
      size: 0,
      metadata: new Map()
    };
  }

  /**
   * Create default audio preprocessing
   */
  private createDefaultAudioPreprocessing(): AudioPreprocessing {
    return {
      normalization: {
        enabled: true,
        method: NormalizationMethod.PEAK,
        targetLevel: -3.0,
        metadata: new Map()

      
      
      }
      },
      filtering: {

        enabled: true,
        highPass: {
        enabled: true,
        frequency: 80,
        order: 2,
        metadata: new Map()

      
      
      }
        },
        lowPass: {
        enabled: true,
        frequency: 8000,
        order: 2,
        metadata: new Map()

        
      
      }
        },
        bandPass: {

          enabled: false,
          lowFrequency: 300,
          highFrequency: 3400,
          order: 2,
          metadata: new Map()

        }
        },
        metadata: new Map()
      },
      noiseReduction: {
        enabled: true,
        algorithm: NoiseReductionAlgorithm.SPECTRAL_SUBTRACTION,
        parameters: new Map(),
        metadata: new Map()

      
      
      }
      },
      voiceActivityDetection: {
        enabled: true,
        algorithm: VADAlgorithm.ENERGY_BASED,
        threshold: 0.5,
        metadata: new Map()

      
      
      }
      },
      metadata: new Map()
    };
  }

  /**
   * Create default audio features
   */
  private createDefaultAudioFeatures(): AudioFeatures {
    return {
      mfcc: {
        coefficients: [],
        delta: [],
        deltaDelta: [],
        metadata: new Map()

      
      
      }
      },
      spectrogram: {
        magnitude: [],
        phase: [],
        melSpectrogram: [],
        metadata: new Map()

      
      
      }
      },
      pitch: {

        fundamental: [],
        harmonics: [],
        metadata: new Map()

      }
      },
      energy: {

        frameEnergy: [],
        spectralEnergy: [],
        metadata: new Map()

      }
      },
      metadata: new Map()
    };
  }

  /**
   * Create default transcription data
   */
  private createDefaultTranscriptionData(): TranscriptionData {
    return {
      text: '',
      confidence: 0,
      words: [],
      timestamps: [],
      language: 'en',
      metadata: new Map()
    };
  }

  /**
   * Create default model architecture
   */
  private createDefaultModelArchitecture(): ModelArchitecture {
    return {
      type: ArchitectureType.DEEP_NEURAL_NETWORK,
      layers: [],
      parameters: 0,
      vocabulary: 0,
      contextWindow: 0,
      metadata: new Map()
    };
  }

  /**
   * Create default model training
   */
  private createDefaultModelTraining(): ModelTraining {
    return {
      dataset: '',
      epochs: 10,
      batchSize: 32,
      learningRate: 0.001,
      optimizer: 'adam',
      loss: 'ctc',
      validationSplit: 0.2,
      metadata: new Map()
    };
  }

  /**
   * Create default model performance
   */
  private createDefaultModelPerformance(): ModelPerformance {
    return {
      accuracy: 0,
      wordErrorRate: 0,
      characterErrorRate: 0,
      realTimeFactor: 0,
      latency: 0,
      metadata: new Map()
    };
  }

  /**
   * Create default analytics
   */
  private createDefaultAnalytics(): SpeechAnalytics {
    return {
      totalAudios: 0,
      totalModels: 0,
      totalPipelines: 0,
      totalLanguages: 0,
      averageProcessingTime: 0,
      averageAccuracy: 0,
      averageWordErrorRate: 0,
      performance: {

        cpuUsage: 0,
        memoryUsage: 0,
        gpuUsage: 0,
        networkUsage: 0,
        metadata: new Map()

      }
      },
      lastUpdate: Date.now(),
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): SpeechMetadata {
    return {
      author: 'System',
      version: '1.0.0',
      tags: [],
      description: '',
      customMetadata: new Map()
    };
  }

  /**
   * Create default speech to text
   */
  private createDefaultSpeechToText(): SpeechRecognition {
    return this.createSpeechRecognition({
      name: 'Speech to Text',
      type: RecognitionType.SPEECH_TO_TEXT,
      description: 'Speech to text platform'
    });
  }

  /**
   * Create default speaker identification
   */
  private createDefaultSpeakerIdentification(): SpeechRecognition {
    return this.createSpeechRecognition({
      name: 'Speaker Identification',
      type: RecognitionType.SPEAKER_IDENTIFICATION,
      description: 'Speaker identification platform'
    });
  }

  /**
   * Create default language detection
   */
  private createDefaultLanguageDetection(): SpeechRecognition {
    return this.createSpeechRecognition({
      name: 'Language Detection',
      type: RecognitionType.LANGUAGE_DETECTION,
      description: 'Language detection platform'
    });
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, recognition: SpeechRecognition): void {
    switch (action) {
      case 'create_recognition':
        this.stats.totalAudios += recognition.audios.length;
        this.stats.totalModels += recognition.models.length;
        this.stats.totalPipelines += recognition.pipelines.length;
        this.stats.totalLanguages += recognition.languages.length;
        break;
      case 'create_audio':
        this.stats.totalAudios++;
        break;
      case 'create_model':
        this.stats.totalModels++;
        break;
    }

    this.stats.lastUpdate = Date.now();
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): SpeechStats {
    return {
      totalAudios: 0,
      totalModels: 0,
      totalPipelines: 0,
      totalLanguages: 0,
      averageProcessingTime: 0,
      averageAccuracy: 0,
      averageWordErrorRate: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.recognitions.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultSpeechRecognitionManager = new SpeechRecognitionManager();
export { SpeechRecognitionManager as default };