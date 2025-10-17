// UnrealEventSyncPure - MIFF to Unreal event synchronization system
// Schema Version: v1.0

import { UnrealBridgeManager, UnrealActorBridge, UnrealComponentBridge, UnrealEvent, UnrealMessage } from './index';
import { CombatUtils, SpiritInstance } from '../CombatPure/engine';
import { ItemUsageManager, Item } from '../ItemsPure';
import { BattleAI, AIPolicy } from '../AIPure/Manager';

export enum EventSyncMode {
  UNIDIRECTIONAL = 'unidirectional',     // MIFF → Unreal only
  BIDIRECTIONAL = 'bidirectional',       // MIFF ↔ Unreal
  BROADCAST = 'broadcast',               // MIFF broadcasts to all Unreal instances
  TARGETED = 'targeted',                 // MIFF targets specific Unreal objects
  FILTERED = 'filtered',                 // MIFF events filtered by type/priority
  PRIORITIZED = 'prioritized',           // MIFF events prioritized by importance
  BATCHED = 'batched',                   // MIFF events batched for performance
  REAL_TIME = 'real_time',               // MIFF events synced in real-time
  DEFERRED = 'deferred',                 // MIFF events deferred until safe
  ASYNC = 'async',                       // MIFF events processed asynchronously
  SYNC = 'sync',                         // MIFF events processed synchronously
  QUEUED = 'queued',                     // MIFF events queued for processing
  IMMEDIATE = 'immediate',               // MIFF events processed immediately
  SCHEDULED = 'scheduled',               // MIFF events scheduled for specific time
  CONDITIONAL = 'conditional'            // MIFF events processed based on conditions
}

export enum UnrealEventType {
  // Actor Events
  ACTOR_SPAWNED = 'actor_spawned',
  ACTOR_DESTROYED = 'actor_destroyed',
  ACTOR_BEGIN_PLAY = 'actor_begin_play',
  ACTOR_END_PLAY = 'actor_end_play',
  ACTOR_TICK = 'actor_tick',
  ACTOR_OVERLAP = 'actor_overlap',
  ACTOR_HIT = 'actor_hit',
  ACTOR_DAMAGE = 'actor_damage',
  ACTOR_HEAL = 'actor_heal',
  ACTOR_DEATH = 'actor_death',

  // Component Events
  COMPONENT_CREATED = 'component_created',
  COMPONENT_DESTROYED = 'component_destroyed',
  COMPONENT_TICK = 'component_tick',
  COMPONENT_OVERLAP = 'component_overlap',
  COMPONENT_HIT = 'component_hit',

  // Input Events
  INPUT_KEY_PRESSED = 'input_key_pressed',
  INPUT_KEY_RELEASED = 'input_key_released',
  INPUT_MOUSE_PRESSED = 'input_mouse_pressed',
  INPUT_MOUSE_RELEASED = 'input_mouse_released',
  INPUT_MOUSE_MOVED = 'input_mouse_moved',
  INPUT_AXIS_CHANGED = 'input_axis_changed',
  INPUT_ACTION_PRESSED = 'input_action_pressed',
  INPUT_ACTION_RELEASED = 'input_action_released',

  // Physics Events
  PHYSICS_COLLISION = 'physics_collision',
  PHYSICS_OVERLAP = 'physics_overlap',
  PHYSICS_TRIGGER = 'physics_trigger',
  PHYSICS_BODY_SLEEP = 'physics_body_sleep',
  PHYSICS_BODY_WAKE = 'physics_body_wake',

  // Animation Events
  ANIMATION_STARTED = 'animation_started',
  ANIMATION_ENDED = 'animation_ended',
  ANIMATION_LOOPED = 'animation_looped',
  ANIMATION_NOTIFIED = 'animation_notified',
  ANIMATION_MONTAGE_STARTED = 'animation_montage_started',
  ANIMATION_MONTAGE_ENDED = 'animation_montage_ended',
  ANIMATION_MONTAGE_BLENDED = 'animation_montage_blended',

  // Audio Events
  AUDIO_PLAYED = 'audio_played',
  AUDIO_STOPPED = 'audio_stopped',
  AUDIO_PAUSED = 'audio_paused',
  AUDIO_FINISHED = 'audio_finished',
  AUDIO_MARKER_REACHED = 'audio_marker_reached',

  // UI Events
  UI_BUTTON_CLICKED = 'ui_button_clicked',
  UI_BUTTON_PRESSED = 'ui_button_pressed',
  UI_BUTTON_RELEASED = 'ui_button_released',
  UI_CHECKBOX_CHANGED = 'ui_checkbox_changed',
  UI_SLIDER_CHANGED = 'ui_slider_changed',
  UI_TEXT_CHANGED = 'ui_text_changed',
  UI_DROPDOWN_CHANGED = 'ui_dropdown_changed',
  UI_WIDGET_VISIBILITY_CHANGED = 'ui_widget_visibility_changed',

  // Gameplay Events
  GAME_STARTED = 'game_started',
  GAME_PAUSED = 'game_paused',
  GAME_RESUMED = 'game_resumed',
  GAME_ENDED = 'game_ended',
  LEVEL_LOADED = 'level_loaded',
  LEVEL_UNLOADED = 'level_unloaded',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  MATCH_STARTED = 'match_started',
  MATCH_ENDED = 'match_ended',
  ROUND_STARTED = 'round_started',
  ROUND_ENDED = 'round_ended',
  SCORE_CHANGED = 'score_changed',
  LIVES_CHANGED = 'lives_changed',
  HEALTH_CHANGED = 'health_changed',
  AMMO_CHANGED = 'ammo_changed',
  INVENTORY_CHANGED = 'inventory_changed',

  // AI Events
  AI_BEHAVIOR_STARTED = 'ai_behavior_started',
  AI_BEHAVIOR_ENDED = 'ai_behavior_ended',
  AI_DECISION_MADE = 'ai_decision_made',
  AI_TARGET_ACQUIRED = 'ai_target_acquired',
  AI_TARGET_LOST = 'ai_target_lost',
  AI_PATH_FOUND = 'ai_path_found',
  AI_PATH_BLOCKED = 'ai_path_blocked',
  AI_STATE_CHANGED = 'ai_state_changed',

  // Network Events
  NETWORK_CONNECTED = 'network_connected',
  NETWORK_DISCONNECTED = 'network_disconnected',
  NETWORK_ERROR = 'network_error',
  NETWORK_MESSAGE_RECEIVED = 'network_message_received',
  NETWORK_MESSAGE_SENT = 'network_message_sent',
  NETWORK_LATENCY_CHANGED = 'network_latency_changed',
  NETWORK_PACKET_LOSS_CHANGED = 'network_packet_loss_changed',

  // Custom Events
  CUSTOM_EVENT_1 = 'custom_event_1',
  CUSTOM_EVENT_2 = 'custom_event_2',
  CUSTOM_EVENT_3 = 'custom_event_3',
  CUSTOM_EVENT_4 = 'custom_event_4',
  CUSTOM_EVENT_5 = 'custom_event_5'
}

export enum EventPriority {
  LOWEST = 'lowest',
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  HIGHEST = 'highest',
  CRITICAL = 'critical'
}

export enum EventDeliveryMode {
  UNRELIABLE = 'unreliable',
  RELIABLE = 'reliable',
  UNRELIABLE_ORDERED = 'unreliable_ordered',
  RELIABLE_ORDERED = 'reliable_ordered',
  UNRELIABLE_SEQUENCED = 'unreliable_sequenced',
  RELIABLE_SEQUENCED = 'reliable_sequenced'
}

export enum EventScope {
  LOCAL = 'local',
  NETWORK = 'network',
  GLOBAL = 'global',
  PRIVATE = 'private',
  PUBLIC = 'public'
}

export interface EventSyncConfiguration {
  syncMode: EventSyncMode;
  enableEventBuffering: boolean;
  enableEventFiltering: boolean;
  enableEventPrioritization: boolean;
  enableEventBatching: boolean;
  enableEventCompression: boolean;
  enableEventEncryption: boolean;
  maxBufferSize: number;
  maxBatchSize: number;
  batchTimeout: number;
  eventTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  priorityQueues: EventPriority[];
  deliveryMode: EventDeliveryMode;
  scope: EventScope;
  enableDeadLetterQueue: boolean;
  deadLetterQueueSize: number;
  enableEventLogging: boolean;
  enableEventMetrics: boolean;
  enableEventTracing: boolean;
  enableEventProfiling: boolean;
  customEventHandlers: Record<string, string>;
  eventFilters: EventFilter[];
  eventTransformers: EventTransformer[];
  eventValidators: EventValidator[];
  customSettings: Record<string, any>;
}

export interface EventFilter {
  id: string;
  name: string;
  eventTypes: UnrealEventType[];
  priorities: EventPriority[];
  sources: string[];
  targets: string[];
  conditions: EventCondition[];
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface EventCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'in' | 'not_in' | 'exists' | 'not_exists' | 'matches' | 'not_matches';
  value: any;
  caseSensitive: boolean;
  metadata: Record<string, any>;
}

export interface EventTransformer {
  id: string;
  name: string;
  eventTypes: UnrealEventType[];
  transformFunction: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface EventValidator {
  id: string;
  name: string;
  eventTypes: UnrealEventType[];
  validationRules: ValidationRule[];
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'optional' | 'read_only' | 'write_only' | 'min_length' | 'max_length' | 'min_value' | 'max_value' | 'pattern' | 'enum' | 'custom';
  value: any;
  message: string;
  metadata: Record<string, any>;
}

export interface EventMapping {
  miffEvent: string;
  unrealEvent: UnrealEventType;
  priority: EventPriority;
  deliveryMode: EventDeliveryMode;
  scope: EventScope;
  transformer?: string;
  validator?: string;
  filter?: string;
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface EventSubscription {
  id: string;
  eventType: UnrealEventType;
  subscriber: string;
  priority: EventPriority;
  filter?: EventFilter;
  transformer?: EventTransformer;
  validator?: EventValidator;
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface EventQueue {
  id: string;
  name: string;
  priority: EventPriority;
  events: UnrealEvent[];
  maxSize: number;
  currentSize: number;
  overflowPolicy: 'drop' | 'block' | 'resize';
  batchSize: number;
  batchTimeout: number;
  lastBatchTime: number;
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface EventStatistics {
  totalEvents: number;
  processedEvents: number;
  filteredEvents: number;
  transformedEvents: number;
  validatedEvents: number;
  failedEvents: number;
  averageProcessingTime: number;
  peakProcessingTime: number;
  totalProcessingTime: number;
  eventsPerSecond: number;
  eventTypeDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  targetDistribution: Record<string, number>;
  errorDistribution: Record<string, number>;
  queueDepth: number;
  bufferUsage: number;
  deadLetterCount: number;
  retryCount: number;
  timeoutCount: number;
  batchCount: number;
  averageBatchSize: number;
  customMetrics: Record<string, any>;
}

export class UnrealEventSyncPure {
  private bridgeManager: UnrealBridgeManager;
  private configuration: EventSyncConfiguration;
  private eventMappings: Map<string, EventMapping> = new Map();
  private eventSubscriptions: Map<string, EventSubscription> = new Map();
  private eventQueues: Map<string, EventQueue> = new Map();
  private eventFilters: Map<string, EventFilter> = new Map();
  private eventTransformers: Map<string, EventTransformer> = new Map();
  private eventValidators: Map<string, EventValidator> = new Map();
  private eventBuffer: UnrealEvent[] = [];
  private deadLetterQueue: UnrealEvent[] = [];
  private statistics: EventStatistics;
  private isInitialized = false;
  private isConnected = false;

  constructor(
    bridgeManager: UnrealBridgeManager,
    configuration: EventSyncConfiguration
  ) {
    this.bridgeManager = bridgeManager;
    this.configuration = configuration;
    this.statistics = this.initializeStatistics();
    this.initializeEventSync();
  }

  private initializeStatistics(): EventStatistics {
    return {
      totalEvents: 0,
      processedEvents: 0,
      filteredEvents: 0,
      transformedEvents: 0,
      validatedEvents: 0,
      failedEvents: 0,
      averageProcessingTime: 0,
      peakProcessingTime: 0,
      totalProcessingTime: 0,
      eventsPerSecond: 0,
      eventTypeDistribution: {},
      priorityDistribution: {},
      sourceDistribution: {},
      targetDistribution: {},
      errorDistribution: {},
      queueDepth: 0,
      bufferUsage: 0,
      deadLetterCount: 0,
      retryCount: 0,
      timeoutCount: 0,
      batchCount: 0,
      averageBatchSize: 0,
      customMetrics: {}
    };
  }

  private async initializeEventSync(): Promise<void> {
    console.log('[UnrealEventSyncPure!] Initializing event synchronization...');

    try {
      // Initialize event queues
      await this.initializeEventQueues();

      // Initialize event mappings
      await this.initializeEventMappings();

      // Initialize event filters
      await this.initializeEventFilters();

      // Initialize event transformers
      await this.initializeEventTransformers();

      // Initialize event validators
      await this.initializeEventValidators();

      // Start event processing
      this.startEventProcessing();

      this.isInitialized = true;
      console.log('[UnrealEventSyncPure!] Event synchronization initialized successfully');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[UnrealEventSyncPure!] Failed to initialize event synchronization:', err instanceof Error ? err.message : String(err));
      throw new Error(`Event synchronization initialization failed: ${error}`);
    }
  }

  private async initializeEventQueues(): Promise<void> {
    console.log('[UnrealEventSyncPure!] Initializing event queues...');

    // Create priority-based queues
    const priorityQueues = this.configuration?.priorityQueues || [EventPriority.NORMAL];
    for (const priority of priorityQueues) {
      const queue: EventQueue = {
        id: `queue_${priority}`,
        name: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Queue`,
        priority: priority as EventPriority,
        events: [],
        maxSize: this.configuration?.maxBufferSize || 1000,
        currentSize: 0,
        overflowPolicy: 'drop',
        batchSize: this.configuration?.maxBatchSize || 10,
        batchTimeout: this.configuration?.batchTimeout || 1000,
        lastBatchTime: Date.now(),
        enabled: true,
        metadata: {}
      };

      this.eventQueues.set(queue.id, queue);
    }

    // Create default queue if none exist
    if (this.eventQueues.size === 0) {
      const defaultQueue: EventQueue = {
        id: 'queue_default',
        name: 'Default Event Queue',
        priority: EventPriority.NORMAL,
        events: [],
        maxSize: this.configuration?.maxBufferSize || 1000,
        currentSize: 0,
        overflowPolicy: 'drop',
        batchSize: this.configuration?.maxBatchSize || 10,
        batchTimeout: this.configuration?.batchTimeout || 1000,
        lastBatchTime: Date.now(),
        enabled: true,
        metadata: {}
      };

      this.eventQueues.set('queue_default', defaultQueue);
    }

    console.log(`[UnrealEventSyncPure!] Initialized ${this.eventQueues.size} event queues`);
  }

  private async initializeEventMappings(): Promise<void> {
    console.log('[UnrealEventSyncPure!] Initializing event mappings...');

    // Default event mappings for common MIFF events
    const defaultMappings: EventMapping[] = [
      {
        miffEvent: 'combat.attack',
        unrealEvent: UnrealEventType.ACTOR_DAMAGE,
        priority: EventPriority.HIGH,
        deliveryMode: EventDeliveryMode.RELIABLE,
        scope: EventScope.NETWORK,
        enabled: true,
        metadata: {}
      },
      {
        miffEvent: 'combat.defend',
        unrealEvent: UnrealEventType.ANIMATION_STARTED,
        priority: EventPriority.NORMAL,
        deliveryMode: EventDeliveryMode.UNRELIABLE,
        scope: EventScope.LOCAL,
        enabled: true,
        metadata: {}
      },
      {
        miffEvent: 'item.use',
        unrealEvent: UnrealEventType.ACTOR_HEAL,
        priority: EventPriority.HIGH,
        deliveryMode: EventDeliveryMode.RELIABLE,
        scope: EventScope.NETWORK,
        enabled: true,
        metadata: {}
      },
      {
        miffEvent: 'ai.decision',
        unrealEvent: UnrealEventType.AI_DECISION_MADE,
        priority: EventPriority.NORMAL,
        deliveryMode: EventDeliveryMode.UNRELIABLE,
        scope: EventScope.LOCAL,
        enabled: true,
        metadata: {}
      },
      {
        miffEvent: 'scene.load',
        unrealEvent: UnrealEventType.LEVEL_LOADED,
        priority: EventPriority.CRITICAL,
        deliveryMode: EventDeliveryMode.RELIABLE_ORDERED,
        scope: EventScope.GLOBAL,
        enabled: true,
        metadata: {}
      },
      {
        miffEvent: 'input.key',
        unrealEvent: UnrealEventType.INPUT_KEY_PRESSED,
        priority: EventPriority.HIGHEST,
        deliveryMode: EventDeliveryMode.RELIABLE_ORDERED,
        scope: EventScope.PRIVATE,
        enabled: true,
        metadata: {}
      }
    ];

    for (const mapping of defaultMappings) {
      this.eventMappings.set(mapping.miffEvent, mapping);
    }

    console.log(`[UnrealEventSyncPure!] Initialized ${this.eventMappings.size} event mappings`);
  }

  private async initializeEventFilters(): Promise<void> {
    console.log('[UnrealEventSyncPure!] Initializing event filters...');

    if (!this.configuration?.enableEventFiltering) {
      console.log('[UnrealEventSyncPure!] Event filtering disabled');
      return;
    }

    // Create default event filters
    const eventFilters = this.configuration?.eventFilters || [];
    for (const filterConfig of eventFilters) {
      const filter: EventFilter = {
        ...filterConfig,
        enabled: true,
        metadata: {}
      };

      this.eventFilters.set(filter.id, filter);
    }

    console.log(`[UnrealEventSyncPure!] Initialized ${this.eventFilters.size} event filters`);
  }

  private async initializeEventTransformers(): Promise<void> {
    console.log('[UnrealEventSyncPure!] Initializing event transformers...');

    // Create default event transformers
    const eventTransformers = this.configuration?.eventTransformers || [];
    for (const transformerConfig of eventTransformers) {
      const transformer: EventTransformer = {
        ...transformerConfig,
        enabled: true,
        metadata: {}
      };

      this.eventTransformers.set(transformer.id, transformer);
    }

    console.log(`[UnrealEventSyncPure!] Initialized ${this.eventTransformers.size} event transformers`);
  }

  private async initializeEventValidators(): Promise<void> {
    console.log('[UnrealEventSyncPure!] Initializing event validators...');

    // Create default event validators
    const eventValidators = this.configuration?.eventValidators || [];
    for (const validatorConfig of eventValidators) {
      const validator: EventValidator = {
        ...validatorConfig,
        enabled: true,
        metadata: {}
      };

      this.eventValidators.set(validator.id, validator);
    }

    console.log(`[UnrealEventSyncPure!] Initialized ${this.eventValidators.size} event validators`);
  }

  private startEventProcessing(): void {
    // Start event processing intervals
    setInterval(() => {
      this.processEventBuffer();
    }, 16); // 60 FPS

    setInterval(() => {
      this.processEventQueues();
    }, 50); // 20 FPS

    setInterval(() => {
      this.checkEventTimeouts();
    }, 1000); // 1 FPS

    setInterval(() => {
      this.updateStatistics();
    }, 1000); // 1 FPS

    if (this.configuration?.enableEventBatching || false) {
      setInterval(() => {
        this.processBatchedEvents();
      }, this.configuration?.batchTimeout || 1000);
    }

    console.log('[UnrealEventSyncPure!] Event processing started');
  }

  async syncEvent(miffEvent: any): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Event synchronization not initialized');
    }

    console.log(`[UnrealEventSyncPure!] Syncing MIFF event: ${miffEvent.type || miffEvent.name}`);

    const startTime = Date.now();

    try {
      // Convert MIFF event to Unreal event
      const unrealEvent = await this.convertMiffEventToUnreal(miffEvent);
      if (!unrealEvent) {
        console.warn(`[UnrealEventSyncPure!] Failed to convert MIFF event: ${miffEvent.type || miffEvent.name}`);
        return false;
      }

      // Apply filters
      if (this.configuration.enableEventFiltering) {
        const filtered = await this.applyEventFilters(unrealEvent);
        if (!filtered.allowed) {
          console.log(`[UnrealEventSyncPure!] Event filtered: ${unrealEvent.name} (${filtered.reason})`);
          this.statistics.filteredEvents++;
          return true; // Event was filtered, not an error
        }
      }

      // Apply transformations
      const transformedEvent = await this.applyEventTransformers(unrealEvent);

      // Apply validation
      const validationResult = await this.validateEvent(transformedEvent);
      if (!validationResult.valid) {
        console.warn(`[UnrealEventSyncPure!] Event validation failed: ${transformedEvent.name}`);
        console.warn(`[UnrealEventSyncPure!] Validation errors: ${validationResult.errors.join(', ')}`);
        this.statistics.failedEvents++;
        return false;
      }

      // Add to appropriate queue
      const queued = await this.queueEvent(transformedEvent);
      if (!queued) {
        console.error(`[UnrealEventSyncPure!] Failed to queue event: ${transformedEvent.name}`);
        this.statistics.failedEvents++;
        return false;
      }

      const processingTime = Date.now() - startTime;
      this.statistics.processedEvents++;
      this.statistics.averageProcessingTime = (this.statistics.averageProcessingTime * (this.statistics.processedEvents - 1) + processingTime) / this.statistics.processedEvents;
      if (processingTime > this.statistics.peakProcessingTime) {
        this.statistics.peakProcessingTime = processingTime;
      }
      this.statistics.totalProcessingTime += processingTime;
      this.statistics.eventsPerSecond = this.statistics.processedEvents / Math.max(1, (Date.now() - (this.statistics as any).startTime) / 1000);

      console.log(`[UnrealEventSyncPure!] Event synced successfully: ${transformedEvent.name} (${processingTime}ms)`);
      return true;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const processingTime = Date.now() - startTime;
      this.statistics.failedEvents++;

      console.error(`[UnrealEventSyncPure!] Failed to sync event: ${miffEvent.type || miffEvent.name}`, err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  private async convertMiffEventToUnreal(miffEvent: any): Promise<UnrealEvent | null> {
    // Find event mapping
    const mapping = this.eventMappings.get(miffEvent.type || miffEvent.name);
    if (!mapping) {
      console.warn(`[UnrealEventSyncPure!] No mapping found for MIFF event: ${miffEvent.type || miffEvent.name}`);
      return null;
    }

    if (!mapping.enabled) {
      console.log(`[UnrealEventSyncPure!] Event mapping disabled: ${mapping.miffEvent}`);
      return null;
    }

    // Convert MIFF event to Unreal event
    const unrealEvent: UnrealEvent = {
      id: `unreal_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: mapping.unrealEvent,
      source: 'miff_bridge',
      data: miffEvent,
      timestamp: Date.now(),
      eventType: mapping.unrealEvent,
      category: this.getEventCategory(mapping.unrealEvent),
      severity: this.getEventSeverity(mapping.priority),
      metadata: {
        miffEvent: miffEvent,
        mapping: mapping,
        conversionTime: Date.now()
      }
    };

    return unrealEvent;
  }

  private getEventCategory(eventType: UnrealEventType): string {
    if (eventType.startsWith('ACTOR_')) return 'actor';
    if (eventType.startsWith('COMPONENT_')) return 'component';
    if (eventType.startsWith('INPUT_')) return 'input';
    if (eventType.startsWith('PHYSICS_')) return 'physics';
    if (eventType.startsWith('ANIMATION_')) return 'animation';
    if (eventType.startsWith('AUDIO_')) return 'audio';
    if (eventType.startsWith('UI_')) return 'ui';
    if (eventType.startsWith('GAME_')) return 'gameplay';
    if (eventType.startsWith('AI_')) return 'ai';
    if (eventType.startsWith('NETWORK_')) return 'network';
    return 'custom';
  }

  private getEventSeverity(priority: EventPriority): 'low' | 'medium' | 'high' | 'critical' {
    switch (priority) {
      case EventPriority.LOWEST:
      case EventPriority.LOW:
        return 'low';
      case EventPriority.NORMAL:
        return 'medium';
      case EventPriority.HIGH:
        return 'high';
      case EventPriority.HIGHEST:
      case EventPriority.CRITICAL:
        return 'critical';
      default:
        return 'medium';
    }
  }

  private async applyEventFilters(event: UnrealEvent): Promise<{ allowed: boolean; reason?: string }> {
    for (const filter of this.eventFilters.values()) {
      if (!filter.enabled) continue;

      // Check event types
      if (filter.eventTypes.length > 0 && !filter.eventTypes.includes(event.eventType)) {
        continue;
      }

      // Check priorities
      if (filter.priorities.length > 0 && !filter.priorities.includes(event.category as EventPriority)) {
        continue;
      }

      // Check sources
      if (filter.sources.length > 0 && !filter.sources.includes(event.source)) {
        continue;
      }

      // Check targets
      if (filter.targets.length > 0 && !filter.targets.some(target => event.data?.target === target)) {
        continue;
      }

      // Check conditions
      for (const condition of filter.conditions) {
        const fieldValue = this.getFieldValue(event, condition.field);
        const matches = this.evaluateCondition(fieldValue, condition);

        if (!matches) {
          return { allowed: false, reason: `Filter condition failed: ${condition.field} ${condition.operator} ${condition.value}` };
        }
      }
    }

    return { allowed: true };
  }

  private getFieldValue(event: UnrealEvent, field: string): any {
    const keys = field.split('.');
    let value: any = event;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key!];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private evaluateCondition(fieldValue: any, condition: EventCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return condition.caseSensitive ?
          String(fieldValue).includes(String(condition.value)) :
          String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'not_contains':
        return !this.evaluateCondition(fieldValue, { ...condition, operator: 'contains' });
      case 'starts_with':
        return condition.caseSensitive ?
          String(fieldValue).startsWith(String(condition.value)) :
          String(fieldValue).toLowerCase().startsWith(String(condition.value).toLowerCase());
      case 'ends_with':
        return condition.caseSensitive ?
          String(fieldValue).endsWith(String(condition.value)) :
          String(fieldValue).toLowerCase().endsWith(String(condition.value).toLowerCase());
      case 'greater_than':
        return fieldValue > condition.value;
      case 'less_than':
        return fieldValue < condition.value;
      case 'greater_equal':
        return fieldValue >= condition.value;
      case 'less_equal':
        return fieldValue <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return !this.evaluateCondition(fieldValue, { ...condition, operator: 'in' });
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      case 'not_exists':
        return fieldValue === undefined || fieldValue === null;
      case 'matches':
        try {
          const regex = new RegExp(condition.value, condition.caseSensitive ? 'g' : 'gi');
          return regex.test(String(fieldValue));
        } catch {
          return false;
        }
      case 'not_matches':
        return !this.evaluateCondition(fieldValue, { ...condition, operator: 'matches' });
      default:
        return false;
    }
  }

  private async applyEventTransformers(event: UnrealEvent): Promise<UnrealEvent> {
    let transformedEvent = { ...event };

    for (const transformer of this.eventTransformers.values()) {
      if (!transformer.enabled) continue;

      if (transformer.eventTypes.includes(event.eventType)) {
        transformedEvent = await this.applyTransformer(transformedEvent, transformer);
        this.statistics.transformedEvents++;
      }
    }

    return transformedEvent;
  }

  private async applyTransformer(event: UnrealEvent, transformer: EventTransformer): Promise<UnrealEvent> {
    // In a real implementation, this would execute the transform function
    // For now, we'll return the event as-is with transformer metadata
    return {
      ...event,
      metadata: {
        ...event.metadata,
        transformer: transformer.id,
        transformTime: Date.now()
      }
    };
  }

  private async validateEvent(event: UnrealEvent): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const validator of this.eventValidators.values()) {
      if (!validator.enabled) continue;

      if (validator.eventTypes.includes(event.eventType)) {
        const validationErrors = await this.applyValidator(event, validator);
        errors.push(...validationErrors);
        if (errors.length > 0) {
          this.statistics.failedEvents++;
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async applyValidator(event: UnrealEvent, validator: EventValidator): Promise<string[]> {
    const errors: string[] = [];

    for (const rule of validator.validationRules) {
      const fieldValue = this.getFieldValue(event, rule.field);
      const isValid = this.validateRule(fieldValue, rule);

      if (!isValid) {
        errors.push(rule.message);
      }
    }

    if (errors.length === 0) {
      this.statistics.validatedEvents++;
    }

    return errors;
  }

  private validateRule(fieldValue: any, rule: ValidationRule): boolean {
    switch (rule.rule) {
      case 'required':
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
      case 'optional':
        return true;
      case 'min_length':
        return String(fieldValue).length >= rule.value;
      case 'max_length':
        return String(fieldValue).length <= rule.value;
      case 'min_value':
        return fieldValue >= rule.value;
      case 'max_value':
        return fieldValue <= rule.value;
      case 'pattern':
        try {
          const regex = new RegExp(rule.value);
          return regex.test(String(fieldValue));
        } catch {
          return false;
        }
      case 'enum':
        return Array.isArray(rule.value) && rule.value.includes(fieldValue);
      default:
        return true;
    }
  }

  private async queueEvent(event: UnrealEvent): Promise<boolean> {
    if (this.configuration.enableEventBuffering) {
      // Add to buffer
      this.eventBuffer.push(event: any);

      if (this.eventBuffer.length >= this.configuration?.maxBufferSize || 1000) {
        await this.processEventBuffer();
      }

      return true;
    } else {
      // Process immediately
      return await this.processEventImmediately(event: any);
    }
  }

  private async processEventImmediately(event: UnrealEvent): Promise<boolean> {
    try {
      // Send to Unreal via bridge manager
      const message: UnrealMessage = {
        id: `event_message_${event?.id}`,
        type: 'event',
        source: 'miff_bridge',
        destination: 'unreal',
        timestamp: Date.now(),
        payload: event,
        priority: this.getEventPriorityValue(event.category as EventPriority),
        ttl: this.configuration.eventTimeout,
        retries: this.configuration.retryAttempts,
        encrypted: this.configuration.enableEventEncryption,
        compressed: this.configuration.enableEventCompression,
        metadata: {
          eventSync: true,
          immediate: true
        }
      };

      return await this.bridgeManager.sendMessage(message);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[UnrealEventSyncPure!] Failed to process event immediately: ${event.name}`, err instanceof Error ? err.message : String(err));

      // Add to dead letter queue if enabled
      if (this.configuration.enableDeadLetterQueue) {
        this.deadLetterQueue.push(event: any);
        this.statistics.deadLetterCount++;

        if (this.deadLetterQueue.length > this.configuration.deadLetterQueueSize) {
          this.deadLetterQueue.shift(); // Remove oldest
        }
      }

      return false;
    }
  }

  private getEventPriorityValue(priority: EventPriority): number {
    switch (priority) {
      case EventPriority.LOWEST: return 1;
      case EventPriority.LOW: return 2;
      case EventPriority.NORMAL: return 3;
      case EventPriority.HIGH: return 4;
      case EventPriority.HIGHEST: return 5;
      case EventPriority.CRITICAL: return 6;
      default: return 3;
    }
  }

  private async processEventBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    console.log(`[UnrealEventSyncPure!] Processing event buffer: ${this.eventBuffer.length} events`);

    // Group events by priority
    const priorityGroups: Record<string, UnrealEvent[]> = {};
    for (const event of this.eventBuffer) {
      const priority = event.category;
      if (!priorityGroups[priority!]) {
        priorityGroups[priority!] = [];
      }
      priorityGroups[priority!].push(event: any);
    }

    // Process each priority group
    for (const [priority, events] of Object.entries(priorityGroups)) {
      await this.processPriorityGroup(priority, events);
    }

    this.eventBuffer = [];
  }

  private async processPriorityGroup(priority: string, events: UnrealEvent[]): Promise<void> {
    if (this.configuration?.enableEventBatching || false) {
      // Process in batches
      for (let i = 0; i < events.length; i += this.configuration?.maxBatchSize || 10) {
        const batch = events.slice(i, i + this.configuration?.maxBatchSize || 10);
        await this.processEventBatch(priority, batch);
        this.statistics.batchCount++;
        this.statistics.averageBatchSize = (this.statistics.averageBatchSize * (this.statistics.batchCount - 1) + batch.length) / this.statistics.batchCount;
      }
    } else {
      // Process individually
      for (const event of events) {
        await this.processEventImmediately(event: any);
      }
    }
  }

  private async processEventBatch(priority: string, events: UnrealEvent[]): Promise<void> {
    const message: UnrealMessage = {
      id: `event_batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      source: 'miff_bridge',
      destination: 'unreal',
      timestamp: Date.now(),
      payload: {
        batch: true,
        priority,
        events
      },
      priority: this.getEventPriorityValue(priority as EventPriority),
      ttl: this.configuration.eventTimeout,
      retries: this.configuration.retryAttempts,
      encrypted: this.configuration.enableEventEncryption,
      compressed: this.configuration.enableEventCompression,
      metadata: {
        eventSync: true,
        batched: true,
        batchSize: events.length
      }
    };

    await this.bridgeManager.sendMessage(message);
  }

  private async processEventQueues(): Promise<void> {
    for (const queue of this.eventQueues.values()) {
      if (!queue.enabled || queue.events.length === 0) continue;

      await this.processEventQueue(queue);
    }
  }

  private async processEventQueue(queue: EventQueue): Promise<void> {
    // Process events in queue
    const eventsToProcess = queue.events.splice(0, queue.batchSize);

    for (const event of eventsToProcess) {
      await this.processEventImmediately(event: any);
    }

    // Update queue statistics
    queue.currentSize = queue.events.length;
  }

  private async checkEventTimeouts(): Promise<void> {
    const now = Date.now();
    const timeoutThreshold = now - this.configuration.eventTimeout;

    // Check event buffer for timeouts
    const timedOutEvents: UnrealEvent[] = [];
    for (let i = this.eventBuffer.length - 1; i >= 0; i--) {
      if (this.eventBuffer[i!].timestamp < timeoutThreshold) {
        timedOutEvents.push(this.eventBuffer.splice(i, 1)[0]);
      }
    }

    for (const event of timedOutEvents) {
      console.warn(`[UnrealEventSyncPure!] Event timed out: ${event.name}`);
      this.statistics.timeoutCount++;

      if (this.configuration.enableDeadLetterQueue) {
        this.deadLetterQueue.push(event: any);
        this.statistics.deadLetterCount++;
      }
    }

    // Check event queues for timeouts
    for (const queue of this.eventQueues.values()) {
      const queueTimedOutEvents: UnrealEvent[] = [];
      for (let i = queue.events.length - 1; i >= 0; i--) {
        if (queue.events[i!].timestamp < timeoutThreshold) {
          queueTimedOutEvents.push(queue.events.splice(i, 1)[0]);
        }
      }

      for (const event of queueTimedOutEvents) {
        console.warn(`[UnrealEventSyncPure!] Queue event timed out: ${event.name}`);
        this.statistics.timeoutCount++;

        if (this.configuration.enableDeadLetterQueue) {
          this.deadLetterQueue.push(event: any);
          this.statistics.deadLetterCount++;
        }
      }
    }
  }

  private updateStatistics(): void {
    this.statistics.queueDepth = this.calculateQueueDepth();
    this.statistics.bufferUsage = this.eventBuffer.length / this.configuration?.maxBufferSize || 1000;
    this.statistics.eventTypeDistribution = this.calculateEventTypeDistribution();
    this.statistics.priorityDistribution = this.calculatePriorityDistribution();
    this.statistics.sourceDistribution = this.calculateSourceDistribution();
    this.statistics.targetDistribution = this.calculateTargetDistribution();
    this.statistics.errorDistribution = this.calculateErrorDistribution();
  }

  private calculateQueueDepth(): number {
    let totalDepth = this.eventBuffer.length;
    for (const queue of this.eventQueues.values()) {
      totalDepth += queue.currentSize;
    }
    return totalDepth;
  }

  private calculateEventTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const event of this.eventBuffer) {
      distribution[event.eventType] = (distribution[event.eventType] || 0) + 1;
    }

    for (const queue of this.eventQueues.values()) {
      for (const event of queue.events) {
        distribution[event.eventType] = (distribution[event.eventType] || 0) + 1;
      }
    }

    return distribution;
  }

  private calculatePriorityDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const event of this.eventBuffer) {
      distribution[event.category] = (distribution[event.category] || 0) + 1;
    }

    for (const queue of this.eventQueues.values()) {
      for (const event of queue.events) {
        distribution[event.category] = (distribution[event.category] || 0) + 1;
      }
    }

    return distribution;
  }

  private calculateSourceDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const event of this.eventBuffer) {
      distribution[event.source] = (distribution[event.source] || 0) + 1;
    }

    for (const queue of this.eventQueues.values()) {
      for (const event of queue.events) {
        distribution[event.source] = (distribution[event.source] || 0) + 1;
      }
    }

    return distribution;
  }

  private calculateTargetDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const event of this.eventBuffer) {
      const target = event.data?.target || 'unknown';
      distribution[target!] = (distribution[target!] || 0) + 1;
    }

    for (const queue of this.eventQueues.values()) {
      for (const event of queue.events) {
        const target = event.data?.target || 'unknown';
        distribution[target!] = (distribution[target!] || 0) + 1;
      }
    }

    return distribution;
  }

  private calculateErrorDistribution(): Record<string, number> {
    // This would track different types of errors
    return {};
  }

  // Subscription management
  subscribeToEvent(subscription: EventSubscription): void {
    this.eventSubscriptions.set(subscription.id, subscription);
    console.log(`[UnrealEventSyncPure!] Event subscription created: ${subscription.id} for ${subscription.eventType}`);
  }

  unsubscribeFromEvent(subscriptionId: string): void {
    this.eventSubscriptions.delete(subscriptionId);
    console.log(`[UnrealEventSyncPure!] Event subscription removed: ${subscriptionId}`);
  }

  getEventSubscription(subscriptionId: string): EventSubscription | undefined {
    return this.eventSubscriptions.get(subscriptionId);
  }

  getAllEventSubscriptions(): EventSubscription[] {
    return Array.from(this.eventSubscriptions.values());
  }

  // Event mapping management
  addEventMapping(mapping: EventMapping): void {
    this.eventMappings.set(mapping.miffEvent, mapping);
    console.log(`[UnrealEventSyncPure!] Event mapping added: ${mapping.miffEvent} → ${mapping.unrealEvent}`);
  }

  removeEventMapping(miffEvent: string): void {
    this.eventMappings.delete(miffEvent);
    console.log(`[UnrealEventSyncPure!] Event mapping removed: ${miffEvent}`);
  }

  getEventMapping(miffEvent: string): EventMapping | undefined {
    return this.eventMappings.get(miffEvent);
  }

  getAllEventMappings(): EventMapping[] {
    return Array.from(this.eventMappings.values());
  }

  // Configuration management
  updateConfiguration(updates: Partial<EventSyncConfiguration>): void {
    Object.assign(this.configuration, updates);

    // Reinitialize affected components
    if (updates.enableEventFiltering !== undefined) {
      this.initializeEventFilters();
    }

    if (updates.eventTransformers !== undefined) {
      this.initializeEventTransformers();
    }

    if (updates.eventValidators !== undefined) {
      this.initializeEventValidators();
    }

    console.log('[UnrealEventSyncPure!] Configuration updated');
  }

  getConfiguration(): EventSyncConfiguration {
    return { ...this.configuration };
  }

  // Statistics and monitoring
  getStatistics(): EventStatistics {
    this.updateStatistics();
    return { ...this.statistics };
  }

  getEventBufferInfo(): any {
    return {
      bufferSize: this.eventBuffer.length,
      maxBufferSize: this.configuration?.maxBufferSize || 1000,
      usage: (this.eventBuffer.length / this.configuration?.maxBufferSize || 1000) * 100,
      oldestEvent: this.eventBuffer.length > 0 ? this.eventBuffer[0].timestamp : null,
      newestEvent: this.eventBuffer.length > 0 ? this.eventBuffer[this.eventBuffer.length - 1].timestamp : null
    };
  }

  getDeadLetterQueueInfo(): any {
    return {
      queueSize: this.deadLetterQueue.length,
      maxQueueSize: this.configuration.deadLetterQueueSize,
      oldestEvent: this.deadLetterQueue.length > 0 ? this.deadLetterQueue[0].timestamp : null,
      newestEvent: this.deadLetterQueue.length > 0 ? this.deadLetterQueue[this.deadLetterQueue.length - 1].timestamp : null,
      eventTypes: this.deadLetterQueue.reduce((types, event) => {
        types[event.eventType] = (types[event.eventType] || 0) + 1;
        return types;
      }, {} as Record<string, number>)
    };
  }

  // Utility methods
  clearEventBuffer(): void {
    this.eventBuffer = [];
    console.log('[UnrealEventSyncPure!] Event buffer cleared');
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
    console.log('[UnrealEventSyncPure!] Dead letter queue cleared');
  }

  clearAllQueues(): void {
    this.clearEventBuffer();

    for (const queue of this.eventQueues.values()) {
      queue.events = [];
      queue.currentSize = 0;
    }

    console.log('[UnrealEventSyncPure!] All event queues cleared');
  }

  reset(): void {
    this.clearAllQueues();
    this.eventMappings.clear();
    this.eventSubscriptions.clear();
    this.eventFilters.clear();
    this.eventTransformers.clear();
    this.eventValidators.clear();
    this.initializeEventMappings();
    this.initializeEventQueues();
    console.log('[UnrealEventSyncPure!] Event synchronization reset to initial state');
  }

  dispose(): void {
    this.reset();
    this.isInitialized = false;
    console.log('[UnrealEventSyncPure!] Event synchronization disposed successfully');
  }
}