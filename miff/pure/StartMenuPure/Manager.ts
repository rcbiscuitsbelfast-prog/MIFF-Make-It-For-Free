/**
 * StartMenuPure Manager - Advanced Start Menu Management System
 *
 * Comprehensive start menu management system with:
 * - Start menu creation and management
 * - Menu navigation and interaction
 * - Performance optimization
 * - Real-time menu monitoring
 * - Menu analytics and reporting
 */

export interface StartMenuConfig {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enableMenuManagement: boolean;
  enableMenuCreation: boolean;
  enableMenuNavigation: boolean;
  enableMenuInteraction: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  enableMenuAnalytics: boolean;
  enableMenuReporting: boolean;
  maxMenus: number;
  maxItems: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface StartMenuManager {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: StartMenuManagerType;
  status: StartMenuManagerStatus;
  menus: StartMenu[];
  items: MenuItem[];
  navigations: MenuNavigation[];
  interactions: MenuInteraction[];
  performanceMetrics: StartMenuPerformanceMetrics;
  analytics: StartMenuAnalytics;
  reporting: StartMenuReporting;
  cloudSync: CloudSyncConfig;
  backup: BackupConfig;
  versioning: VersioningConfig;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export type StartMenuManagerType = 'main' | 'settings' | 'game' | 'custom';
export type StartMenuManagerStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface StartMenu {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: MenuType;
  status: MenuStatus;
  items: string[];
  configuration: MenuConfiguration;
  performance: MenuPerformance;
  metadata: Record<string, any>;
}

export type MenuType = 'main' | 'settings' | 'game' | 'custom';
export type MenuStatus = 'active' | 'inactive' | 'hidden' | 'error';

export interface MenuConfiguration {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  title: string;
  description: string;
  theme: MenuTheme;
  layout: MenuLayout;
  animations: MenuAnimation[];
  sounds: MenuSound[];
}

export interface MenuTheme {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  styles: ThemeStyles;
}

export interface ThemeColors {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  primary: Color;
  secondary: Color;
  background: Color;
  text: Color;
  accent: Color;
}

export interface Color {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ThemeFonts {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  primary: string;
  secondary: string;
  size: number;
  weight: FontWeight;
}

export type FontWeight = 'normal' | 'bold' | 'light' | 'custom';

export interface ThemeStyles {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  borderRadius: number;
  shadow: ShadowStyle;
  border: BorderStyle;
}

export interface ShadowStyle {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  color: Color;
  blur: number;
  offset: Vector2;
}

export interface Vector2 {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  x: number;
  y: number;
}

export interface BorderStyle {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  color: Color;
  width: number;
  style: BorderType;
}

export type BorderType = 'solid' | 'dashed' | 'dotted' | 'custom';

export interface MenuLayout {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: LayoutType;
  direction: LayoutDirection;
  spacing: number;
  padding: Padding;
  alignment: Alignment;
}

export type LayoutType = 'vertical' | 'horizontal' | 'grid' | 'custom';
export type LayoutDirection = 'top_to_bottom' | 'bottom_to_top' | 'left_to_right' | 'right_to_left' | 'custom';

export interface Padding {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Alignment {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  horizontal: HorizontalAlignment;
  vertical: VerticalAlignment;
}

export type HorizontalAlignment = 'left' | 'center' | 'right' | 'custom';
export type VerticalAlignment = 'top' | 'center' | 'bottom' | 'custom';

export interface MenuAnimation {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  type: AnimationType;
  duration: number;
  easing: EasingFunction;
  delay: number;
  enabled: boolean;
}

export type AnimationType = 'fade' | 'slide' | 'scale' | 'custom';
export type EasingFunction = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'custom';

export interface MenuSound {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  type: SoundType;
  file: string;
  volume: number;
  enabled: boolean;
}

export type SoundType = 'click' | 'hover' | 'select' | 'custom';

export interface MenuPerformance {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalItems: number;
  averageLoadTime: number;
  lastLoaded: number;
}

export interface MenuItem {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: ItemType;
  status: ItemStatus;
  menu: string;
  configuration: ItemConfiguration;
  performance: ItemPerformance;
  metadata: Record<string, any>;
}

export type ItemType = 'button' | 'link' | 'separator' | 'custom';
export type ItemStatus = 'active' | 'inactive' | 'disabled' | 'error';

export interface ItemConfiguration {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  text: string;
  icon: string;
  tooltip: string;
  shortcut: string;
  action: ItemAction;
  style: ItemStyle;
}

export interface ItemAction {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: ActionType;
  target: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

export type ActionType = 'navigate' | 'execute' | 'toggle' | 'custom';

export interface ItemStyle {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  color: Color;
  backgroundColor: Color;
  fontSize: number;
  fontWeight: FontWeight;
  padding: Padding;
  margin: Margin;
}

export interface Margin {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ItemPerformance {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalClicks: number;
  averageResponseTime: number;
  lastClicked: number;
}

export interface MenuNavigation {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: NavigationType;
  status: NavigationStatus;
  menus: string[];
  configuration: NavigationConfiguration;
  performance: NavigationPerformance;
  metadata: Record<string, any>;
}

export type NavigationType = 'breadcrumb' | 'tabs' | 'sidebar' | 'custom';
export type NavigationStatus = 'active' | 'inactive' | 'error';

export interface NavigationConfiguration {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  showLabels: boolean;
  showIcons: boolean;
  orientation: Orientation;
  style: NavigationStyle;
}

export type Orientation = 'horizontal' | 'vertical' | 'custom';

export interface NavigationStyle {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  color: Color;
  backgroundColor: Color;
  fontSize: number;
  fontWeight: FontWeight;
  padding: Padding;
  margin: Margin;
}

export interface NavigationPerformance {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalNavigations: number;
  averageNavigationTime: number;
  lastNavigation: number;
}

export interface MenuInteraction {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: InteractionType;
  status: InteractionStatus;
  menus: string[];
  configuration: InteractionConfiguration;
  performance: InteractionPerformance;
  metadata: Record<string, any>;
}

export type InteractionType = 'click' | 'hover' | 'keyboard' | 'custom';
export type InteractionStatus = 'active' | 'inactive' | 'error';

export interface InteractionConfiguration {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  timeout: number;
  retries: number;
  feedback: FeedbackConfig;
}

export interface FeedbackConfig {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  visual: boolean;
  audio: boolean;
  haptic: boolean;
  message: string;
}

export interface InteractionPerformance {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalInteractions: number;
  successfulInteractions: number;
  failedInteractions: number;
  averageInteractionTime: number;
  lastInteraction: number;
}

export interface StartMenuPerformanceMetrics {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalMenus: number;
  activeMenus: number;
  totalItems: number;
  totalNavigations: number;
  totalInteractions: number;
  averageLoadTime: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface StartMenuAnalytics {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalMenus: number;
  totalItems: number;
  averageLoadTime: number;
  menuTypeDistribution: MenuTypeDistribution[];
  itemTypeDistribution: ItemTypeDistribution[];
  performanceTrends: PerformanceTrend[];
}

export interface MenuTypeDistribution {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: MenuType;
  count: number;
  percentage: number;
  averageLoadTime: number;
}

export interface ItemTypeDistribution {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: ItemType;
  count: number;
  percentage: number;
  averageResponseTime: number;
}

export interface PerformanceTrend {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  menus: number;
  items: number;
  loadTime: number;
  responseTime: number;
  memory: number;
  cpu: number;
}

export interface StartMenuReporting {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  interval: number;
  format: 'json' | 'csv' | 'xml';
  destination: string;
  includeMetrics: boolean;
  includeAnalytics: boolean;
  includeMenus: boolean;
  lastReport: number;
}

export interface CloudSyncConfig {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  provider: string;
  region: string;
  bucket: string;
  interval: number;
  lastSync: number;
}

export interface BackupConfig {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  interval: number;
  retention: number;
  destination: string;
  lastBackup: number;
}

export interface VersioningConfig {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  currentVersion: string;
  versions: Version[];
  autoUpdate: boolean;
  lastUpdate: number;
}

export interface Version {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  version: string;
  timestamp: number;
  changes: string[];
  compatible: boolean;
}

export interface StartMenuOutput {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: string[];
}

export class StartMenuPure {
  private managers: Map<string, StartMenuManager> = new Map();
  private config: StartMenuConfig;
  private performanceMetrics: StartMenuPerformanceMetrics;
  private analytics: StartMenuAnalytics;

  constructor(config: Partial<StartMenuConfig> = {}) {
    this.config = {
      enableMenuManagement: true,
      enableMenuCreation: true,
      enableMenuNavigation: true,
      enableMenuInteraction: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      enableMenuAnalytics: true,
      enableMenuReporting: true,
      maxMenus: 1000,
      maxItems: 10000,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: false,
      ...config
    };

    this.performanceMetrics = {
      totalMenus: 0,
      activeMenus: 0,
      totalItems: 0,
      totalNavigations: 0,
      totalInteractions: 0,
      averageLoadTime: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0
    };

    this.analytics = {
      totalMenus: 0,
      totalItems: 0,
      averageLoadTime: 0,
      menuTypeDistribution: [],
      itemTypeDistribution: [],
      performanceTrends: []
    };
  }

  /**
   * Create a new start menu manager
   */
  createManager(): StartMenuOutput {
    if (!this.config.enableMenuManagement) {
      return {
        op: 'create-manager',
        status: 'error',
        issues: ['Start menu management is disabled']
      };
    }

    const manager: StartMenuManager = {
      id: managerData.id || `startmenu-${Date.now()}`,
      name: managerData.name || 'Unnamed Start Menu Manager',
      type: managerData.type || 'main',
      status: 'active',
      menus: [],
      items: [],
      navigations: [],
      interactions: [],
      performanceMetrics: {
        totalMenus: 0,
        activeMenus: 0,
        totalItems: 0,
        totalNavigations: 0,
        totalInteractions: 0,
        averageLoadTime: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      },
      analytics: {
        totalMenus: 0,
        totalItems: 0,
        averageLoadTime: 0,
        menuTypeDistribution: [],
        itemTypeDistribution: [],
        performanceTrends: []
      },
      reporting: {
        enabled: false,
        interval: 300000, // 5 minutes
        format: 'json',
        destination: '',
        includeMetrics: true,
        includeAnalytics: true,
        includeMenus: true,
        lastReport: 0
      },
      cloudSync: {
        enabled: false,
        provider: '',
        region: '',
        bucket: '',
        interval: 3600000, // 1 hour
        lastSync: 0
      },
      backup: {
        enabled: false,
        interval: 86400000, // 24 hours
        retention: 7,
        destination: '',
        lastBackup: 0
      },
      versioning: {
        enabled: false,
        currentVersion: '1.0.0',
        versions: [],
        autoUpdate: false,
        lastUpdate: 0
      },
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...managerData
    };

    this.managers.set(manager.id, manager);

    return {
      op: 'create-manager',
      status: 'ok',
      result: manager
    };
  }

  /**
   * Get manager by ID
   */
  getManager(): StartMenuOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'get-manager',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    return {
      op: 'get-manager',
      status: 'ok',
      result: manager
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): StartMenuPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get analytics
   */
  getAnalytics(): StartMenuAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get all managers
   */
  getAllManagers(): StartMenuManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(): void {
    const now = Date.now();
    let totalMenus = 0;
    let activeMenus = 0;
    let totalItems = 0;
    let totalNavigations = 0;
    let totalInteractions = 0;

    for (const manager of this.managers.values()) {
      totalMenus += manager.menus.length;
      activeMenus += manager.menus.filter(m => m.status === 'active').length;
      totalItems += manager.items.length;
      totalNavigations += manager.navigations.length;
      totalInteractions += manager.interactions.length;
    }

    this.performanceMetrics.totalMenus = totalMenus;
    this.performanceMetrics.activeMenus = activeMenus;
    this.performanceMetrics.totalItems = totalItems;
    this.performanceMetrics.totalNavigations = totalNavigations;
    this.performanceMetrics.totalInteractions = totalInteractions;
    this.performanceMetrics.uptime = now - (this.performanceMetrics.uptime || now);
  }
}