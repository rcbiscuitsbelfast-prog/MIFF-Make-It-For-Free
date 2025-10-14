/**
 * CombatPure Manager - Advanced Combat Management System
 *
 * Comprehensive combat management system with:
 * - Combat system creation and management
 * - Battle mechanics and calculations
 * - Damage and healing systems
 * - Performance optimization
 * - Real-time combat monitoring
 * - Combat analytics and reporting
 */

export interface CombatConfig {
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
  enableCombatManagement: boolean;
  enableCombatCreation: boolean;
  enableBattleMechanics: boolean;
  enableDamageSystem: boolean;
  enableHealingSystem: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  enableCombatAnalytics: boolean;
  enableCombatReporting: boolean;
  maxBattles: number;
  maxParticipants: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface CombatManager {
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
  type: CombatManagerType;
  status: CombatManagerStatus;
  battles: Battle[];
  participants: CombatParticipant[];
  weapons: Weapon[];
  armor: Armor[];
  spells: Spell[];
  performanceMetrics: CombatPerformanceMetrics;
  analytics: CombatAnalytics;
  reporting: CombatReporting;
  cloudSync: CloudSyncConfig;
  backup: BackupConfig;
  versioning: VersioningConfig;
}

export type CombatManagerType = 'turn_based' | 'real_time' | 'hybrid' | 'custom';
export type CombatManagerStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface Battle {
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
  type: BattleType;
  status: BattleStatus;
  participants: string[];
  environment: BattleEnvironment;
  rules: BattleRules;
  timeline: BattleTimeline;
  performance: BattlePerformance;
}

export type BattleType = 'pvp' | 'pve' | 'raid' | 'arena' | 'custom';
export type BattleStatus = 'preparing' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface CombatParticipant {
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
  type: ParticipantType;
  status: ParticipantStatus;
  stats: CombatStats;
  equipment: CombatEquipment;
  abilities: CombatAbility[];
  buffs: Buff[];
  debuffs: Debuff[];
  performance: ParticipantPerformance;
}

export type ParticipantType = 'player' | 'npc' | 'enemy' | 'ally' | 'custom';
export type ParticipantStatus = 'active' | 'inactive' | 'defeated' | 'fled';

export interface CombatStats {
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
  health: StatValue;
  mana: StatValue;
  stamina: StatValue;
  strength: StatValue;
  agility: StatValue;
  intelligence: StatValue;
  wisdom: StatValue;
  charisma: StatValue;
  defense: StatValue;
  resistance: StatValue;
}

export interface StatValue {
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
  current: number;
  maximum: number;
  base: number;
  modifiers: StatModifier[];
}

export interface StatModifier {
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
  source: string;
  type: ModifierType;
  value: number;
  duration: number;
  permanent: boolean;
}

export type ModifierType = 'add' | 'multiply' | 'percentage' | 'custom';

export interface CombatEquipment {
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
  weapon: WeaponSlot;
  armor: ArmorSlot[];
  accessories: AccessorySlot[];
  consumables: ConsumableSlot[];
}

export interface WeaponSlot {
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
  itemId: string | null;
  item: Weapon | null;
  durability: number;
  enchants: Enchantment[];
}

export interface Weapon {
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
  type: WeaponType;
  rarity: ItemRarity;
  stats: WeaponStats;
  effects: WeaponEffect[];
  requirements: WeaponRequirement[];
}

export type WeaponType = 'sword' | 'bow' | 'staff' | 'dagger' | 'custom';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'custom';

export interface WeaponStats {
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
  damage: number;
  speed: number;
  range: number;
  durability: number;
  weight: number;
  value: number;
}

export interface WeaponEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  chance: number;
  target: TargetType;
}

export type EffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'status' | 'custom';
export type TargetType = 'self' | 'ally' | 'enemy' | 'all' | 'custom';

export interface WeaponRequirement {
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
  type: RequirementType;
  value: number;
  stat: string;
  level: number;
}

export type RequirementType = 'stat' | 'level' | 'class' | 'custom';

export interface Enchantment {
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
  type: EnchantmentType;
  level: number;
  effects: WeaponEffect[];
}

export type EnchantmentType = 'fire' | 'ice' | 'lightning' | 'poison' | 'custom';

export interface ArmorSlot {
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
  itemId: string | null;
  item: Armor | null;
  durability: number;
  enchants: Enchantment[];
}

export interface Armor {
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
  type: ArmorType;
  rarity: ItemRarity;
  stats: ArmorStats;
  effects: ArmorEffect[];
  requirements: ArmorRequirement[];
}

export type ArmorType = 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'custom';

export interface ArmorStats {
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
  defense: number;
  resistance: number;
  durability: number;
  weight: number;
  value: number;
}

export interface ArmorEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  chance: number;
  target: TargetType;
}

export interface ArmorRequirement {
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
  type: RequirementType;
  value: number;
  stat: string;
  level: number;
}

export interface AccessorySlot {
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
  itemId: string | null;
  item: Accessory | null;
  durability: number;
  enchants: Enchantment[];
}

export interface Accessory {
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
  type: AccessoryType;
  rarity: ItemRarity;
  stats: AccessoryStats;
  effects: AccessoryEffect[];
  requirements: AccessoryRequirement[];
}

export type AccessoryType = 'ring' | 'amulet' | 'bracelet' | 'custom';

export interface AccessoryStats {
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
  bonus: number;
  durability: number;
  weight: number;
  value: number;
}

export interface AccessoryEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  chance: number;
  target: TargetType;
}

export interface AccessoryRequirement {
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
  type: RequirementType;
  value: number;
  stat: string;
  level: number;
}

export interface ConsumableSlot {
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
  itemId: string;
  item: Consumable;
  quantity: number;
  cooldown: number;
}

export interface Consumable {
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
  type: ConsumableType;
  effects: ConsumableEffect[];
  duration: number;
  stackable: boolean;
}

export type ConsumableType = 'potion' | 'food' | 'scroll' | 'bomb' | 'custom';

export interface ConsumableEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  chance: number;
  target: TargetType;
}

export interface CombatAbility {
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
  type: AbilityType;
  cost: AbilityCost;
  cooldown: number;
  range: number;
  area: AreaOfEffect;
  effects: AbilityEffect[];
  requirements: AbilityRequirement[];
}

export type AbilityType = 'attack' | 'defense' | 'heal' | 'buff' | 'debuff' | 'custom';

export interface AbilityCost {
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
  health: number;
  mana: number;
  stamina: number;
  items: ItemCost[];
}

export interface ItemCost {
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
  itemId: string;
  quantity: number;
  consumed: boolean;
}

export interface AreaOfEffect {
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
  type: AOEType;
  radius: number;
  shape: AOEShape;
  targets: TargetType[];
}

export type AOEType = 'none' | 'circle' | 'cone' | 'line' | 'custom';
export type AOEShape = 'circle' | 'square' | 'triangle' | 'custom';

export interface AbilityEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  target: TargetType;
  conditions: EffectCondition[];
}

export interface EffectCondition {
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
  field: string;
  operator: ConditionOperator;
  value: any;
}

export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'custom';

export interface AbilityRequirement {
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
  type: RequirementType;
  value: number;
  stat: string;
  ability: string;
}

export interface Buff {
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
  type: BuffType;
  effects: BuffEffect[];
  duration: number;
  source: string;
  stackable: boolean;
}

export type BuffType = 'stat_boost' | 'damage_boost' | 'defense_boost' | 'custom';

export interface BuffEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  target: TargetType;
}

export interface Debuff {
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
  type: DebuffType;
  effects: DebuffEffect[];
  duration: number;
  source: string;
  stackable: boolean;
}

export type DebuffType = 'stat_reduction' | 'damage_reduction' | 'defense_reduction' | 'custom';

export interface DebuffEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  target: TargetType;
}

export interface ParticipantPerformance {
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
  actionsPerformed: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  abilitiesUsed: number;
  lastAction: number;
}

export interface BattleEnvironment {
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
  type: EnvironmentType;
  properties: EnvironmentProperties;
  effects: EnvironmentEffect[];
  lighting: LightingConfig;
  weather: WeatherConfig;
}

export type EnvironmentType = 'dungeon' | 'forest' | 'city' | 'arena' | 'custom';

export interface EnvironmentProperties {
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
  size: Vector3;
  obstacles: Obstacle[];
  cover: Cover[];
  hazards: Hazard[];
}

export interface Vector3 {
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
  z: number;
}

export interface Obstacle {
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
  type: ObstacleType;
  position: Vector3;
  size: Vector3;
  properties: ObstacleProperties;
}

export type ObstacleType = 'wall' | 'pillar' | 'rock' | 'tree' | 'custom';

export interface ObstacleProperties {
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
  solid: boolean;
  destructible: boolean;
  health: number;
  material: string;
}

export interface Cover {
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
  type: CoverType;
  position: Vector3;
  size: Vector3;
  protection: number;
}

export type CoverType = 'full' | 'partial' | 'low' | 'high' | 'custom';

export interface Hazard {
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
  type: HazardType;
  position: Vector3;
  radius: number;
  damage: number;
  effects: HazardEffect[];
}

export type HazardType = 'fire' | 'poison' | 'electric' | 'spike' | 'custom';

export interface HazardEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  area: AreaOfEffect;
}

export interface EnvironmentEffect {
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
  type: EffectType;
  intensity: number;
  area: AreaOfEffect;
  duration: number;
}

export interface LightingConfig {
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
  ambient: Color;
  directional: DirectionalLight;
  point: PointLight[];
}

export interface Color {
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

export interface DirectionalLight {
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
  direction: Vector3;
  color: Color;
  intensity: number;
}

export interface PointLight {
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
  position: Vector3;
  color: Color;
  intensity: number;
  range: number;
}

export interface WeatherConfig {
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
  type: WeatherType;
  intensity: number;
  effects: WeatherEffect[];
}

export type WeatherType = 'clear' | 'rain' | 'snow' | 'fog' | 'storm' | 'custom';

export interface WeatherEffect {
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
  type: EffectType;
  value: number;
  area: AreaOfEffect;
}

export interface BattleRules {
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
  turnOrder: TurnOrderType;
  actionPoints: number;
  movementPoints: number;
  timeLimit: number;
  victoryConditions: VictoryCondition[];
  defeatConditions: DefeatCondition[];
}

export type TurnOrderType = 'initiative' | 'round_robin' | 'random' | 'custom';

export interface VictoryCondition {
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
  type: ConditionType;
  target: string;
  value: number;
  description: string;
}

export type ConditionType = 'defeat_all' | 'survive_time' | 'reach_location' | 'custom';

export interface DefeatCondition {
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
  type: ConditionType;
  target: string;
  value: number;
  description: string;
}

export interface BattleTimeline {
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
  events: TimelineEvent[];
  currentTime: number;
  duration: number;
  paused: boolean;
}

export interface TimelineEvent {
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
  type: EventType;
  participant: string;
  action: string;
  data: Record<string, any>;
}

export type EventType = 'damage' | 'heal' | 'ability' | 'movement' | 'custom';

export interface BattlePerformance {
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
  fps: number;
  frameTime: number;
  memoryUsage: number;
  cpuUsage: number;
  lastUpdated: number;
}

export interface Spell {
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
  type: SpellType;
  school: SpellSchool;
  level: number;
  cost: SpellCost;
  range: number;
  area: AreaOfEffect;
  effects: SpellEffect[];
  requirements: SpellRequirement[];
}

export type SpellType = 'offensive' | 'defensive' | 'healing' | 'utility' | 'custom';
export type SpellSchool = 'fire' | 'ice' | 'lightning' | 'nature' | 'custom';

export interface SpellCost {
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
  mana: number;
  health: number;
  items: ItemCost[];
}

export interface SpellEffect {
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
  type: EffectType;
  value: number;
  duration: number;
  target: TargetType;
  conditions: EffectCondition[];
}

export interface SpellRequirement {
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
  type: RequirementType;
  value: number;
  stat: string;
  level: number;
}

export interface CombatPerformanceMetrics {
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
  totalBattles: number;
  activeBattles: number;
  totalParticipants: number;
  activeParticipants: number;
  totalWeapons: number;
  totalArmor: number;
  totalSpells: number;
  averageBattleTime: number;
  averageDamage: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface CombatAnalytics {
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
  totalBattles: number;
  totalParticipants: number;
  averageBattleTime: number;
  battleTypeDistribution: BattleTypeDistribution[];
  participantTypeDistribution: ParticipantTypeDistribution[];
  performanceTrends: PerformanceTrend[];
}

export interface BattleTypeDistribution {
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
  type: BattleType;
  count: number;
  percentage: number;
  averageDuration: number;
}

export interface ParticipantTypeDistribution {
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
  type: ParticipantType;
  count: number;
  percentage: number;
  averageLevel: number;
}

export interface PerformanceTrend {
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
  battles: number;
  participants: number;
  battleTime: number;
  damage: number;
  memory: number;
  cpu: number;
}

export interface CombatReporting {
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
  includeBattles: boolean;
  lastReport: number;
}

export interface CloudSyncConfig {
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
  changes: string[];
  compatible: boolean;
}

export interface CombatOutput {
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

export class CombatPure {
  private managers: Map<string, CombatManager> = new Map();
  private config: CombatConfig;
  private performanceMetrics: CombatPerformanceMetrics;
  private analytics: CombatAnalytics;

  constructor(config: Partial<CombatConfig> = {}) {
    this.config = {
      enableCombatManagement: true,
      enableCombatCreation: true,
      enableBattleMechanics: true,
      enableDamageSystem: true,
      enableHealingSystem: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      enableCombatAnalytics: true,
      enableCombatReporting: true,
      maxBattles: 1000,
      maxParticipants: 100,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: false,
      ...config
    };

    this.performanceMetrics = {
      totalBattles: 0,
      activeBattles: 0,
      totalParticipants: 0,
      activeParticipants: 0,
      totalWeapons: 0,
      totalArmor: 0,
      totalSpells: 0,
      averageBattleTime: 0,
      averageDamage: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0
    };

    this.analytics = {
      totalBattles: 0,
      totalParticipants: 0,
      averageBattleTime: 0,
      battleTypeDistribution: [],
      participantTypeDistribution: [],
      performanceTrends: []
    };
  }

  /**
   * Create a new combat manager
   */
  createManager(): CombatOutput {
    if (!this.config.enableCombatManagement) {
      return {
        op: 'create-manager',
        status: 'error',
        issues: ['Combat management is disabled']
      };
    }

    const manager: CombatManager = {
      id: managerData.id || `combat-${Date.now()}`,
      name: managerData.name || 'Unnamed Combat Manager',
      type: managerData.type || 'turn_based',
      status: 'active',
      battles: [],
      participants: [],
      weapons: [],
      armor: [],
      spells: [],
      performanceMetrics: {
        totalBattles: 0,
        activeBattles: 0,
        totalParticipants: 0,
        activeParticipants: 0,
        totalWeapons: 0,
        totalArmor: 0,
        totalSpells: 0,
        averageBattleTime: 0,
        averageDamage: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      },
      analytics: {
        totalBattles: 0,
        totalParticipants: 0,
        averageBattleTime: 0,
        battleTypeDistribution: [],
        participantTypeDistribution: [],
        performanceTrends: []
      },
      reporting: {
        enabled: false,
        interval: 300000, // 5 minutes
        format: 'json',
        destination: '',
        includeMetrics: true,
        includeAnalytics: true,
        includeBattles: true,
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
  getManager(): CombatOutput {
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
  getPerformanceMetrics(): CombatPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get analytics
   */
  getAnalytics(): CombatAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get all managers
   */
  getAllManagers(): CombatManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(): void {
    const now = Date.now();
    let totalBattles = 0;
    let activeBattles = 0;
    let totalParticipants = 0;
    let activeParticipants = 0;
    let totalWeapons = 0;
    let totalArmor = 0;
    let totalSpells = 0;

    for (const manager of this.managers.values()) {
      totalBattles += manager.battles.length;
      activeBattles += manager.battles.filter(b => b.status === 'active').length;
      totalParticipants += manager.participants.length;
      activeParticipants += manager.participants.filter(p => p.status === 'active').length;
      totalWeapons += manager.weapons.length;
      totalArmor += manager.armor.length;
      totalSpells += manager.spells.length;
    }

    this.performanceMetrics.totalBattles = totalBattles;
    this.performanceMetrics.activeBattles = activeBattles;
    this.performanceMetrics.totalParticipants = totalParticipants;
    this.performanceMetrics.activeParticipants = activeParticipants;
    this.performanceMetrics.totalWeapons = totalWeapons;
    this.performanceMetrics.totalArmor = totalArmor;
    this.performanceMetrics.totalSpells = totalSpells;
    this.performanceMetrics.uptime = now - (this.performanceMetrics.uptime || now);
  }
}