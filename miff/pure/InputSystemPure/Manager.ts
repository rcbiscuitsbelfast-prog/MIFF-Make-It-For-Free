/**
 * InputSystemPure Manager - Advanced Input Management System
 *
 * Comprehensive input system with:
 * - Multi-device input support (keyboard, mouse, gamepad, touch)
 * - Input mapping and customization
 * - Gesture recognition and handling
 * - Input buffering and queuing
 * - Accessibility features
 * - Input validation and filtering
 * - Real-time input processing
 * - Input analytics and monitoring
 *
 * @version 1.0.0
 * @author MIFF Framework

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';
 */

export interface InputSystemConfig {
  enableKeyboard: boolean;
  enableMouse: boolean;
  enableGamepad: boolean;
  enableTouch: boolean;
  enableGestureRecognition: boolean;
  enableInputMapping: boolean;
  enableInputBuffering: boolean;
  enableAccessibility: boolean;
  enableInputValidation: boolean;
  enableRealTimeProcessing: boolean;
  enableInputAnalytics: boolean;
  enableInputMonitoring: boolean;
  maxInputDevices: number;
  maxInputMappings: number;
  maxInputBuffer: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface InputSystem {
  id: string;
  name: string;
  type: InputSystemType;
  status: InputSystemStatus;
  devices: InputDevice[];
  mappings: InputMapping[];
  gestures: InputGesture[];
  buffer: InputBuffer;
  validation: InputValidation;
  accessibility: AccessibilityConfig;
  analytics: InputAnalytics;
  metadata: InputMetadata;
  version: string;
  created: number;
  modified: number;
}

export enum InputSystemType {
  GAME = 'game',
  APPLICATION = 'application',
  WEB = 'web',
  MOBILE = 'mobile',
  VR = 'vr',
  AR = 'ar',
  CUSTOM = 'custom'
}

export enum InputSystemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

export interface InputDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  capabilities: DeviceCapabilities;
  properties: DeviceProperties;
  statistics: DeviceStatistics;
  metadata: Map<string, any>;
}

export enum DeviceType {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  GAMEPAD = 'gamepad',
  TOUCH = 'touch',
  VR_CONTROLLER = 'vr_controller',
  AR_CONTROLLER = 'ar_controller',
  CUSTOM = 'custom'
}

export enum DeviceStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface DeviceCapabilities {
  buttons: number;
  axes: number;
  haptics: boolean;
  motion: boolean;
  touch: boolean;
  pressure: boolean;
  metadata: Map<string, any>;
}

export interface DeviceProperties {
  vendor: string;
  product: string;
  version: string;
  serial: string;
  metadata: Map<string, any>;
}

export interface DeviceStatistics {
  totalInputs: number;
  inputsPerSecond: number;
  averageLatency: number;
  errors: number;
  lastActivity: number;
  metadata: Map<string, any>;
}

export interface InputMapping {
  id: string;
  name: string;
  type: MappingType;
  source: InputSource;
  target: InputTarget;
  modifiers: InputModifier[];
  conditions: InputCondition[];
  enabled: boolean;
  metadata: Map<string, any>;
}

export enum MappingType {
  DIRECT = 'direct',
  COMBINATION = 'combination',
  SEQUENCE = 'sequence',
  GESTURE = 'gesture',
  CUSTOM = 'custom'
}

export interface InputSource {
  device: string;
  input: string;
  type: InputType;
  metadata: Map<string, any>;
}

export enum InputType {
  BUTTON = 'button',
  AXIS = 'axis',
  KEY = 'key',
  MOUSE_BUTTON = 'mouse_button',
  MOUSE_AXIS = 'mouse_axis',
  TOUCH = 'touch',
  GESTURE = 'gesture',
  CUSTOM = 'custom'
}

export interface InputTarget {
  action: string;
  value: any;
  metadata: Map<string, any>;
}

export interface InputModifier {
  type: ModifierType;
  value: any;
  metadata: Map<string, any>;
}

export enum ModifierType {
  SHIFT = 'shift',
  CTRL = 'ctrl',
  ALT = 'alt',
  META = 'meta',
  CUSTOM = 'custom'
}

export interface InputCondition {
  type: ConditionType;
  value: any;
  operator: ConditionOperator;
  metadata: Map<string, any>;
}

export enum ConditionType {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  CUSTOM = 'custom'
}

export enum ConditionOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not',
  CUSTOM = 'custom'
}

export interface InputGesture {
  id: string;
  name: string;
  type: GestureType;
  pattern: GesturePattern;
  recognition: GestureRecognition;
  action: GestureAction;
  enabled: boolean;
  metadata: Map<string, any>;
}

export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'double_tap',
  LONG_PRESS = 'long_press',
  SWIPE = 'swipe',
  PINCH = 'pinch',
  ROTATE = 'rotate',
  DRAG = 'drag',
  CUSTOM = 'custom'
}

export interface GesturePattern {
  points: GesturePoint[];
  duration: number;
  threshold: number;
  metadata: Map<string, any>;
}

export interface GesturePoint {
  x: number;
  y: number;
  timestamp: number;
  pressure: number;
  metadata: Map<string, any>;
}

export interface GestureRecognition {
  enabled: boolean;
  sensitivity: number;
  timeout: number;
  metadata: Map<string, any>;
}

export interface GestureAction {
  type: ActionType;
  value: any;
  metadata: Map<string, any>;
}

export enum ActionType {
  TRIGGER_EVENT = 'trigger_event',
  EXECUTE_SCRIPT = 'execute_script',
  SEND_MESSAGE = 'send_message',
  CUSTOM = 'custom'
}

export interface InputBuffer {
  enabled: boolean;
  maxSize: number;
  currentSize: number;
  inputs: InputEvent[];
  strategy: BufferStrategy;
  statistics: BufferStatistics;
  metadata: Map<string, any>;
}

export enum BufferStrategy {
  FIFO = 'fifo',
  LIFO = 'lifo',
  PRIORITY = 'priority',
  CUSTOM = 'custom'
}

export interface InputEvent {
  id: string;
  type: InputType;
  device: string;
  input: string;
  value: any;
  timestamp: number;
  duration: number;
  metadata: Map<string, any>;
}

export interface BufferStatistics {
  totalInputs: number;
  processedInputs: number;
  droppedInputs: number;
  averageLatency: number;
  lastUpdate: number;
  metadata: Map<string, any>;
}

export interface InputValidation {
  enabled: boolean;
  rules: ValidationRule[];
  filters: InputFilter[];
  metadata: Map<string, any>;
}

export interface ValidationRule {
  type: ValidationRuleType;
  condition: ValidationCondition;
  action: ValidationAction;
  metadata: Map<string, any>;
}

export enum ValidationRuleType {
  RATE_LIMIT = 'rate_limit',
  DEBOUNCE = 'debounce',
  THROTTLE = 'throttle',
  CUSTOM = 'custom'
}

export interface ValidationCondition {
  type: ConditionType;
  value: any;
  operator: ConditionOperator;
  metadata: Map<string, any>;
}

export interface ValidationAction {
  type: ActionType;
  value: any;
  metadata: Map<string, any>;
}

export interface InputFilter {
  type: FilterType;
  enabled: boolean;
  parameters: FilterParameters;
  metadata: Map<string, any>;
}

export enum FilterType {
  NOISE_REDUCTION = 'noise_reduction',
  SMOOTHING = 'smoothing',
  NORMALIZATION = 'normalization',
  CUSTOM = 'custom'
}

export interface FilterParameters {
  [key: string]: any;
}

export interface AccessibilityConfig {
  enabled: boolean;
  features: AccessibilityFeature[];
  settings: AccessibilitySettings;
  metadata: Map<string, any>;
}

export interface AccessibilityFeature {
  type: AccessibilityFeatureType;
  enabled: boolean;
  parameters: AccessibilityParameters;
  metadata: Map<string, any>;
}

export enum AccessibilityFeatureType {
  STICKY_KEYS = 'sticky_keys',
  SLOW_KEYS = 'slow_keys',
  BOUNCE_KEYS = 'bounce_keys',
  MOUSE_KEYS = 'mouse_keys',
  HIGH_CONTRAST = 'high_contrast',
  LARGE_TEXT = 'large_text',
  CUSTOM = 'custom'
}

export interface AccessibilityParameters {
  [key: string]: any;
}

export interface AccessibilitySettings {
  fontSize: number;
  contrast: number;
  brightness: number;
  volume: number;
  metadata: Map<string, any>;
}

export interface InputAnalytics {
  totalInputs: number;
  inputsPerSecond: number;
  averageLatency: number;
  deviceUsage: Map<string, number>;
  gestureUsage: Map<string, number>;
  errorRate: number;
  lastUpdate: number;
  metadata: Map<string, any>;
}

export interface InputMetadata {
  author: string;
  version: string;
  tags: string[];
  description: string;
  customMetadata: Map<string, any>;
}

export interface InputSystemStats {
  totalDevices: number;
  activeDevices: number;
  totalMappings: number;
  totalGestures: number;
  totalInputs: number;
  inputsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  lastUpdate: number;
}

export class InputSystemManager {
  private config: InputSystemConfig;
  private inputSystems: Map<string, InputSystem> = new Map();
  private stats: InputSystemStats = this.initializeStats();
  private isInitialized: boolean = false;
  private logger: StructuredLogger;
  private memoryId: string;

  constructor(config: Partial<InputSystemConfig> = {}) {
    this.config = {
      enableKeyboard: true,
      enableMouse: true,
      enableGamepad: true,
      enableTouch: true,
      enableGestureRecognition: true,
      enableInputMapping: true,
      enableInputBuffering: true,
      enableAccessibility: true,
      enableInputValidation: true,
      enableRealTimeProcessing: true,
      enableInputAnalytics: true,
      enableInputMonitoring: true,
      maxInputDevices: 10,
      maxInputMappings: 1000,
      maxInputBuffer: 10000,
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

        'InputSystemManager': LogLevel.DEBUG
      

      


      }
      };
    });

    // Register with memory manager
    this.memoryId = `InputSystemManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'InputSystemManager');
  };
  }

  /**
   * Initialize input system manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize input system manager
      await this.initializeInputSystemManager();
      
      // Load default input systems
      await this.loadDefaultInputSystems();
      
      this.isInitialized = true;
      this.logger.info('InputSystemManager', 'Input system manager initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('InputSystemManager', 'Failed to initialize input system manager:', error);
      return false;
    }
  }

  /**
   * Create new input system
   */
  createInputSystem(inputSystem: Partial<InputSystem>): InputSystem | null {
    const newInputSystem: InputSystem = {
      id: `input_system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: inputSystem.name || 'New Input System',
      type: inputSystem.type || InputSystemType.GAME,
      status: InputSystemStatus.ACTIVE,
      devices: inputSystem.devices || [],
      mappings: inputSystem.mappings || [],
      gestures: inputSystem.gestures || [],
      buffer: inputSystem.buffer || this.createDefaultBuffer(),
      validation: inputSystem.validation || this.createDefaultValidation(),
      accessibility: inputSystem.accessibility || this.createDefaultAccessibility(),
      analytics: inputSystem.analytics || this.createDefaultAnalytics(),
      metadata: inputSystem.metadata || this.createDefaultMetadata(),
      version: '1.0.0',
      created: Date.now(),
      modified: Date.now()
    };

    this.inputSystems.set(newInputSystem.id, newInputSystem);
    this.updateStats('create_input_system', newInputSystem);

    this.logger.info('InputSystemManager', `Created input system: ${newInputSystem.name}`);
    return newInputSystem;
  }

  /**
   * Add input device
   */
  addDevice(inputSystemId: string, device: InputDevice): boolean {
    const inputSystem = this.inputSystems.get(inputSystemId);
    if (!inputSystem) {
      this.logger.warn('InputSystemManager', `Input system ${inputSystemId} not found`);
      return false;
    }

    if (inputSystem.devices.length >= this.config.maxInputDevices) {
      this.logger.warn('InputSystemManager', 'Maximum number of input devices reached');
      return false;
    }

    try {
      inputSystem.devices.push(device);
      inputSystem.modified = Date.now();

      this.updateStats('add_device', inputSystem);
      this.logger.info('InputSystemManager', `Added input device: ${device.name}`);
      return true;
    } catch (error) {
      this.logger.error('InputSystemManager', `Failed to add device to input system ${inputSystemId}:`, error);
      return false;
    }
  }

  /**
   * Add input mapping
   */
  addMapping(inputSystemId: string, mapping: InputMapping): boolean {
    const inputSystem = this.inputSystems.get(inputSystemId);
    if (!inputSystem) {
      this.logger.warn('InputSystemManager', `Input system ${inputSystemId} not found`);
      return false;
    }

    if (inputSystem.mappings.length >= this.config.maxInputMappings) {
      this.logger.warn('InputSystemManager', 'Maximum number of input mappings reached');
      return false;
    }

    try {
      inputSystem.mappings.push(mapping);
      inputSystem.modified = Date.now();

      this.updateStats('add_mapping', inputSystem);
      this.logger.info('InputSystemManager', `Added input mapping: ${mapping.name}`);
      return true;
    } catch (error) {
      this.logger.error('InputSystemManager', `Failed to add mapping to input system ${inputSystemId}:`, error);
      return false;
    }
  }

  /**
   * Add input gesture
   */
  addGesture(inputSystemId: string, gesture: InputGesture): boolean {
    const inputSystem = this.inputSystems.get(inputSystemId);
    if (!inputSystem) {
      this.logger.warn('InputSystemManager', `Input system ${inputSystemId} not found`);
      return false;
    }

    try {
      inputSystem.gestures.push(gesture);
      inputSystem.modified = Date.now();

      this.updateStats('add_gesture', inputSystem);
      this.logger.info('InputSystemManager', `Added input gesture: ${gesture.name}`);
      return true;
    } catch (error) {
      this.logger.error('InputSystemManager', `Failed to add gesture to input system ${inputSystemId}:`, error);
      return false;
    }
  }

  /**
   * Process input event
   */
  processInputEvent(inputSystemId: string, event: InputEvent): boolean {
    const inputSystem = this.inputSystems.get(inputSystemId);
    if (!inputSystem) {
      this.logger.warn('InputSystemManager', `Input system ${inputSystemId} not found`);
      return false;
    }

    try {
      // Add to buffer if enabled
      if (inputSystem.buffer.enabled) {
        this.addToBuffer(inputSystem, event);
      }

      // Process input mapping
      this.processInputMapping(inputSystem, event);

      // Process gesture recognition
      if (this.config.enableGestureRecognition) {
        this.processGestureRecognition(inputSystem, event);
      }

      // Update analytics
      this.updateInputAnalytics(inputSystem, event);

      inputSystem.modified = Date.now();
      this.updateStats('process_input_event', inputSystem);
      
      this.logger.info('InputSystemManager', `Processed input event: ${event.type}`);
      return true;
    } catch (error) {
      this.logger.error('InputSystemManager', `Failed to process input event in system ${inputSystemId}:`, error);
      return false;
    }
  }

  /**
   * Get input system
   */
  getInputSystem(inputSystemId: string): InputSystem | null {
    return this.inputSystems.get(inputSystemId) || null;
  }

  /**
   * Get all input systems
   */
  getInputSystems(): InputSystem[] {
    return Array.from(this.inputSystems.values());
  }

  /**
   * Get input systems by type
   */
  getInputSystemsByType(type: InputSystemType): InputSystem[] {
    return Array.from(this.inputSystems.values())
      .filter(system => system.type === type);
  }

  /**
   * Get manager statistics
   */
  getManagerStats(): InputSystemStats {
    return { ...this.stats };
  }

  /**
   * Initialize input system manager
   */
  private async initializeInputSystemManager(): Promise<void> {
    this.logger.info('InputSystemManager', 'Initializing input system manager...');
  }

  /**
   * Load default input systems
   */
  private async loadDefaultInputSystems(): Promise<void> {
    // Load default input systems
    const defaultSystems = [
      this.createDefaultGameSystem(),
      this.createDefaultApplicationSystem(),
      this.createDefaultWebSystem()
    ];

    for (const system of defaultSystems) {
      if (system) {
        this.inputSystems.set(system.id, system);
      }
    }

    this.logger.info('InputSystemManager', `Loaded ${defaultSystems.length} default input systems`);
  }

  /**
   * Create default buffer
   */
  private createDefaultBuffer(): InputBuffer {
    return {
      enabled: true,
      maxSize: this.config.maxInputBuffer,
      currentSize: 0,
      inputs: [],
      strategy: BufferStrategy.FIFO,
      statistics: {

        totalInputs: 0,
        processedInputs: 0,
        droppedInputs: 0,
        averageLatency: 0,
        lastUpdate: Date.now(),
        metadata: new Map()

      }
      },
      metadata: new Map()
    };
  }

  /**
   * Create default validation
   */
  private createDefaultValidation(): InputValidation {
    return {
      enabled: true,
      rules: [
        {
          type: ValidationRuleType.RATE_LIMIT,
          condition: {
        type: ConditionType.GREATER_THAN,
        value: 1000,
        operator: ConditionOperator.AND,
        metadata: new Map()

          
      
      }
          },
          action: {

            type: ActionType.TRIGGER_EVENT,
            value: 'rate_limit_exceeded',
            metadata: new Map()

          }
          },
          metadata: new Map()
        }
      ],
      filters: [
        {
          type: FilterType.NOISE_REDUCTION,
          enabled: true,
          parameters: { threshold: 0.1 },
          metadata: new Map()
        }
      ],
      metadata: new Map()
    };
  }

  /**
   * Create default accessibility
   */
  private createDefaultAccessibility(): AccessibilityConfig {
    return {
      enabled: true,
      features: [
        {
          type: AccessibilityFeatureType.STICKY_KEYS,
          enabled: false,
          parameters: {

            timeout: 5000;

          }
    },
          metadata: new Map()
        },
        {
          type: AccessibilityFeatureType.SLOW_KEYS,
          enabled: false,
          parameters: {

            delay: 1000;

          }
    },
          metadata: new Map()
        }
      ],
      settings: {

        fontSize: 16,
        contrast: 1.0,
        brightness: 1.0,
        volume: 1.0,
        metadata: new Map()

      }
      },
      metadata: new Map()
    };
  }

  /**
   * Create default analytics
   */
  private createDefaultAnalytics(): InputAnalytics {
    return {
      totalInputs: 0,
      inputsPerSecond: 0,
      averageLatency: 0,
      deviceUsage: new Map(),
      gestureUsage: new Map(),
      errorRate: 0,
      lastUpdate: Date.now(),
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): InputMetadata {
    return {
      author: 'System',
      version: '1.0.0',
      tags: [],
      description: '',
      customMetadata: new Map()
    };
  }

  /**
   * Create default game system
   */
  private createDefaultGameSystem(): InputSystem {
    return this.createInputSystem({
      name: 'Game Input System',
      type: InputSystemType.GAME,
      description: 'Game input system for gameplay controls'
    });
  }

  /**
   * Create default application system
   */
  private createDefaultApplicationSystem(): InputSystem {
    return this.createInputSystem({
      name: 'Application Input System',
      type: InputSystemType.APPLICATION,
      description: 'Application input system for UI controls'
    });
  }

  /**
   * Create default web system
   */
  private createDefaultWebSystem(): InputSystem {
    return this.createInputSystem({
      name: 'Web Input System',
      type: InputSystemType.WEB,
      description: 'Web input system for browser controls'
    });
  }

  /**
   * Add to buffer
   */
  private addToBuffer(inputSystem: InputSystem, event: InputEvent): void {
    if (inputSystem.buffer.currentSize >= inputSystem.buffer.maxSize) {
      // Remove oldest event if buffer is full
      inputSystem.buffer.inputs.shift();
      inputSystem.buffer.currentSize--;
      inputSystem.buffer.statistics.droppedInputs++;
    }

    inputSystem.buffer.inputs.push(event);
    inputSystem.buffer.currentSize++;
    inputSystem.buffer.statistics.totalInputs++;
  }

  /**
   * Process input mapping
   */
  private processInputMapping(inputSystem: InputSystem, event: InputEvent): void {
    for (const mapping of inputSystem.mappings) {
      if (!mapping.enabled) continue;

      // Check if mapping matches the event
      if (this.mappingMatchesEvent(mapping, event)) {
        // Execute mapping action
        this.executeMappingAction(mapping, event);
      }
    }
  }

  /**
   * Check if mapping matches event
   */
  private mappingMatchesEvent(mapping: InputMapping, event: InputEvent): boolean {
    return mapping.source.device === event.device &&
           mapping.source.input === event.input &&
           mapping.source.type === event.type;
  }

  /**
   * Execute mapping action
   */
  private executeMappingAction(mapping: InputMapping, event: InputEvent): void {
    // This would execute the mapping action
    this.logger.info('InputSystemManager', `Executing mapping action: ${mapping.target.action}`);
  }

  /**
   * Process gesture recognition
   */
  private processGestureRecognition(inputSystem: InputSystem, event: InputEvent): void {
    for (const gesture of inputSystem.gestures) {
      if (!gesture.enabled) continue;

      // Check if gesture pattern matches
      if (this.gestureMatchesPattern(gesture, event)) {
        // Execute gesture action
        this.executeGestureAction(gesture, event);
      }
    }
  }

  /**
   * Check if gesture matches pattern
   */
  private gestureMatchesPattern(gesture: InputGesture, event: InputEvent): boolean {
    // This would implement gesture pattern matching
    return false;
  }

  /**
   * Execute gesture action
   */
  private executeGestureAction(gesture: InputGesture, event: InputEvent): void {
    // This would execute the gesture action
    this.logger.info('InputSystemManager', `Executing gesture action: ${gesture.action.type}`);
  }

  /**
   * Update input analytics
   */
  private updateInputAnalytics(inputSystem: InputSystem, event: InputEvent): void {
    inputSystem.analytics.totalInputs++;
    inputSystem.analytics.lastUpdate = Date.now();

    // Update device usage
    const deviceUsage = inputSystem.analytics.deviceUsage.get(event.device) || 0;
    inputSystem.analytics.deviceUsage.set(event.device, deviceUsage + 1);
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, inputSystem: InputSystem): void {
    switch (action) {
      case 'create_input_system':
        this.stats.totalDevices += inputSystem.devices.length;
        this.stats.totalMappings += inputSystem.mappings.length;
        this.stats.totalGestures += inputSystem.gestures.length;
        break;
      case 'add_device':
        this.stats.totalDevices++;
        break;
      case 'add_mapping':
        this.stats.totalMappings++;
        break;
      case 'add_gesture':
        this.stats.totalGestures++;
        break;
      case 'process_input_event':
        this.stats.totalInputs++;
        break;
    }

    this.stats.lastUpdate = Date.now();
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): InputSystemStats {
    return {
      totalDevices: 0,
      activeDevices: 0,
      totalMappings: 0,
      totalGestures: 0,
      totalInputs: 0,
      inputsPerSecond: 0,
      averageLatency: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.inputSystems.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultInputSystemManager = new InputSystemManager();
export { InputSystemManager as default };