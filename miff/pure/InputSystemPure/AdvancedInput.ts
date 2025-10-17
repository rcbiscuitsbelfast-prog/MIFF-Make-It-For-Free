/**
 * Advanced Input System
 * 
 * Enhanced input handling with gesture recognition,
 * haptic feedback, and advanced input mapping.
 */

import { InputSystemPure } from './index';

export interface InputGesture {
  id: string;
  name: string;
  type: 'tap' | 'double_tap' | 'long_press' | 'swipe' | 'pinch' | 'rotate' | 'custom';
  pattern: GesturePattern;
  threshold: GestureThreshold;
  callback: (gesture: InputGesture, data: GestureData) => void;
  enabled: boolean;
}

export interface GesturePattern {
  type: 'sequence' | 'simultaneous' | 'timed' | 'custom';
  inputs: InputSequence[];
  timeWindow?: number;
  customCheck?: (inputs: InputData[]) => boolean;
}

export interface InputSequence {
  type: 'key' | 'mouse' | 'touch' | 'gamepad' | 'custom';
  value: any;
  duration?: number;
  position?: { x: number; y: number };
  pressure?: number;
  direction?: { x: number; y: number };
}

export interface GestureThreshold {
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
  minPressure?: number;
  maxPressure?: number;
  tolerance?: number;
}

export interface GestureData {
  gesture: InputGesture;
  inputs: InputData[];
  startTime: number;
  endTime: number;
  duration: number;
  distance?: number;
  velocity?: { x: number; y: number };
  acceleration?: { x: number; y: number };
  metadata?: any;
}

export interface InputData {
  type: 'key' | 'mouse' | 'touch' | 'gamepad' | 'custom';
  value: any;
  position: { x: number; y: number };
  pressure: number;
  timestamp: number;
  duration: number;
  metadata?: any;
}

export interface HapticFeedback {
  id: string;
  name: string;
  type: 'impact' | 'notification' | 'selection' | 'custom';
  intensity: number;
  duration: number;
  pattern: HapticPattern;
  enabled: boolean;
}

export interface HapticPattern {
  type: 'single' | 'double' | 'triple' | 'continuous' | 'custom';
  intervals: number[];
  intensities: number[];
  customPattern?: (time: number) => number;
}

export interface InputMapping {
  id: string;
  name: string;
  input: InputSequence;
  action: string;
  context: string;
  priority: number;
  enabled: boolean;
  conditions: InputCondition[];
}

export interface InputCondition {
  type: 'key_state' | 'mouse_position' | 'touch_count' | 'gamepad_axis' | 'custom';
  value: any;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal';
  check: (context: InputContext) => boolean;
}

export interface InputContext {
  currentInputs: InputData[];
  previousInputs: InputData[];
  mousePosition: { x: number; y: number };
  gamepadState: GamepadState;
  timestamp: number;
  metadata?: any;
}

export interface GamepadState {
  connected: boolean;
  buttons: boolean[];
  axes: number[];
  id: string;
  index: number;
}

export interface InputProfile {
  id: string;
  name: string;
  mappings: InputMapping[];
  gestures: InputGesture[];
  haptics: HapticFeedback[];
  sensitivity: InputSensitivity;
  enabled: boolean;
}

export interface InputSensitivity {
  mouse: number;
  touch: number;
  gamepad: number;
  gesture: number;
}

export class AdvancedInput {
  private gestures: Map<string, InputGesture> = new Map();
  private hapticFeedbacks: Map<string, HapticFeedback> = new Map();
  private inputMappings: Map<string, InputMapping> = new Map();
  private inputProfiles: Map<string, InputProfile> = new Map();
  private activeProfile: string | null = null;
  private inputHistory: InputData[] = [];
  private maxHistorySize: number = 100;
  private gestureRecognition: GestureRecognition;
  private hapticManager: HapticManager;

  constructor() {
    this.gestureRecognition = new GestureRecognition(this);
    this.hapticManager = new HapticManager();
    this.initializeDefaultGestures();
    this.initializeDefaultHaptics();
    this.initializeDefaultMappings();
    this.initializeDefaultProfiles();
  }

  /**
   * Create a gesture
   */
  createGesture(gesture: InputGesture): void {
    this.gestures.set(gesture.id, gesture);
    this.gestureRecognition.registerGesture(gesture);
  }

  /**
   * Update gesture
   */
  updateGesture(gestureId: string, properties: Partial<InputGesture>): void {
    const gesture = this.gestures.get(gestureId);
    if (gesture) {
      Object.assign(gesture, properties);
      this.gestureRecognition.updateGesture(gesture);
    }
  }

  /**
   * Remove gesture
   */
  removeGesture(gestureId: string): void {
    this.gestures.delete(gestureId);
    this.gestureRecognition.unregisterGesture(gestureId);
  }

  /**
   * Create haptic feedback
   */
  createHapticFeedback(haptic: HapticFeedback): void {
    this.hapticFeedbacks.set(haptic.id, haptic);
  }

  /**
   * Trigger haptic feedback
   */
  triggerHapticFeedback(hapticId: string): void {
    const haptic = this.hapticFeedbacks.get(hapticId);
    if (haptic && haptic.enabled) {
      this.hapticManager.trigger(haptic);
    }
  }

  /**
   * Create input mapping
   */
  createInputMapping(mapping: InputMapping): void {
    this.inputMappings.set(mapping.id, mapping);
  }

  /**
   * Update input mapping
   */
  updateInputMapping(mappingId: string, properties: Partial<InputMapping>): void {
    const mapping = this.inputMappings.get(mappingId);
    if (mapping) {
      Object.assign(mapping, properties);
    }
  }

  /**
   * Remove input mapping
   */
  removeInputMapping(mappingId: string): void {
    this.inputMappings.delete(mappingId);
  }

  /**
   * Create input profile
   */
  createInputProfile(profile: InputProfile): void {
    this.inputProfiles.set(profile.id, profile);
  }

  /**
   * Set active input profile
   */
  setActiveProfile(profileId: string): void {
    if (this.inputProfiles.has(profileId)) {
      this.activeProfile = profileId;
    }
  }

  /**
   * Process input data
   */
  processInput(input: InputData): void {
    // Add to input history
    this.inputHistory.push(input);
    if (this.inputHistory.length > this.maxHistorySize) {
      this.inputHistory.shift();
    }

    // Process gestures
    this.gestureRecognition.processInput(input);

    // Process input mappings
    this.processInputMappings(input);

    // Process haptic feedback
    this.processHapticTriggers(input);
  }

  /**
   * Process input mappings
   */
  private processInputMappings(input: InputData): void {
    if (!this.activeProfile) return;

    const profile = this.inputProfiles.get(this.activeProfile);
    if (!profile) return;

    for (const mapping of profile.mappings) {
      if (!mapping.enabled) continue;

      // Check if input matches mapping
      if (this.matchesInputMapping(input, mapping)) {
        // Check conditions
        if (this.checkInputConditions(mapping, input)) {
          // Execute action
          this.executeInputAction(mapping.action, input);
        }
      }
    }
  }

  /**
   * Check if input matches mapping
   */
  private matchesInputMapping(input: InputData, mapping: InputMapping): boolean {
    const sequence = mapping.input;
    
    if (input.type !== sequence.type) return false;
    if (input.value !== sequence.value) return false;
    
    if (sequence.position && input.position) {
      const distance = Math.sqrt(
        Math.pow(input.position.x - sequence.position.x, 2) +
        Math.pow(input.position.y - sequence.position.y, 2)
      );
      if (distance > 10) return false; // 10 pixel tolerance
    }
    
    if (sequence.pressure && Math.abs(input.pressure - sequence.pressure) > 0.1) return false;
    
    return true;
  }

  /**
   * Check input conditions
   */
  private checkInputConditions(mapping: InputMapping, input: InputData): boolean {
    const context: InputContext = {
      currentInputs: [input!],
      previousInputs: this.inputHistory.slice(-5),
      mousePosition: input.position,
      gamepadState: this.getGamepadState(),
      timestamp: input.timestamp
    };

    return mapping.conditions.every(condition => condition.check(context));
  }

  /**
   * Execute input action
   */
  private executeInputAction(action: string, input: InputData): void {
    console.log(`Executing action: ${action} for input:`, input);
    
    // In a real implementation, this would dispatch events or call callbacks
    // For now, we'll just log the action
  }

  /**
   * Process haptic triggers
   */
  private processHapticTriggers(input: InputData): void {
    if (!this.activeProfile) return;

    const profile = this.inputProfiles.get(this.activeProfile);
    if (!profile) return;

    for (const haptic of profile.haptics) {
      if (!haptic.enabled) continue;

      // Check if input should trigger haptic feedback
      if (this.shouldTriggerHaptic(input, haptic)) {
        this.triggerHapticFeedback(haptic.id);
      }
    }
  }

  /**
   * Check if input should trigger haptic feedback
   */
  private shouldTriggerHaptic(input: InputData, haptic: HapticFeedback): boolean {
    // Simple implementation - trigger on certain input types
    switch (haptic.type) {
      case 'impact':
        return input.type === 'touch' && input.pressure > 0.5;
      case 'notification':
        return input.type === 'key' && input.value === 'Enter';
      case 'selection':
        return input.type === 'mouse' && input.value === 'click';
      default:
        return false;
    }
  }

  /**
   * Get gamepad state
   */
  private getGamepadState(): GamepadState {
    // In a real implementation, this would get actual gamepad state
    return {
      connected: false,
      buttons: [],
      axes: [],
      id: '',
      index: -1
    };
  }

  /**
   * Initialize default gestures
   */
  private initializeDefaultGestures(): void {
    // Tap gesture
    this.createGesture({
      id: 'tap',
      name: 'Tap',
      type: 'tap',
      pattern: {
        type: 'sequence',
        inputs: [{
          type: 'touch',
          value: 'down',
          duration: 100
        }, {
          type: 'touch',
          value: 'up',
          duration: 100
        }],
        timeWindow: 200
      },
      threshold: {
        maxDuration: 200,
        tolerance: 50
      },
      callback: (gesture, data) => {
        console.log('Tap gesture detected:', data);
      },
      enabled: true
    });

    // Swipe gesture
    this.createGesture({
      id: 'swipe',
      name: 'Swipe',
      type: 'swipe',
      pattern: {
        type: 'sequence',
        inputs: [{
          type: 'touch',
          value: 'down',
          duration: 50
        }, {
          type: 'touch',
          value: 'move',
          duration: 100
        }, {
          type: 'touch',
          value: 'up',
          duration: 50
        }],
        timeWindow: 300
      },
      threshold: {
        minDistance: 50,
        maxDuration: 300,
        tolerance: 20
      },
      callback: (gesture, data) => {
        console.log('Swipe gesture detected:', data);
      },
      enabled: true
    });
  }

  /**
   * Initialize default haptic feedbacks
   */
  private initializeDefaultHaptics(): void {
    // Impact haptic
    this.createHapticFeedback({
      id: 'impact_light',
      name: 'Light Impact',
      type: 'impact',
      intensity: 0.3,
      duration: 100,
      pattern: {
        type: 'single',
        intervals: [0!],
        intensities: [0.3]
      },
      enabled: true
    });

    // Notification haptic
    this.createHapticFeedback({
      id: 'notification',
      name: 'Notification',
      type: 'notification',
      intensity: 0.5,
      duration: 200,
      pattern: {
        type: 'double',
        intervals: [0, 100],
        intensities: [0.5, 0.3]
      },
      enabled: true
    });
  }

  /**
   * Initialize default input mappings
   */
  private initializeDefaultMappings(): void {
    // WASD movement
    this.createInputMapping({
      id: 'move_forward',
      name: 'Move Forward',
      input: {
        type: 'key',
        value: 'w'
      },
      action: 'move_forward',
      context: 'gameplay',
      priority: 1,
      enabled: true,
      conditions: []
    });

    // Mouse click
    this.createInputMapping({
      id: 'mouse_click',
      name: 'Mouse Click',
      input: {
        type: 'mouse',
        value: 'click'
      },
      action: 'select',
      context: 'ui',
      priority: 1,
      enabled: true,
      conditions: []
    });
  }

  /**
   * Initialize default input profiles
   */
  private initializeDefaultProfiles(): void {
    // Default profile
    this.createInputProfile({
      id: 'default',
      name: 'Default Profile',
      mappings: Array.from(this.inputMappings.values()),
      gestures: Array.from(this.gestures.values()),
      haptics: Array.from(this.hapticFeedbacks.values()),
      sensitivity: {
        mouse: 1.0,
        touch: 1.0,
        gamepad: 1.0,
        gesture: 1.0
      },
      enabled: true
    });

    this.setActiveProfile('default');
  }

  /**
   * Get gesture
   */
  getGesture(gestureId: string): InputGesture | null {
    return this.gestures.get(gestureId) || null;
  }

  /**
   * Get all gestures
   */
  getAllGestures(): InputGesture[] {
    return Array.from(this.gestures.values());
  }

  /**
   * Get haptic feedback
   */
  getHapticFeedback(hapticId: string): HapticFeedback | null {
    return this.hapticFeedbacks.get(hapticId) || null;
  }

  /**
   * Get input mapping
   */
  getInputMapping(mappingId: string): InputMapping | null {
    return this.inputMappings.get(mappingId) || null;
  }

  /**
   * Get input profile
   */
  getInputProfile(profileId: string): InputProfile | null {
    return this.inputProfiles.get(profileId) || null;
  }

  /**
   * Get active profile
   */
  getActiveProfile(): InputProfile | null {
    return this.activeProfile ? this.inputProfiles.get(this.activeProfile) || null : null;
  }

  /**
   * Get input history
   */
  getInputHistory(): InputData[] {
    return [...this.inputHistory];
  }

  /**
   * Get advanced input statistics
   */
  getAdvancedInputStatistics(): any {
    return {
      gestures: this.gestures.size,
      hapticFeedbacks: this.hapticFeedbacks.size,
      inputMappings: this.inputMappings.size,
      inputProfiles: this.inputProfiles.size,
      activeProfile: this.activeProfile,
      inputHistorySize: this.inputHistory.length,
      maxHistorySize: this.maxHistorySize
    };
  }
}

/**
 * Gesture Recognition Engine
 */
class GestureRecognition {
  private gestures: Map<string, InputGesture> = new Map();
  private activeGestures: Map<string, GestureState> = new Map();
  private inputBuffer: InputData[] = [];
  private maxBufferSize: number = 50;

  constructor(private advancedInput: AdvancedInput) {}

  registerGesture(gesture: InputGesture): void {
    this.gestures.set(gesture.id, gesture);
  }

  updateGesture(gesture: InputGesture): void {
    this.gestures.set(gesture.id, gesture);
  }

  unregisterGesture(gestureId: string): void {
    this.gestures.delete(gestureId);
    this.activeGestures.delete(gestureId);
  }

  processInput(input: InputData): void {
    // Add to input buffer
    this.inputBuffer.push(input);
    if (this.inputBuffer.length > this.maxBufferSize) {
      this.inputBuffer.shift();
    }

    // Check all gestures
    for (const [gestureId, gesture] of this.gestures) {
      if (!gesture.enabled) continue;

      const state = this.activeGestures.get(gestureId) || {
        gestureId,
        startTime: input.timestamp,
        inputs: [],
        currentStep: 0
      };

      if (this.checkGestureStep(gesture, state, input)) {
        state.inputs.push(input);
        state.currentStep++;

        if (this.isGestureComplete(gesture, state)) {
          this.completeGesture(gesture, state);
        } else {
          this.activeGestures.set(gestureId, state);
        }
      } else {
        // Reset gesture if step doesn't match
        this.activeGestures.delete(gestureId);
      }
    }
  }

  private checkGestureStep(gesture: InputGesture, state: GestureState, input: InputData): boolean {
    const pattern = gesture.pattern;
    const currentStep = state.currentStep;

    if (currentStep >= pattern.inputs.length) return false;

    const expectedInput = pattern.inputs[currentStep!];
    
    // Check input type
    if (input.type !== expectedInput.type) return false;
    
    // Check input value
    if (input.value !== expectedInput.value) return false;
    
    // Check duration if specified
    if (expectedInput.duration) {
      const duration = input.timestamp - state.startTime;
      if (Math.abs(duration - expectedInput.duration) > gesture.threshold.tolerance) return false;
    }
    
    // Check position if specified
    if (expectedInput.position && input.position) {
      const distance = Math.sqrt(
        Math.pow(input.position.x - expectedInput.position.x, 2) +
        Math.pow(input.position.y - expectedInput.position.y, 2)
      );
      if (distance > (gesture.threshold.tolerance || 10)) return false;
    }
    
    // Check pressure if specified
    if (expectedInput.pressure && Math.abs(input.pressure - expectedInput.pressure) > 0.1) return false;
    
    return true;
  }

  private isGestureComplete(gesture: InputGesture, state: GestureState): boolean {
    return state.currentStep >= gesture.pattern.inputs.length;
  }

  private completeGesture(gesture: InputGesture, state: GestureState): void {
    const gestureData: GestureData = {
      gesture,
      inputs: state.inputs,
      startTime: state.startTime,
      endTime: state.inputs[state.inputs.length - 1].timestamp,
      duration: state.inputs[state.inputs.length - 1].timestamp - state.startTime,
      metadata: {}
    };

    // Calculate additional gesture data
    if (gesture.type === 'swipe' && state.inputs.length >= 2) {
      const start = state.inputs[0!].position;
      const end = state.inputs[state.inputs.length - 1].position;
      
      gestureData.distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      gestureData.velocity = {
        x: (end.x - start.x) / gestureData.duration,
        y: (end.y - start.y) / gestureData.duration
      };
    }

    // Execute gesture callback
    gesture.callback(gesture, gestureData);

    // Remove from active gestures
    this.activeGestures.delete(gesture.id);
  }
}

interface GestureState {
  gestureId: string;
  startTime: number;
  inputs: InputData[];
  currentStep: number;
}

/**
 * Haptic Feedback Manager
 */
class HapticManager {
  private activeHaptics: Map<string, HapticState> = new Map();

  trigger(haptic: HapticFeedback): void {
    if (!haptic.enabled) return;

    const state: HapticState = {
      hapticId: haptic.id,
      startTime: new Date(),
      currentStep: 0,
      pattern: haptic.pattern,
      intensity: haptic.intensity,
      duration: haptic.duration
    };

    this.activeHaptics.set(haptic.id, state);
    this.executeHapticPattern(state);
  }

  private executeHapticPattern(state: HapticState): void {
    const pattern = state.pattern;
    
    switch (pattern.type) {
      case 'single':
        this.executeSingleHaptic(state);
        break;
      case 'double':
        this.executeDoubleHaptic(state);
        break;
      case 'triple':
        this.executeTripleHaptic(state);
        break;
      case 'continuous':
        this.executeContinuousHaptic(state);
        break;
      case 'custom':
        this.executeCustomHaptic(state);
        break;
    }
  }

  private executeSingleHaptic(state: HapticState): void {
    console.log(`Executing single haptic: intensity=${state.intensity}, duration=${state.duration}`);
    // In a real implementation, this would trigger actual haptic feedback
  }

  private executeDoubleHaptic(state: HapticState): void {
    console.log(`Executing double haptic: intensity=${state.intensity}, duration=${state.duration}`);
    // In a real implementation, this would trigger actual haptic feedback
  }

  private executeTripleHaptic(state: HapticState): void {
    console.log(`Executing triple haptic: intensity=${state.intensity}, duration=${state.duration}`);
    // In a real implementation, this would trigger actual haptic feedback
  }

  private executeContinuousHaptic(state: HapticState): void {
    console.log(`Executing continuous haptic: intensity=${state.intensity}, duration=${state.duration}`);
    // In a real implementation, this would trigger actual haptic feedback
  }

  private executeCustomHaptic(state: HapticState): void {
    console.log(`Executing custom haptic: intensity=${state.intensity}, duration=${state.duration}`);
    // In a real implementation, this would trigger actual haptic feedback
  }
}

interface HapticState {
  hapticId: string;
  startTime: number;
  currentStep: number;
  pattern: HapticPattern;
  intensity: number;
  duration: number;
}