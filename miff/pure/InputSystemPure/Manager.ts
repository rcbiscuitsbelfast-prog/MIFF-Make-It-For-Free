/**
 * InputSystemPure Manager
 * 
 * Advanced input system including input mapping, action binding,
 * input buffering, gesture recognition, and comprehensive input management.
 */

export interface InputEvent {
  id: string;
  type: 'key' | 'mouse' | 'touch' | 'gamepad' | 'gesture';
  code: string;
  value: number; // 0-1 for analog, 0/1 for digital
  timestamp: number;
  source: string;
  metadata?: Record<string, any>;
}

export interface InputAction {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultBindings: InputBinding[];
  modifiers: string[];
  priority: number;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface InputBinding {
  id: string;
  actionId: string;
  inputType: 'key' | 'mouse' | 'touch' | 'gamepad' | 'gesture';
  code: string;
  modifiers: string[];
  conditions: InputCondition[];
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface InputCondition {
  type: 'hold' | 'press' | 'release' | 'double' | 'long' | 'sequence';
  duration?: number;
  threshold?: number;
  sequence?: string[];
  metadata?: Record<string, any>;
}

export interface InputGesture {
  id: string;
  type: 'swipe' | 'pinch' | 'rotate' | 'tap' | 'hold' | 'drag';
  startPosition: { x: number; y: number };
  endPosition?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right' | 'diagonal';
  distance?: number;
  angle?: number;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface InputBuffer {
  id: string;
  events: InputEvent[];
  maxSize: number;
  maxAge: number;
  enabled: boolean;
}

export interface InputProfile {
  id: string;
  name: string;
  description: string;
  actions: Map<string, InputAction>;
  bindings: Map<string, InputBinding>;
  gestures: Map<string, InputGesture>;
  buffers: Map<string, InputBuffer>;
  settings: InputSettings;
  metadata?: Record<string, any>;
}

export interface InputSettings {
  sensitivity: number;
  deadzone: number;
  bufferTime: number;
  gestureThreshold: number;
  enableGestures: boolean;
  enableBuffering: boolean;
  enableModifiers: boolean;
}

export interface InputStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  actionsTriggered: number;
  gesturesRecognized: number;
  bufferUtilization: number;
  averageLatency: number;
  errorRate: number;
}

export interface InputFilter {
  type?: string;
  source?: string;
  minValue?: number;
  maxValue?: number;
  timeRange?: { start: number; end: number };
}

export interface InputOutput {
  op: string;
  status: 'ok' | 'error';
  result?: InputEvent | InputAction | InputBinding | InputGesture | InputProfile | InputStats | string;
  issues?: string[];
}

export class InputSystemManager {
  private profiles: Map<string, InputProfile> = new Map();
  private currentProfile: string | null = null;
  private eventHistory: InputEvent[] = [];
  private activeGestures: Map<string, InputGesture> = new Map();
  private stats: InputStats;
  private settings: InputSettings;

  constructor() {
    this.settings = {
      sensitivity: 1.0,
      deadzone: 0.1,
      bufferTime: 100,
      gestureThreshold: 50,
      enableGestures: true,
      enableBuffering: true,
      enableModifiers: true
    };

    this.stats = {
      totalEvents: 0,
      eventsByType: {},
      actionsTriggered: 0,
      gesturesRecognized: 0,
      bufferUtilization: 0,
      averageLatency: 0,
      errorRate: 0
    };

    this.loadDefaultProfile();
  }

  /**
   * Create a new input profile
   */
  createProfile(id: string, name: string, description: string = ''): InputOutput {
    if (this.profiles.has(id)) {
      return {
        op: 'create-profile',
        status: 'error',
        issues: [`Profile with ID ${id} already exists`]
      };
    }

    const profile: InputProfile = {
      id,
      name,
      description,
      actions: new Map(),
      bindings: new Map(),
      gestures: new Map(),
      buffers: new Map(),
      settings: { ...this.settings }
    };

    this.profiles.set(id, profile);
    return {
      op: 'create-profile',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Set active profile
   */
  setActiveProfile(id: string): InputOutput {
    if (!this.profiles.has(id)) {
      return {
        op: 'set-profile',
        status: 'error',
        issues: [`Profile with ID ${id} not found`]
      };
    }

    this.currentProfile = id;
    return {
      op: 'set-profile',
      status: 'ok',
      result: `Active profile set to ${id}`
    };
  }

  /**
   * Get active profile
   */
  getActiveProfile(): InputOutput {
    if (!this.currentProfile) {
      return {
        op: 'get-profile',
        status: 'error',
        issues: ['No active profile set']
      };
    }

    const profile = this.profiles.get(this.currentProfile);
    return {
      op: 'get-profile',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Add input action
   */
  addAction(action: InputAction): InputOutput {
    if (!this.currentProfile) {
      return {
        op: 'add-action',
        status: 'error',
        issues: ['No active profile set']
      };
    }

    const profile = this.profiles.get(this.currentProfile)!;
    profile.actions.set(action.id, action);
    
    return {
      op: 'add-action',
      status: 'ok',
      result: action
    };
  }

  /**
   * Add input binding
   */
  addBinding(binding: InputBinding): InputOutput {
    if (!this.currentProfile) {
      return {
        op: 'add-binding',
        status: 'error',
        issues: ['No active profile set']
      };
    }

    const profile = this.profiles.get(this.currentProfile)!;
    profile.bindings.set(binding.id, binding);
    
    return {
      op: 'add-binding',
      status: 'ok',
      result: binding
    };
  }

  /**
   * Process input event
   */
  processInputEvent(event: InputEvent): InputOutput {
    if (!this.currentProfile) {
      return {
        op: 'process-event',
        status: 'error',
        issues: ['No active profile set']
      };
    }

    const profile = this.profiles.get(this.currentProfile)!;
    
    // Update stats
    this.stats.totalEvents++;
    this.stats.eventsByType[event.type] = (this.stats.eventsByType[event.type] || 0) + 1;

    // Add to event history
    this.eventHistory.push(event);
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    // Find matching bindings
    const matchingBindings = this.findMatchingBindings(event, profile);
    
    // Process actions
    const triggeredActions: string[] = [];
    for (const binding of matchingBindings) {
      const action = profile.actions.get(binding.actionId);
      if (action && action.enabled) {
        triggeredActions.push(action.id);
        this.stats.actionsTriggered++;
      }
    }

    // Process gestures
    if (this.settings.enableGestures) {
      this.processGestures(event);
    }

    // Process buffering
    if (this.settings.enableBuffering) {
      this.processBuffering(event);
    }

    return {
      op: 'process-event',
      status: 'ok',
      result: {
        event,
        triggeredActions,
        gestures: Array.from(this.activeGestures.values())
      }
    };
  }

  /**
   * Recognize gesture
   */
  recognizeGesture(gesture: InputGesture): InputOutput {
    if (!this.currentProfile) {
      return {
        op: 'recognize-gesture',
        status: 'error',
        issues: ['No active profile set']
      };
    }

    const profile = this.profiles.get(this.currentProfile)!;
    
    // Check if gesture meets threshold
    if (gesture.distance && gesture.distance < this.settings.gestureThreshold) {
      return {
        op: 'recognize-gesture',
        status: 'ok',
        result: { gesture, recognized: false, reason: 'Below threshold' }
      };
    }

    // Store gesture
    this.activeGestures.set(gesture.id, gesture);
    profile.gestures.set(gesture.id, gesture);
    
    this.stats.gesturesRecognized++;

    return {
      op: 'recognize-gesture',
      status: 'ok',
      result: { gesture, recognized: true }
    };
  }

  /**
   * Get input statistics
   */
  getInputStats(): InputOutput {
    return {
      op: 'stats',
      status: 'ok',
      result: { ...this.stats }
    };
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100): InputOutput {
    const events = this.eventHistory.slice(-limit);
    return {
      op: 'recent-events',
      status: 'ok',
      result: events
    };
  }

  /**
   * Clear event history
   */
  clearHistory(): InputOutput {
    this.eventHistory = [];
    return {
      op: 'clear-history',
      status: 'ok',
      result: 'Event history cleared'
    };
  }

  /**
   * Export input data
   */
  exportInput(format: 'json' | 'manifest' | 'summary' | 'events' = 'json'): InputOutput {
    const activeProfile = this.currentProfile ? this.profiles.get(this.currentProfile) : null;

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: {
            profiles: Array.from(this.profiles.values()),
            activeProfile,
            events: this.eventHistory.slice(-100),
            stats: this.stats
          }
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.input.export.v1',
            profiles: Array.from(this.profiles.values()),
            activeProfile,
            exportedAt: Date.now().toISOString(),
            total: this.profiles.size
          }
        };
      
      case 'summary':
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: this.stats,
            activeProfile: activeProfile ? {
              id: activeProfile.id,
              name: activeProfile.name,
              actions: activeProfile.actions.size,
              bindings: activeProfile.bindings.size,
              gestures: activeProfile.gestures.size
            } : null
          }
        };
      
      case 'events':
        return {
          op: 'export',
          status: 'ok',
          result: {
            events: this.eventHistory,
            total: this.eventHistory.length
          }
        };
      
      default:
        return {
          op: 'export',
          status: 'error',
          issues: [`Unknown export format: ${format}`]
        };
    }
  }

  /**
   * Reset input system
   */
  resetInput(): InputOutput {
    this.profiles.clear();
    this.currentProfile = null;
    this.eventHistory = [];
    this.activeGestures.clear();
    this.stats = {
      totalEvents: 0,
      eventsByType: {},
      actionsTriggered: 0,
      gesturesRecognized: 0,
      bufferUtilization: 0,
      averageLatency: 0,
      errorRate: 0
    };
    // Do not auto-load a default profile here to allow tests to verify
    // behavior when no active profile is set.
    
    return {
      op: 'reset',
      status: 'ok',
      result: 'Input system reset'
    };
  }

  /**
   * Private helper methods
   */
  private loadDefaultProfile(): void {
    const defaultProfile = this.createProfile('default', 'Default Profile', 'Default input profile');
    if (defaultProfile.status === 'ok') {
      this.setActiveProfile('default');
      
      // Add default actions
      const defaultActions: InputAction[] = [
        {
          id: 'move_forward',
          name: 'Move Forward',
          description: 'Move character forward',
          category: 'movement',
          defaultBindings: [],
          modifiers: [],
          priority: 1,
          enabled: true
        },
        {
          id: 'move_backward',
          name: 'Move Backward',
          description: 'Move character backward',
          category: 'movement',
          defaultBindings: [],
          modifiers: [],
          priority: 1,
          enabled: true
        },
        {
          id: 'jump',
          name: 'Jump',
          description: 'Jump action',
          category: 'action',
          defaultBindings: [],
          modifiers: [],
          priority: 2,
          enabled: true
        },
        {
          id: 'attack',
          name: 'Attack',
          description: 'Attack action',
          category: 'combat',
          defaultBindings: [],
          modifiers: [],
          priority: 3,
          enabled: true
        }
      ];

      defaultActions.forEach((action: any) => this.addAction(action));
    }
  }

  private findMatchingBindings(event: InputEvent, profile: InputProfile): InputBinding[] {
    const matching: InputBinding[] = [];
    
    for (const binding of profile.bindings.values()) {
      if (binding.enabled && binding.inputType === event.type && binding.code === event.code) {
        // Check modifiers
        if (this.settings.enableModifiers && binding.modifiers.length > 0) {
          // Simplified modifier check - would need more complex logic in real implementation
          continue;
        }
        
        // Check conditions
        if (this.checkConditions(event, binding.conditions)) {
          matching.push(binding);
        }
      }
    }
    
    return matching;
  }

  private checkConditions(event: InputEvent, conditions: InputCondition[]): boolean {
    for (const condition of conditions) {
      switch (condition.type) {
        case 'press':
          return event.value > 0;
        case 'release':
          return event.value === 0;
        case 'hold':
          return event.value > 0 && condition.duration ? true : false; // Simplified
        case 'double':
          // Would need to track previous events for double-tap detection
          return false;
        case 'long':
          return event.value > 0 && condition.duration ? true : false; // Simplified
        case 'sequence':
          // Would need to track input sequences
          return false;
        default:
          return true;
      }
    }
    return true;
  }

  private processGestures(event: InputEvent): void {
    // Simplified gesture processing
    if (event.type === 'touch' && event.value > 0) {
      const gesture: InputGesture = {
        id: `gesture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'tap',
        startPosition: { x: 0, y: 0 }, // Would need actual position data
        duration: 0,
        timestamp: event.timestamp
      };
      
      this.recognizeGesture(gesture);
    }
  }

  private processBuffering(event: InputEvent): void {
    // Simplified buffering - would need more complex logic for real implementation
    if (this.eventHistory.length > 0) {
      const lastEvent = this.eventHistory[this.eventHistory.length - 1];
      const timeDiff = event.timestamp - lastEvent.timestamp;
      
      if (timeDiff < this.settings.bufferTime) {
        // Event is within buffer time
        this.stats.bufferUtilization++;
      }
    }
  }
}