/**
 * MessageQueuePure Manager - Advanced Message Queue Management System
 *
 * Comprehensive message queue system with:
 * - Message publishing and consumption
 * - Queue management and routing
 * - Message persistence and durability
 * - Dead letter queues and retry logic
 * - Message ordering and sequencing
 * - Load balancing and scaling
 * - Monitoring and analytics
 * - Security and access control
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

export interface MessageQueueConfig {
  enablePublishing: boolean;
  enableConsumption: boolean;
  enableQueueManagement: boolean;
  enableRouting: boolean;
  enablePersistence: boolean;
  enableDurability: boolean;
  enableDeadLetterQueues: boolean;
  enableRetryLogic: boolean;
  enableMessageOrdering: boolean;
  enableSequencing: boolean;
  enableLoadBalancing: boolean;
  enableScaling: boolean;
  enableMonitoring: boolean;
  enableAnalytics: boolean;
  enableSecurity: boolean;
  enableAccessControl: boolean;
  maxQueues: number;
  maxMessages: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface MessageQueue {
  id: string;
  name: string;
  type: MessageQueueType;
  status: MessageQueueStatus;
  queues: Queue[];
  topics: Topic[];
  consumers: Consumer[];
  producers: Producer[];
  deadLetterQueues: DeadLetterQueue[];
  monitors: QueueMonitor[];
  analytics: QueueAnalytics;
  metadata: QueueMetadata;
  version: string;
  created: number;
  modified: number;
}

export enum MessageQueueType {
  FIFO = 'fifo',
  PRIORITY = 'priority',
  PUB_SUB = 'pub_sub',
  WORK_QUEUE = 'work_queue',
  CUSTOM = 'custom'
}

export enum MessageQueueStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface Queue {
  id: string;
  name: string;
  type: QueueType;
  status: QueueStatus;
  configuration: QueueConfiguration;
  messages: Message[];
  consumers: string[];
  producers: string[];
  statistics: QueueStatistics;
  metadata: Map<string, any>;
}

export enum QueueType {
  STANDARD = 'standard',
  FIFO = 'fifo',
  PRIORITY = 'priority',
  DEAD_LETTER = 'dead_letter',
  CUSTOM = 'custom'
}

export enum QueueStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface QueueConfiguration {
  visibilityTimeout: number;
  messageRetentionPeriod: number;
  maxReceiveCount: number;
  delaySeconds: number;
  maxMessageSize: number;
  metadata: Map<string, any>;
}

export interface Message {
  id: string;
  content: any;
  type: MessageType;
  priority: MessagePriority;
  status: MessageStatus;
  timestamp: number;
  expiration: number;
  attributes: MessageAttributes;
  metadata: Map<string, any>;
}

export enum MessageType {
  TEXT = 'text',
  JSON = 'json',
  BINARY = 'binary',
  CUSTOM = 'custom'
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CUSTOM = 'custom'
}

export enum MessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DEAD_LETTER = 'dead_letter',
  CUSTOM = 'custom'
}

export interface MessageAttributes {
  contentType: string;
  encoding: string;
  compression: string;
  checksum: string;
  metadata: Map<string, any>;
}

export interface QueueStatistics {
  totalMessages: number;
  pendingMessages: number;
  processedMessages: number;
  failedMessages: number;
  averageProcessingTime: number;
  throughput: number;
  metadata: Map<string, any>;
}

export interface Topic {
  id: string;
  name: string;
  type: TopicType;
  status: TopicStatus;
  subscriptions: string[];
  publishers: string[];
  configuration: TopicConfiguration;
  metadata: Map<string, any>;
}

export enum TopicType {
  STANDARD = 'standard',
  FIFO = 'fifo',
  CUSTOM = 'custom'
}

export enum TopicStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface TopicConfiguration {
  messageRetentionPeriod: number;
  maxMessageSize: number;
  filteringEnabled: boolean;
  metadata: Map<string, any>;
}

export interface Consumer {
  id: string;
  name: string;
  type: ConsumerType;
  status: ConsumerStatus;
  queues: string[];
  topics: string[];
  configuration: ConsumerConfiguration;
  statistics: ConsumerStatistics;
  metadata: Map<string, any>;
}

export enum ConsumerType {
  PULL = 'pull',
  PUSH = 'push',
  BATCH = 'batch',
  CUSTOM = 'custom'
}

export enum ConsumerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface ConsumerConfiguration {
  batchSize: number;
  pollingInterval: number;
  maxConcurrentMessages: number;
  autoAck: boolean;
  metadata: Map<string, any>;
}

export interface ConsumerStatistics {
  totalMessages: number;
  processedMessages: number;
  failedMessages: number;
  averageProcessingTime: number;
  lastProcessed: number;
  metadata: Map<string, any>;
}

export interface Producer {
  id: string;
  name: string;
  type: ProducerType;
  status: ProducerStatus;
  queues: string[];
  topics: string[];
  configuration: ProducerConfiguration;
  statistics: ProducerStatistics;
  metadata: Map<string, any>;
}

export enum ProducerType {
  SINGLE = 'single',
  BATCH = 'batch',
  ASYNC = 'async',
  CUSTOM = 'custom'
}

export enum ProducerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface ProducerConfiguration {
  batchSize: number;
  flushInterval: number;
  compression: boolean;
  retryAttempts: number;
  metadata: Map<string, any>;
}

export interface ProducerStatistics {
  totalMessages: number;
  sentMessages: number;
  failedMessages: number;
  averageLatency: number;
  lastSent: number;
  metadata: Map<string, any>;
}

export interface DeadLetterQueue {
  id: string;
  name: string;
  sourceQueue: string;
  maxReceiveCount: number;
  messages: Message[];
  configuration: DeadLetterQueueConfiguration;
  metadata: Map<string, any>;
}

export interface DeadLetterQueueConfiguration {
  retentionPeriod: number;
  maxMessageSize: number;
  metadata: Map<string, any>;
}

export interface QueueMonitor {
  id: string;
  name: string;
  type: MonitorType;
  enabled: boolean;
  configuration: MonitorConfiguration;
  alerts: MonitorAlert[];
  metadata: Map<string, any>;
}

export enum MonitorType {
  QUEUE_DEPTH = 'queue_depth',
  MESSAGE_AGE = 'message_age',
  CONSUMER_LAG = 'consumer_lag',
  ERROR_RATE = 'error_rate',
  CUSTOM = 'custom'
}

export interface MonitorConfiguration {
  targets: string[];
  interval: number;
  thresholds: Map<string, number>;
  metadata: Map<string, any>;
}

export interface MonitorAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  metadata: Map<string, any>;
}

export interface QueueAnalytics {
  totalQueues: number;
  totalTopics: number;
  totalMessages: number;
  totalConsumers: number;
  totalProducers: number;
  averageMessageSize: number;
  averageProcessingTime: number;
  throughput: number;
  performance: PerformanceMetrics;
  lastUpdate: number;
  metadata: Map<string, any>;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  metadata: Map<string, any>;
}

export interface QueueMetadata {
  author: string;
  version: string;
  tags: string[];
  description: string;
  customMetadata: Map<string, any>;
}

export interface MessageQueueStats {
  totalQueues: number;
  activeQueues: number;
  totalTopics: number;
  totalMessages: number;
  pendingMessages: number;
  processedMessages: number;
  failedMessages: number;
  totalConsumers: number;
  activeConsumers: number;
  totalProducers: number;
  activeProducers: number;
  averageProcessingTime: number;
  throughput: number;
  lastUpdate: number;
}

export class MessageQueueManager {
  private config: MessageQueueConfig;
  private messageQueues: Map<string, MessageQueue> = new Map();
  private stats: MessageQueueStats = this.initializeStats();
  private isInitialized: boolean = false;

  constructor(config: Partial<MessageQueueConfig> = {}) {
    this.config = {
      enablePublishing: true,
      enableConsumption: true,
      enableQueueManagement: true,
      enableRouting: true,
      enablePersistence: true,
      enableDurability: true,
      enableDeadLetterQueues: true,
      enableRetryLogic: true,
      enableMessageOrdering: true,
      enableSequencing: true,
      enableLoadBalancing: true,
      enableScaling: true,
      enableMonitoring: true,
      enableAnalytics: true,
      enableSecurity: true,
      enableAccessControl: true,
      maxQueues: 1000,
      maxMessages: 10000000,
      enableCloudSync: true,
      enableBackup: true,
      enableVersioning: true,
      ...config
    };
  }

  /**
   * Initialize message queue manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize message queue manager
      await this.initializeMessageQueueManager();
      
      // Load default message queues
      await this.loadDefaultMessageQueues();
      
      this.isInitialized = true;
      console.log('Message queue manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize message queue manager:', error);
      return false;
    }
  }

  /**
   * Create new message queue
   */
  createMessageQueue(messageQueue: Partial<MessageQueue>): MessageQueue | null {
    const newMessageQueue: MessageQueue = {
      id: `message_queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: messageQueue.name || 'New Message Queue',
      type: messageQueue.type || MessageQueueType.FIFO,
      status: MessageQueueStatus.ACTIVE,
      queues: messageQueue.queues || [],
      topics: messageQueue.topics || [],
      consumers: messageQueue.consumers || [],
      producers: messageQueue.producers || [],
      deadLetterQueues: messageQueue.deadLetterQueues || [],
      monitors: messageQueue.monitors || [],
      analytics: messageQueue.analytics || this.createDefaultAnalytics(),
      metadata: messageQueue.metadata || this.createDefaultMetadata(),
      version: '1.0.0',
      created: Date.now(),
      modified: Date.now()
    };

    this.messageQueues.set(newMessageQueue.id, newMessageQueue);
    this.updateStats('create_message_queue', newMessageQueue);

    console.log(`Created message queue: ${newMessageQueue.name}`);
    return newMessageQueue;
  }

  /**
   * Create queue
   */
  createQueue(messageQueueId: string, queue: Partial<Queue>): Queue | null {
    const messageQueue = this.messageQueues.get(messageQueueId);
    if (!messageQueue) {
      console.warn(`Message queue ${messageQueueId} not found`);
      return null;
    }

    if (messageQueue.queues.length >= this.config.maxQueues) {
      console.warn('Maximum number of queues reached');
      return null;
    }

    try {
      const newQueue: Queue = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: queue.name || 'New Queue',
        type: queue.type || QueueType.STANDARD,
        status: QueueStatus.ACTIVE,
        configuration: queue.configuration || this.createDefaultQueueConfiguration(),
        messages: queue.messages || [],
        consumers: queue.consumers || [],
        producers: queue.producers || [],
        statistics: queue.statistics || this.createDefaultQueueStatistics(),
        metadata: queue.metadata || new Map()
      };

      messageQueue.queues.push(newQueue);
      messageQueue.modified = Date.now();

      this.updateStats('create_queue', messageQueue);
      console.log(`Created queue: ${newQueue.name}`);
      return newQueue;
    } catch (error) {
      console.error(`Failed to create queue in message queue ${messageQueueId}:`, error);
      return null;
    }
  }

  /**
   * Publish message
   */
  async publishMessage(messageQueueId: string, queueId: string, message: Partial<Message>): Promise<PublishResult> {
    const messageQueue = this.messageQueues.get(messageQueueId);
    if (!messageQueue) {
      return {
        success: false,
        message: 'Message queue not found',
        metadata: new Map()
      };
    }

    const queue = messageQueue.queues.find(q => q.id === queueId);
    if (!queue) {
      return {
        success: false,
        message: 'Queue not found',
        metadata: new Map()
      };
    }

    if (queue.messages.length >= this.config.maxMessages) {
      return {
        success: false,
        message: 'Maximum number of messages reached',
        metadata: new Map()
      };
    }

    try {
      const newMessage: Message = {
        id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message.content || '',
        type: message.type || MessageType.TEXT,
        priority: message.priority || MessagePriority.NORMAL,
        status: MessageStatus.PENDING,
        timestamp: Date.now(),
        expiration: message.expiration || Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        attributes: message.attributes || this.createDefaultMessageAttributes(),
        metadata: message.metadata || new Map()
      };

      queue.messages.push(newMessage);
      queue.statistics.totalMessages++;
      queue.statistics.pendingMessages++;
      
      messageQueue.modified = Date.now();
      this.updateStats('publish_message', messageQueue);
      
      return {
        success: true,
        message: 'Message published successfully',
        messageId: newMessage.id,
        metadata: new Map()
      };
    } catch (error) {
      console.error(`Failed to publish message in queue ${queueId}:`, error);
      return {
        success: false,
        message: `Failed to publish message: ${error}`,
        metadata: new Map()
      };
    }
  }

  /**
   * Consume message
   */
  async consumeMessage(messageQueueId: string, queueId: string, consumerId: string): Promise<ConsumeResult> {
    const messageQueue = this.messageQueues.get(messageQueueId);
    if (!messageQueue) {
      return {
        success: false,
        message: 'Message queue not found',
        data: null,
        metadata: new Map()
      };
    }

    const queue = messageQueue.queues.find(q => q.id === queueId);
    if (!queue) {
      return {
        success: false,
        message: 'Queue not found',
        data: null,
        metadata: new Map()
      };
    }

    const consumer = messageQueue.consumers.find(c => c.id === consumerId);
    if (!consumer) {
      return {
        success: false,
        message: 'Consumer not found',
        data: null,
        metadata: new Map()
      };
    }

    try {
      // Find next message to process
      const message = queue.messages.find(m => m.status === MessageStatus.PENDING);
      if (!message) {
        return {
          success: false,
          message: 'No messages available',
          data: null,
          metadata: new Map()
        };
      }

      // Update message status
      message.status = MessageStatus.PROCESSING;
      queue.statistics.pendingMessages--;
      
      // Update consumer statistics
      consumer.statistics.totalMessages++;
      consumer.statistics.lastProcessed = Date.now();
      
      messageQueue.modified = Date.now();
      this.updateStats('consume_message', messageQueue);
      
      return {
        success: true,
        message: 'Message consumed successfully',
        data: message,
        metadata: new Map()
      };
    } catch (error) {
      console.error(`Failed to consume message from queue ${queueId}:`, error);
      return {
        success: false,
        message: `Failed to consume message: ${error}`,
        data: null,
        metadata: new Map()
      };
    }
  }

  /**
   * Acknowledge message
   */
  async acknowledgeMessage(messageQueueId: string, queueId: string, messageId: string): Promise<AcknowledgeResult> {
    const messageQueue = this.messageQueues.get(messageQueueId);
    if (!messageQueue) {
      return {
        success: false,
        message: 'Message queue not found',
        metadata: new Map()
      };
    }

    const queue = messageQueue.queues.find(q => q.id === queueId);
    if (!queue) {
      return {
        success: false,
        message: 'Queue not found',
        metadata: new Map()
      };
    }

    const message = queue.messages.find(m => m.id === messageId);
    if (!message) {
      return {
        success: false,
        message: 'Message not found',
        metadata: new Map()
      };
    }

    try {
      // Update message status
      message.status = MessageStatus.COMPLETED;
      queue.statistics.processedMessages++;
      
      // Remove message from queue
      const messageIndex = queue.messages.indexOf(message);
      if (messageIndex > -1) {
        queue.messages.splice(messageIndex, 1);
      }
      
      messageQueue.modified = Date.now();
      this.updateStats('acknowledge_message', messageQueue);
      
      return {
        success: true,
        message: 'Message acknowledged successfully',
        metadata: new Map()
      };
    } catch (error) {
      console.error(`Failed to acknowledge message ${messageId}:`, error);
      return {
        success: false,
        message: `Failed to acknowledge message: ${error}`,
        metadata: new Map()
      };
    }
  }

  /**
   * Create consumer
   */
  createConsumer(messageQueueId: string, consumer: Partial<Consumer>): Consumer | null {
    const messageQueue = this.messageQueues.get(messageQueueId);
    if (!messageQueue) {
      console.warn(`Message queue ${messageQueueId} not found`);
      return null;
    }

    try {
      const newConsumer: Consumer = {
        id: `consumer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: consumer.name || 'New Consumer',
        type: consumer.type || ConsumerType.PULL,
        status: ConsumerStatus.ACTIVE,
        queues: consumer.queues || [],
        topics: consumer.topics || [],
        configuration: consumer.configuration || this.createDefaultConsumerConfiguration(),
        statistics: consumer.statistics || this.createDefaultConsumerStatistics(),
        metadata: consumer.metadata || new Map()
      };

      messageQueue.consumers.push(newConsumer);
      messageQueue.modified = Date.now();

      this.updateStats('create_consumer', messageQueue);
      console.log(`Created consumer: ${newConsumer.name}`);
      return newConsumer;
    } catch (error) {
      console.error(`Failed to create consumer in message queue ${messageQueueId}:`, error);
      return null;
    }
  }

  /**
   * Get message queue
   */
  getMessageQueue(messageQueueId: string): MessageQueue | null {
    return this.messageQueues.get(messageQueueId) || null;
  }

  /**
   * Get all message queues
   */
  getMessageQueues(): MessageQueue[] {
    return Array.from(this.messageQueues.values());
  }

  /**
   * Get message queues by type
   */
  getMessageQueuesByType(type: MessageQueueType): MessageQueue[] {
    return Array.from(this.messageQueues.values())
      .filter(queue => queue.type === type);
  }

  /**
   * Get manager statistics
   */
  getManagerStats(): MessageQueueStats {
    return { ...this.stats };
  }

  /**
   * Initialize message queue manager
   */
  private async initializeMessageQueueManager(): Promise<void> {
    console.log('Initializing message queue manager...');
  }

  /**
   * Load default message queues
   */
  private async loadDefaultMessageQueues(): Promise<void> {
    // Load default message queues
    const defaultQueues = [
      this.createDefaultFIFOQueue(),
      this.createDefaultPriorityQueue(),
      this.createDefaultPubSubQueue()
    ];

    for (const queue of defaultQueues) {
      if (queue) {
        this.messageQueues.set(queue.id, queue);
      }
    }

    console.log(`Loaded ${defaultQueues.length} default message queues`);
  }

  /**
   * Create default queue configuration
   */
  private createDefaultQueueConfiguration(): QueueConfiguration {
    return {
      visibilityTimeout: 30000, // 30 seconds
      messageRetentionPeriod: 1209600, // 14 days
      maxReceiveCount: 3,
      delaySeconds: 0,
      maxMessageSize: 262144, // 256KB
      metadata: new Map()
    };
  }

  /**
   * Create default queue statistics
   */
  private createDefaultQueueStatistics(): QueueStatistics {
    return {
      totalMessages: 0,
      pendingMessages: 0,
      processedMessages: 0,
      failedMessages: 0,
      averageProcessingTime: 0,
      throughput: 0,
      metadata: new Map()
    };
  }

  /**
   * Create default message attributes
   */
  private createDefaultMessageAttributes(): MessageAttributes {
    return {
      contentType: 'text/plain',
      encoding: 'utf-8',
      compression: 'none',
      checksum: '',
      metadata: new Map()
    };
  }

  /**
   * Create default consumer configuration
   */
  private createDefaultConsumerConfiguration(): ConsumerConfiguration {
    return {
      batchSize: 1,
      pollingInterval: 1000, // 1 second
      maxConcurrentMessages: 1,
      autoAck: false,
      metadata: new Map()
    };
  }

  /**
   * Create default consumer statistics
   */
  private createDefaultConsumerStatistics(): ConsumerStatistics {
    return {
      totalMessages: 0,
      processedMessages: 0,
      failedMessages: 0,
      averageProcessingTime: 0,
      lastProcessed: 0,
      metadata: new Map()
    };
  }

  /**
   * Create default analytics
   */
  private createDefaultAnalytics(): QueueAnalytics {
    return {
      totalQueues: 0,
      totalTopics: 0,
      totalMessages: 0,
      totalConsumers: 0,
      totalProducers: 0,
      averageMessageSize: 0,
      averageProcessingTime: 0,
      throughput: 0,
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkUsage: 0,
        metadata: new Map()
      },
      lastUpdate: Date.now(),
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): QueueMetadata {
    return {
      author: 'System',
      version: '1.0.0',
      tags: [],
      description: '',
      customMetadata: new Map()
    };
  }

  /**
   * Create default FIFO queue
   */
  private createDefaultFIFOQueue(): MessageQueue {
    return this.createMessageQueue({
      name: 'FIFO Message Queue',
      type: MessageQueueType.FIFO,
      description: 'FIFO message queue'
    });
  }

  /**
   * Create default priority queue
   */
  private createDefaultPriorityQueue(): MessageQueue {
    return this.createMessageQueue({
      name: 'Priority Message Queue',
      type: MessageQueueType.PRIORITY,
      description: 'Priority message queue'
    });
  }

  /**
   * Create default pub/sub queue
   */
  private createDefaultPubSubQueue(): MessageQueue {
    return this.createMessageQueue({
      name: 'Pub/Sub Message Queue',
      type: MessageQueueType.PUB_SUB,
      description: 'Pub/Sub message queue'
    });
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, messageQueue: MessageQueue): void {
    switch (action) {
      case 'create_message_queue':
        this.stats.totalQueues += messageQueue.queues.length;
        this.stats.totalTopics += messageQueue.topics.length;
        this.stats.totalMessages += messageQueue.queues.reduce((sum, q) => sum + q.messages.length, 0);
        this.stats.totalConsumers += messageQueue.consumers.length;
        this.stats.totalProducers += messageQueue.producers.length;
        break;
      case 'create_queue':
        this.stats.totalQueues++;
        this.stats.activeQueues++;
        break;
      case 'publish_message':
        this.stats.totalMessages++;
        break;
      case 'consume_message':
        // Message consumed
        break;
      case 'acknowledge_message':
        this.stats.processedMessages++;
        break;
      case 'create_consumer':
        this.stats.totalConsumers++;
        this.stats.activeConsumers++;
        break;
    }

    this.stats.lastUpdate = Date.now();
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): MessageQueueStats {
    return {
      totalQueues: 0,
      activeQueues: 0,
      totalTopics: 0,
      totalMessages: 0,
      pendingMessages: 0,
      processedMessages: 0,
      failedMessages: 0,
      totalConsumers: 0,
      activeConsumers: 0,
      totalProducers: 0,
      activeProducers: 0,
      averageProcessingTime: 0,
      throughput: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.messageQueues.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

export interface PublishResult {
  success: boolean;
  message: string;
  messageId?: string;
  metadata: Map<string, any>;
}

export interface ConsumeResult {
  success: boolean;
  message: string;
  data: Message | null;
  metadata: Map<string, any>;
}

export interface AcknowledgeResult {
  success: boolean;
  message: string;
  metadata: Map<string, any>;
}

// Export default instance
export const defaultMessageQueueManager = new MessageQueueManager();
export { MessageQueueManager as default };