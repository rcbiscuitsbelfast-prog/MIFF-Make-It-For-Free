/**
 * IoTPure Manager - Advanced IoT Management System
 *
 * Comprehensive IoT system with:
 * - Device management and monitoring
 * - Data collection and processing
 * - Real-time analytics and insights
 * - Edge computing capabilities
 * - Security and authentication
 * - Protocol support and integration
 * - Cloud connectivity and synchronization
 * - Predictive maintenance and alerts
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

export interface IoTConfig {
  enableDeviceManagement: boolean;
  enableDataCollection: boolean;
  enableRealTimeAnalytics: boolean;
  enableEdgeComputing: boolean;
  enableSecurity: boolean;
  enableProtocolSupport: boolean;
  enableCloudConnectivity: boolean;
  enablePredictiveMaintenance: boolean;
  enableAlerts: boolean;
  enableMonitoring: boolean;
  enableAutomation: boolean;
  enableScalability: boolean;
  maxDevices: number;
  maxDataPoints: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface IoT {
  id: string;
  name: string;
  type: IoTType;
  status: IoTStatus;
  devices: IoTDevice[];
  data: IoTData[];
  analytics: IoTAnalytics;
  alerts: IoTAlert[];
  automations: IoTAutomation[];
  security: IoTSecurity;
  metadata: IoTMetadata;
  version: string;
  created: number;
  modified: number;
}

export enum IoTType {
  SMART_HOME = 'smart_home',
  INDUSTRIAL = 'industrial',
  AGRICULTURE = 'agriculture',
  HEALTHCARE = 'healthcare',
  TRANSPORTATION = 'transportation',
  CUSTOM = 'custom'
}

export enum IoTStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  location: DeviceLocation;
  capabilities: DeviceCapabilities;
  sensors: Sensor[];
  actuators: Actuator[];
  connectivity: ConnectivityInfo;
  power: PowerInfo;
  metadata: Map<string, any>;
}

export enum DeviceType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  GATEWAY = 'gateway',
  CONTROLLER = 'controller',
  CUSTOM = 'custom'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface DeviceLocation {
  building: string;
  floor: string;
  room: string;
  coordinates: Coordinates;
  metadata: Map<string, any>;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude: number;
  metadata: Map<string, any>;
}

export interface DeviceCapabilities {
  sensing: SensingCapabilities;
  actuation: ActuationCapabilities;
  processing: ProcessingCapabilities;
  communication: CommunicationCapabilities;
  metadata: Map<string, any>;
}

export interface SensingCapabilities {
  temperature: boolean;
  humidity: boolean;
  pressure: boolean;
  light: boolean;
  motion: boolean;
  sound: boolean;
  custom: string[];
  metadata: Map<string, any>;
}

export interface ActuationCapabilities {
  relay: boolean;
  motor: boolean;
  valve: boolean;
  light: boolean;
  custom: string[];
  metadata: Map<string, any>;
}

export interface ProcessingCapabilities {
  cpu: string;
  memory: number;
  storage: number;
  os: string;
  metadata: Map<string, any>;
}

export interface CommunicationCapabilities {
  wifi: boolean;
  bluetooth: boolean;
  zigbee: boolean;
  zWave: boolean;
  cellular: boolean;
  ethernet: boolean;
  custom: string[];
  metadata: Map<string, any>;
}

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  status: SensorStatus;
  data: SensorData;
  calibration: CalibrationData;
  metadata: Map<string, any>;
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  LIGHT = 'light',
  MOTION = 'motion',
  SOUND = 'sound',
  CUSTOM = 'custom'
}

export enum SensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CALIBRATING = 'calibrating',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface SensorData {
  value: number;
  unit: string;
  timestamp: number;
  quality: DataQuality;
  metadata: Map<string, any>;
}

export enum DataQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CUSTOM = 'custom'
}

export interface CalibrationData {
  offset: number;
  scale: number;
  lastCalibrated: number;
  nextCalibration: number;
  metadata: Map<string, any>;
}

export interface Actuator {
  id: string;
  name: string;
  type: ActuatorType;
  status: ActuatorStatus;
  state: ActuatorState;
  control: ActuatorControl;
  metadata: Map<string, any>;
}

export enum ActuatorType {
  RELAY = 'relay',
  MOTOR = 'motor',
  VALVE = 'valve',
  LIGHT = 'light',
  CUSTOM = 'custom'
}

export enum ActuatorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface ActuatorState {
  on: boolean;
  value: number;
  timestamp: number;
  metadata: Map<string, any>;
}

export interface ActuatorControl {
  min: number;
  max: number;
  step: number;
  unit: string;
  metadata: Map<string, any>;
}

export interface ConnectivityInfo {
  protocol: ProtocolType;
  network: NetworkInfo;
  security: SecurityInfo;
  metadata: Map<string, any>;
}

export enum ProtocolType {
  MQTT = 'mqtt',
  HTTP = 'http',
  COAP = 'coap',
  MODBUS = 'modbus',
  CUSTOM = 'custom'
}

export interface NetworkInfo {
  ssid: string;
  ip: string;
  port: number;
  signal: number;
  metadata: Map<string, any>;
}

export interface SecurityInfo {
  encryption: EncryptionType;
  authentication: AuthType;
  certificates: string[];
  metadata: Map<string, any>;
}

export enum EncryptionType {
  NONE = 'none',
  WEP = 'wep',
  WPA = 'wpa',
  WPA2 = 'wpa2',
  WPA3 = 'wpa3',
  CUSTOM = 'custom'
}

export enum AuthType {
  NONE = 'none',
  PASSWORD = 'password',
  CERTIFICATE = 'certificate',
  TOKEN = 'token',
  CUSTOM = 'custom'
}

export interface PowerInfo {
  source: PowerSource;
  battery: BatteryInfo;
  consumption: PowerConsumption;
  metadata: Map<string, any>;
}

export enum PowerSource {
  BATTERY = 'battery',
  AC = 'ac',
  SOLAR = 'solar',
  CUSTOM = 'custom'
}

export interface BatteryInfo {
  level: number;
  voltage: number;
  current: number;
  temperature: number;
  metadata: Map<string, any>;
}

export interface PowerConsumption {
  current: number;
  average: number;
  peak: number;
  metadata: Map<string, any>;
}

export interface IoTData {
  id: string;
  deviceId: string;
  sensorId: string;
  type: DataType;
  value: any;
  unit: string;
  timestamp: number;
  quality: DataQuality;
  location: DataLocation;
  metadata: Map<string, any>;
}

export enum DataType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  STATUS = 'status',
  EVENT = 'event',
  CUSTOM = 'custom'
}

export interface DataLocation {
  building: string;
  floor: string;
  room: string;
  coordinates: Coordinates;
  metadata: Map<string, any>;
}

export interface IoTAnalytics {
  totalDevices: number;
  onlineDevices: number;
  totalDataPoints: number;
  averageDataQuality: number;
  trends: DataTrend[];
  insights: DataInsight[];
  performance: PerformanceMetrics;
  lastUpdate: number;
  metadata: Map<string, any>;
}

export interface DataTrend {
  id: string;
  name: string;
  type: TrendType;
  direction: TrendDirection;
  value: number;
  confidence: number;
  metadata: Map<string, any>;
}

export enum TrendType {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile',
  CUSTOM = 'custom'
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
  CUSTOM = 'custom'
}

export interface DataInsight {
  id: string;
  title: string;
  description: string;
  type: InsightType;
  confidence: number;
  impact: InsightImpact;
  recommendations: string[];
  metadata: Map<string, any>;
}

export enum InsightType {
  ANOMALY = 'anomaly',
  PATTERN = 'pattern',
  PREDICTION = 'prediction',
  OPTIMIZATION = 'optimization',
  CUSTOM = 'custom'
}

export enum InsightImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  CUSTOM = 'custom'
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: number;
  storageUsage: number;
  metadata: Map<string, any>;
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  timestamp: number;
  acknowledged: boolean;
  actions: AlertAction[];
  metadata: Map<string, any>;
}

export enum AlertType {
  THRESHOLD = 'threshold',
  ANOMALY = 'anomaly',
  DEVICE_OFFLINE = 'device_offline',
  MAINTENANCE = 'maintenance',
  CUSTOM = 'custom'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  CUSTOM = 'custom'
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  CUSTOM = 'custom'
}

export interface AlertAction {
  type: ActionType;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export enum ActionType {
  NOTIFY = 'notify',
  EMAIL = 'email',
  SMS = 'sms',
  ACTUATE = 'actuate',
  CUSTOM = 'custom'
}

export interface IoTAutomation {
  id: string;
  name: string;
  type: AutomationType;
  status: AutomationStatus;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  conditions: AutomationCondition[];
  schedule: AutomationSchedule;
  metadata: Map<string, any>;
}

export enum AutomationType {
  RULE_BASED = 'rule_based',
  TIME_BASED = 'time_based',
  EVENT_BASED = 'event_based',
  CUSTOM = 'custom'
}

export enum AutomationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface AutomationTrigger {
  id: string;
  type: TriggerType;
  deviceId: string;
  sensorId: string;
  condition: TriggerCondition;
  metadata: Map<string, any>;
}

export enum TriggerType {
  SENSOR_VALUE = 'sensor_value',
  TIME = 'time',
  DEVICE_STATUS = 'device_status',
  CUSTOM = 'custom'
}

export interface TriggerCondition {
  operator: ConditionOperator;
  value: any;
  metadata: Map<string, any>;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CUSTOM = 'custom'
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  deviceId: string;
  actuatorId: string;
  parameters: Map<string, any>;
  metadata: Map<string, any>;
}

export interface AutomationCondition {
  id: string;
  type: ConditionType;
  deviceId: string;
  sensorId: string;
  operator: ConditionOperator;
  value: any;
  metadata: Map<string, any>;
}

export enum ConditionType {
  SENSOR_VALUE = 'sensor_value',
  DEVICE_STATUS = 'device_status',
  TIME = 'time',
  CUSTOM = 'custom'
}

export interface AutomationSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: string[];
  timezone: string;
  metadata: Map<string, any>;
}

export interface IoTSecurity {
  encryption: SecurityEncryption;
  authentication: SecurityAuthentication;
  accessControl: AccessControl;
  monitoring: SecurityMonitoring;
  metadata: Map<string, any>;
}

export interface SecurityEncryption {
  enabled: boolean;
  algorithm: string;
  keySize: number;
  metadata: Map<string, any>;
}

export interface SecurityAuthentication {
  enabled: boolean;
  method: string;
  tokens: string[];
  metadata: Map<string, any>;
}

export interface AccessControl {
  enabled: boolean;
  roles: SecurityRole[];
  permissions: SecurityPermission[];
  metadata: Map<string, any>;
}

export interface SecurityRole {
  id: string;
  name: string;
  permissions: string[];
  metadata: Map<string, any>;
}

export interface SecurityPermission {
  id: string;
  name: string;
  resource: string;
  actions: string[];
  metadata: Map<string, any>;
}

export interface SecurityMonitoring {
  enabled: boolean;
  alerts: SecurityAlert[];
  logs: SecurityLog[];
  metadata: Map<string, any>;
}

export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  severity: AlertSeverity;
  description: string;
  timestamp: number;
  metadata: Map<string, any>;
}

export enum SecurityAlertType {
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  MALICIOUS_ACTIVITY = 'malicious_activity',
  DATA_BREACH = 'data_breach',
  CUSTOM = 'custom'
}

export interface SecurityLog {
  id: string;
  type: SecurityLogType;
  message: string;
  timestamp: number;
  metadata: Map<string, any>;
}

export enum SecurityLogType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  CUSTOM = 'custom'
}

export interface IoTMetadata {
  author: string;
  version: string;
  tags: string[];
  description: string;
  customMetadata: Map<string, any>;
}

export interface IoTStats {
  totalDevices: number;
  onlineDevices: number;
  totalDataPoints: number;
  averageDataQuality: number;
  totalAlerts: number;
  activeAlerts: number;
  totalAutomations: number;
  activeAutomations: number;
  lastUpdate: number;
}

export class IoTManager {
  private config: IoTConfig;
  private iots: Map<string, IoT> = new Map();
  private stats: IoTStats = this.initializeStats();
  private isInitialized: boolean = false;

  constructor(config: Partial<IoTConfig> = {}) {
    this.config = {
      enableDeviceManagement: true,
      enableDataCollection: true,
      enableRealTimeAnalytics: true,
      enableEdgeComputing: true,
      enableSecurity: true,
      enableProtocolSupport: true,
      enableCloudConnectivity: true,
      enablePredictiveMaintenance: true,
      enableAlerts: true,
      enableMonitoring: true,
      enableAutomation: true,
      enableScalability: true,
      maxDevices: 10000,
      maxDataPoints: 1000000,
      enableCloudSync: true,
      enableBackup: true,
      enableVersioning: true,
      ...config
    };
  }

  /**
   * Initialize IoT manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize IoT manager
      await this.initializeIoTManager();
      
      // Load default IoTs
      await this.loadDefaultIoTs();
      
      this.isInitialized = true;
      console.log('IoT manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize IoT manager:', error);
      return false;
    }
  }

  /**
   * Create new IoT
   */
  createIoT(iot: Partial<IoT>): IoT | null {
    const newIoT: IoT = {
      id: `iot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: iot.name || 'New IoT',
      type: iot.type || IoTType.SMART_HOME,
      status: IoTStatus.ACTIVE,
      devices: iot.devices || [],
      data: iot.data || [],
      analytics: iot.analytics || this.createDefaultAnalytics(),
      alerts: iot.alerts || [],
      automations: iot.automations || [],
      security: iot.security || this.createDefaultSecurity(),
      metadata: iot.metadata || this.createDefaultMetadata(),
      version: '1.0.0',
      created: Date.now(),
      modified: Date.now()
    };

    this.iots.set(newIoT.id, newIoT);
    this.updateStats('create_iot', newIoT);

    console.log(`Created IoT: ${newIoT.name}`);
    return newIoT;
  }

  /**
   * Create IoT device
   */
  createIoTDevice(iotId: string, device: Partial<IoTDevice>): IoTDevice | null {
    const iot = this.iots.get(iotId);
    if (!iot) {
      console.warn(`IoT ${iotId} not found`);
      return null;
    }

    if (iot.devices.length >= this.config.maxDevices) {
      console.warn('Maximum number of devices reached');
      return null;
    }

    try {
      const newDevice: IoTDevice = {
        id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: device.name || 'New Device',
        type: device.type || DeviceType.SENSOR,
        status: DeviceStatus.ONLINE,
        location: device.location || this.createDefaultDeviceLocation(),
        capabilities: device.capabilities || this.createDefaultDeviceCapabilities(),
        sensors: device.sensors || [],
        actuators: device.actuators || [],
        connectivity: device.connectivity || this.createDefaultConnectivityInfo(),
        power: device.power || this.createDefaultPowerInfo(),
        metadata: device.metadata || new Map()
      };

      iot.devices.push(newDevice);
      iot.modified = Date.now();

      this.updateStats('create_device', iot);
      console.log(`Created IoT device: ${newDevice.name}`);
      return newDevice;
    } catch (error) {
      console.error(`Failed to create IoT device in IoT ${iotId}:`, error);
      return null;
    }
  }

  /**
   * Get IoT
   */
  getIoT(iotId: string): IoT | null {
    return this.iots.get(iotId) || null;
  }

  /**
   * Get all IoTs
   */
  getIoTs(): IoT[] {
    return Array.from(this.iots.values());
  }

  /**
   * Get IoTs by type
   */
  getIoTsByType(type: IoTType): IoT[] {
    return Array.from(this.iots.values())
      .filter(iot => iot.type === type);
  }

  /**
   * Get manager statistics
   */
  getManagerStats(): IoTStats {
    return { ...this.stats };
  }

  /**
   * Initialize IoT manager
   */
  private async initializeIoTManager(): Promise<void> {
    console.log('Initializing IoT manager...');
  }

  /**
   * Load default IoTs
   */
  private async loadDefaultIoTs(): Promise<void> {
    // Load default IoTs
    const defaultIoTs = [
      this.createDefaultSmartHome(),
      this.createDefaultIndustrial(),
      this.createDefaultAgriculture()
    ];

    for (const iot of defaultIoTs) {
      if (iot) {
        this.iots.set(iot.id, iot);
      }
    }

    console.log(`Loaded ${defaultIoTs.length} default IoTs`);
  }

  /**
   * Create default device location
   */
  private createDefaultDeviceLocation(): DeviceLocation {
    return {
      building: 'Building A',
      floor: '1',
      room: 'Room 101',
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 0,
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default device capabilities
   */
  private createDefaultDeviceCapabilities(): DeviceCapabilities {
    return {
      sensing: {
        temperature: true,
        humidity: false,
        pressure: false,
        light: false,
        motion: false,
        sound: false,
        custom: [],
        metadata: new Map()
      },
      actuation: {
        relay: false,
        motor: false,
        valve: false,
        light: false,
        custom: [],
        metadata: new Map()
      },
      processing: {
        cpu: 'ARM Cortex-M4',
        memory: 256,
        storage: 1024,
        os: 'FreeRTOS',
        metadata: new Map()
      },
      communication: {
        wifi: true,
        bluetooth: false,
        zigbee: false,
        zWave: false,
        cellular: false,
        ethernet: false,
        custom: [],
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default connectivity info
   */
  private createDefaultConnectivityInfo(): ConnectivityInfo {
    return {
      protocol: ProtocolType.MQTT,
      network: {
        ssid: 'IoT_Network',
        ip: '192.168.1.100',
        port: 1883,
        signal: -50,
        metadata: new Map()
      },
      security: {
        encryption: EncryptionType.WPA2,
        authentication: AuthType.PASSWORD,
        certificates: [],
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default power info
   */
  private createDefaultPowerInfo(): PowerInfo {
    return {
      source: PowerSource.AC,
      battery: {
        level: 100,
        voltage: 3.7,
        current: 0,
        temperature: 25,
        metadata: new Map()
      },
      consumption: {
        current: 0.1,
        average: 0.1,
        peak: 0.2,
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default analytics
   */
  private createDefaultAnalytics(): IoTAnalytics {
    return {
      totalDevices: 0,
      onlineDevices: 0,
      totalDataPoints: 0,
      averageDataQuality: 0,
      trends: [],
      insights: [],
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        networkUsage: 0,
        storageUsage: 0,
        metadata: new Map()
      },
      lastUpdate: Date.now(),
      metadata: new Map()
    };
  }

  /**
   * Create default security
   */
  private createDefaultSecurity(): IoTSecurity {
    return {
      encryption: {
        enabled: true,
        algorithm: 'AES-256',
        keySize: 256,
        metadata: new Map()
      },
      authentication: {
        enabled: true,
        method: 'JWT',
        tokens: [],
        metadata: new Map()
      },
      accessControl: {
        enabled: true,
        roles: [],
        permissions: [],
        metadata: new Map()
      },
      monitoring: {
        enabled: true,
        alerts: [],
        logs: [],
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): IoTMetadata {
    return {
      author: 'System',
      version: '1.0.0',
      tags: [],
      description: '',
      customMetadata: new Map()
    };
  }

  /**
   * Create default smart home
   */
  private createDefaultSmartHome(): IoT {
    return this.createIoT({
      name: 'Smart Home',
      type: IoTType.SMART_HOME,
      description: 'Smart home IoT system'
    });
  }

  /**
   * Create default industrial
   */
  private createDefaultIndustrial(): IoT {
    return this.createIoT({
      name: 'Industrial IoT',
      type: IoTType.INDUSTRIAL,
      description: 'Industrial IoT system'
    });
  }

  /**
   * Create default agriculture
   */
  private createDefaultAgriculture(): IoT {
    return this.createIoT({
      name: 'Agriculture IoT',
      type: IoTType.AGRICULTURE,
      description: 'Agriculture IoT system'
    });
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, iot: IoT): void {
    switch (action) {
      case 'create_iot':
        this.stats.totalDevices += iot.devices.length;
        this.stats.totalDataPoints += iot.data.length;
        this.stats.totalAlerts += iot.alerts.length;
        this.stats.totalAutomations += iot.automations.length;
        break;
      case 'create_device':
        this.stats.totalDevices++;
        this.stats.onlineDevices++;
        break;
    }

    this.stats.lastUpdate = Date.now();
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): IoTStats {
    return {
      totalDevices: 0,
      onlineDevices: 0,
      totalDataPoints: 0,
      averageDataQuality: 0,
      totalAlerts: 0,
      activeAlerts: 0,
      totalAutomations: 0,
      activeAutomations: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.iots.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultIoTManager = new IoTManager();
export { IoTManager as default };