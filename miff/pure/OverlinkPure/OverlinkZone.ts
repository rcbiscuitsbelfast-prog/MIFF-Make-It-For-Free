// OverlinkPure — Meta-Zone Hub (Remix-Safe)
// Purpose: Connects other modules (Toppler, Spirit Tamer) as a hub for transitions, overlays, and remix previews
// Schema: Pure JSON outputs, deterministic, engine-agnostic

import { OverlinkThemes, ThemeId, ThemeConfig } from './OverlinkThemes';
import { RemixLineageTracker, RemixOrigin, AssetLineage } from './RemixLineageTracker';
import { AudioManager } from './AudioManager';
import { BadgeSystem, CreditsRenderer } from '../../../badges';

export type ZoneId = string;
export type ModuleId = string;

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'dissolve' | 'instant';

export type OverlayLayer = 'debug' | 'ui' | 'transition' | 'preview' | 'navigation';

export type AssetBinding = {
  id: string;
  type: 'texture' | 'audio' | 'model' | 'shader' | 'data';
  path: string;
  remixSafe: boolean;
  fallback?: string;
};

export type ModuleConnection = {
  id: ModuleId;
  zoneId: ZoneId;
  status: 'active' | 'inactive' | 'loading' | 'error';
  dependencies: string[];
  remixMode: boolean;
};

export type DrawReducer = {
  id: string;
  type: 'sprite' | 'ui' | 'effect' | 'debug';
  priority: number;
  enabled: boolean;
  data: Record<string, any>;
};

export type TransitionConfig = {
  fromZone?: ZoneId;
  toZone: ZoneId;
  type: TransitionType;
  duration: number;
  overlay?: OverlayLayer;
  effects?: string[];
};

export type OverlinkState = {
  currentZone: ZoneId;
  activeModules: ModuleConnection[];
  overlayLayers: Map<OverlayLayer, boolean>;
  drawReducers: DrawReducer[];
  assetBindings: AssetBinding[];
  transitions: TransitionConfig[];
  debugMode: boolean;
  activeTheme: string | null;
  lineageTracking: boolean;
};

export class OverlinkZone {
  private state: OverlinkState;
  private moduleRegistry = new Map<ModuleId, ModuleConnection>();
  private zoneRegistry = new Map<ZoneId, { name: string; tags: string[] }>();
  private transitionQueue: TransitionConfig[] = [];
  private themes: OverlinkThemes;
  private lineageTracker: RemixLineageTracker;
  private audioManager: AudioManager;
  private badgeSystem: BadgeSystem;
  private creditsRenderer: CreditsRenderer;

  constructor() {
    this.state = {
      currentZone: '',
      activeModules: [],
      overlayLayers: new Map([
        ['debug', false],
        ['ui', true],
        ['transition', true],
        ['preview', false],
        ['navigation', true]
      ]),
      drawReducers: [],
      assetBindings: [],
      transitions: [],
      debugMode: false,
      activeTheme: null,
      lineageTracking: false
    };

    // Initialize theme and lineage systems
    this.themes = new OverlinkThemes();
    this.lineageTracker = new RemixLineageTracker();
    this.audioManager = new AudioManager();
    this.badgeSystem = new BadgeSystem();
    this.creditsRenderer = new CreditsRenderer(this.badgeSystem);
    
    // Connect audio manager to themes
    this.themes.setAudioManager(this.audioManager);
    
    // Load audio configuration
    this.audioManager.loadConfig().catch(console.error);
    
    // Initialize badge system with sample data
    this.initializeBadgeSystem();
  }

  // Zone Management
  registerZone(zoneId: ZoneId, name?: string, tags: string[] = []): void {
    this.zoneRegistry.set(zoneId, { name: name || zoneId, tags });
  }

  enterZone(zoneId: ZoneId): void {
    if (this.state.currentZone === zoneId) return;
    
    const previousZone = this.state.currentZone;
    this.state.currentZone = zoneId;
    
    // Queue transition if coming from another zone
    if (previousZone) {
      this.queueTransition({
        fromZone: previousZone,
        toZone: zoneId,
        type: 'fade',
        duration: 300
      });
    }
  }

  // Module Management
  registerModule(moduleId: ModuleId, zoneId: ZoneId, dependencies: string[] = []): ModuleConnection {
    const connection: ModuleConnection = {
      id: moduleId,
      zoneId,
      status: 'inactive',
      dependencies,
      remixMode: false
    };
    
    this.moduleRegistry.set(moduleId, connection);
    return connection;
  }

  activateModule(moduleId: ModuleId): boolean {
    const module = this.moduleRegistry.get(moduleId);
    if (!module) return false;
    
    // Check dependencies
    const canActivate = module.dependencies.every(dep => 
      this.moduleRegistry.get(dep)?.status === 'active'
    );
    
    if (canActivate) {
      module.status = 'active';
      this.updateActiveModules();
      return true;
    }
    
    return false;
  }

  deactivateModule(moduleId: ModuleId): void {
    const module = this.moduleRegistry.get(moduleId);
    if (module) {
      module.status = 'inactive';
      this.updateActiveModules();
    }
  }

  // Draw Reducer Management
  addDrawReducer(reducer: DrawReducer): void {
    this.state.drawReducers.push(reducer);
    this.sortDrawReducers();
  }

  removeDrawReducer(reducerId: string): void {
    this.state.drawReducers = this.state.drawReducers.filter(r => r.id !== reducerId);
  }

  toggleDrawReducer(reducerId: string): boolean {
    const reducer = this.state.drawReducers.find(r => r.id === reducerId);
    if (reducer) {
      reducer.enabled = !reducer.enabled;
      return reducer.enabled;
    }
    return false;
  }

  // Overlay Layer Management
  toggleOverlayLayer(layer: OverlayLayer): boolean {
    const current = this.state.overlayLayers.get(layer) || false;
    const newState = !current;
    this.state.overlayLayers.set(layer, newState);
    return newState;
  }

  setOverlayLayer(layer: OverlayLayer, enabled: boolean): void {
    this.state.overlayLayers.set(layer, enabled);
  }

  // Asset Binding Management
  bindAsset(binding: AssetBinding): void {
    this.state.assetBindings.push(binding);
  }

  unbindAsset(assetId: string): void {
    this.state.assetBindings = this.state.assetBindings.filter(b => b.id !== assetId);
  }

  getAssetBinding(assetId: string): AssetBinding | undefined {
    return this.state.assetBindings.find(b => b.id === assetId);
  }

  // Transition Management
  queueTransition(transition: TransitionConfig): void {
    this.transitionQueue.push(transition);
  }

  processTransitions(): TransitionConfig[] {
    const processed = [...this.transitionQueue];
    this.transitionQueue = [];
    return processed;
  }

  // Debug Mode
  toggleDebugMode(): boolean {
    this.state.debugMode = !this.state.debugMode;
    if (this.state.debugMode) {
      this.setOverlayLayer('debug', true);
    }
    return this.state.debugMode;
  }

  // State Queries
  getCurrentZone(): ZoneId {
    return this.state.currentZone;
  }

  getActiveModules(): ModuleConnection[] {
    return this.state.activeModules;
  }

  getDrawReducers(): DrawReducer[] {
    return this.state.drawReducers.filter(r => r.enabled);
  }

  getOverlayLayers(): Map<OverlayLayer, boolean> {
    return new Map(this.state.overlayLayers);
  }

  getAssetBindings(): AssetBinding[] {
    return [...this.state.assetBindings];
  }

  // Theme Management
  activateTheme(themeId: ThemeId): boolean {
    const success = this.themes.activateTheme(themeId);
    if (success) {
      this.state.activeTheme = themeId;
    }
    return success;
  }

  deactivateTheme(): void {
    this.themes.deactivateTheme();
    this.state.activeTheme = null;
  }

  getActiveTheme(): ThemeId | null {
    return this.themes.getActiveTheme();
  }

  getAvailableThemes(): ThemeId[] {
    return this.themes.getAvailableThemes();
  }

  getThemeConfig(themeId: ThemeId) {
    return this.themes.getThemeConfig(themeId);
  }

  toggleThemeLayer(layer: string): boolean {
    return this.themes.toggleLayer(layer as any);
  }

  getThemeCLIPreview(themeId: ThemeId): string {
    return this.themes.getCLIPreview(themeId);
  }

  // Audio Management
  async playThemeAudio(themeId: ThemeId, options: any = {}): Promise<boolean> {
    return await this.themes.playThemeAudio(themeId, options);
  }

  async stopThemeAudio(): Promise<void> {
    await this.themes.stopThemeAudio();
  }

  setThemeVolume(themeId: ThemeId, volume: number): void {
    this.themes.setThemeVolume(themeId, volume);
  }

  getAudioPreview(themeId: ThemeId): string {
    return this.themes.getAudioPreview(themeId);
  }

  validateAudioRemixSafety(themeId: ThemeId): any {
    return this.themes.validateAudioRemixSafety(themeId);
  }

  setMasterVolume(volume: number): void {
    this.audioManager.setMasterVolume(volume);
  }

  getAudioPlaybackState(): any {
    return this.audioManager.getPlaybackState();
  }

  // Badge System Management
  private initializeBadgeSystem(): void {
    // Initialize with sample badge data
    const sampleAssignments = [
      {
        contributorId: 'miff_team',
        badgeType: 'Remix Pioneer' as any,
        sourceZone: 'miff_framework',
        criteria: { remixDepth: 5, assetValidation: 50, scenarioCreation: 20, themeContributions: 10, debugContributions: 15 },
        notes: 'Original framework creator and maintainer'
      },
      {
        contributorId: 'overlink_contributor',
        badgeType: 'Theme Stylist' as any,
        sourceZone: 'overlink_pure',
        criteria: { remixDepth: 2, assetValidation: 25, scenarioCreation: 8, themeContributions: 15, debugContributions: 5 },
        notes: 'Created neonGrid, forestGlade, and cosmicVoid themes'
      },
      {
        contributorId: 'audio_contributor',
        badgeType: 'Theme Stylist' as any,
        sourceZone: 'audio_manager',
        criteria: { remixDepth: 1, assetValidation: 15, scenarioCreation: 5, themeContributions: 8, debugContributions: 2 },
        notes: 'Implemented ambient audio system with remix safety'
      }
    ];

    sampleAssignments.forEach(assignment => {
      this.badgeSystem.assignBadge(assignment);
    });
  }

  assignBadge(assignment: any): any {
    return this.badgeSystem.assignBadge(assignment);
  }

  getContributorBadges(contributorId: string): any[] {
    return this.badgeSystem.getContributorBadges(contributorId);
  }

  displayBadges(contributorId?: string, options?: any): any[] {
    return this.badgeSystem.displayBadges(contributorId, options);
  }

  getBadgePreview(contributorId?: string): string {
    return this.badgeSystem.getCLIPreview(contributorId);
  }

  // Credits and Badge Display
  renderCredits(options: any): any {
    return this.creditsRenderer.renderCreditsWithBadges(options);
  }

  renderCompactCredits(options: any): any {
    return this.creditsRenderer.renderCompactCredits(options);
  }

  renderDetailedCredits(options: any): any {
    return this.creditsRenderer.renderDetailedCredits(options);
  }

  renderBadgeFocusedCredits(options: any): any {
    return this.creditsRenderer.renderBadgeFocusedCredits(options);
  }

  getCreditsPreview(options: any): string {
    return this.creditsRenderer.getCLIPreview(options);
  }

  // Lineage Tracking
  enableLineageTracking(): void {
    this.state.lineageTracking = true;
  }

  disableLineageTracking(): void {
    this.state.lineageTracking = false;
  }

  isLineageTrackingEnabled(): boolean {
    return this.state.lineageTracking;
  }

  registerRemixOrigin(origin: RemixOrigin): void {
    this.lineageTracker.registerRemixOrigin(origin);
  }

  registerAssetLineage(lineage: AssetLineage): void {
    this.lineageTracker.registerAssetLineage(lineage);
  }

  getRemixOrigins() {
    return this.lineageTracker.getRemixOrigins();
  }

  getAllAssetLineages() {
    return this.lineageTracker.getAllAssetLineages();
  }

  validateAllAssets() {
    return this.lineageTracker.validateAllAssets();
  }

  getLineageCLISummary(): string {
    return this.lineageTracker.getCLISummary();
  }

  getLineageSamplerIntegration() {
    return this.lineageTracker.getSamplerIntegration();
  }

  // Utility Methods
  private updateActiveModules(): void {
    this.state.activeModules = Array.from(this.moduleRegistry.values())
      .filter(m => m.status === 'active');
  }

  private sortDrawReducers(): void {
    this.state.drawReducers.sort((a, b) => a.priority - b.priority);
  }

  // Export state for testing and serialization
  exportState(): OverlinkState {
    return {
      ...this.state,
      overlayLayers: new Map(this.state.overlayLayers),
      drawReducers: [...this.state.drawReducers],
      assetBindings: [...this.state.assetBindings],
      transitions: [...this.state.transitions]
    };
  }

  // Import state for testing and deserialization
  importState(state: Partial<OverlinkState>): void {
    if (state.currentZone !== undefined) this.state.currentZone = state.currentZone;
    if (state.debugMode !== undefined) this.state.debugMode = state.debugMode;
    if (state.overlayLayers) this.state.overlayLayers = new Map(state.overlayLayers);
    if (state.drawReducers) this.state.drawReducers = [...state.drawReducers];
    if (state.assetBindings) this.state.assetBindings = [...state.assetBindings];
    if (state.transitions) this.state.transitions = [...state.transitions];
    if (state.activeTheme !== undefined) this.state.activeTheme = state.activeTheme;
    if (state.lineageTracking !== undefined) this.state.lineageTracking = state.lineageTracking;
    
    this.updateActiveModules();
    this.sortDrawReducers();
  }
}