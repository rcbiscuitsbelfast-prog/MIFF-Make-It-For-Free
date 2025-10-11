/**
 * CharacterCustomizationPure Manager - Advanced Character Customization System
 *
 * Comprehensive character customization with:
 * - Real-time appearance editing
 * - Body morphing and scaling
 * - Facial feature customization
 * - Hair and clothing systems
 * - Color and texture editing
 * - Animation and pose systems
 * - Preset and template management
 * - Import/export functionality
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

export interface CharacterCustomizationConfig {
  enableRealTimeEditing: boolean;
  enableBodyMorphing: boolean;
  enableFacialCustomization: boolean;
  enableHairSystem: boolean;
  enableClothingSystem: boolean;
  enableColorEditing: boolean;
  enableTextureEditing: boolean;
  enableAnimationSystem: boolean;
  enablePoseSystem: boolean;
  enablePresetManagement: boolean;
  enableTemplateManagement: boolean;
  enableImportExport: boolean;
  enableUndoRedo: boolean;
  enablePreviewMode: boolean;
  enableMultiPlatform: boolean;
  maxCustomizations: number;
  maxPresets: number;
  maxTemplates: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface CharacterCustomization {
  id: string;
  name: string;
  type: CustomizationType;
  status: CustomizationStatus;
  appearance: CharacterAppearance;
  body: BodyCustomization;
  face: FacialCustomization;
  hair: HairCustomization;
  clothing: ClothingCustomization;
  accessories: AccessoryCustomization[];
  colors: ColorCustomization;
  textures: TextureCustomization;
  animations: AnimationCustomization[];
  poses: PoseCustomization[];
  presets: CustomizationPreset[];
  templates: CustomizationTemplate[];
  metadata: CustomizationMetadata;
  version: string;
  created: number;
  modified: number;
}

export enum CustomizationType {
  PLAYER = 'player',
  NPC = 'npc',
  MONSTER = 'monster',
  VEHICLE = 'vehicle',
  PET = 'pet',
  CUSTOM = 'custom'
}

export enum CustomizationStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  ERROR = 'error'
}

export interface CharacterAppearance {
  gender: Gender;
  race: Race;
  age: AgeGroup;
  bodyType: BodyType;
  height: number;
  weight: number;
  skinColor: ColorRGBA;
  eyeColor: ColorRGBA;
  hairColor: ColorRGBA;
  facialHairColor: ColorRGBA;
  metadata: Map<string, any>;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  OTHER = 'other'
}

export enum Race {
  HUMAN = 'human',
  ELF = 'elf',
  DWARF = 'dwarf',
  ORC = 'orc',
  HALFLING = 'halfling',
  DRAGONBORN = 'dragonborn',
  TIEFLING = 'tiefling',
  CUSTOM = 'custom'
}

export enum AgeGroup {
  CHILD = 'child',
  TEEN = 'teen',
  YOUNG_ADULT = 'young_adult',
  ADULT = 'adult',
  MIDDLE_AGED = 'middle_aged',
  ELDERLY = 'elderly'
}

export enum BodyType {
  SLIM = 'slim',
  AVERAGE = 'average',
  ATHLETIC = 'athletic',
  MUSCULAR = 'muscular',
  HEAVY = 'heavy',
  CUSTOM = 'custom'
}

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface BodyCustomization {
  height: number;
  weight: number;
  muscleMass: number;
  bodyFat: number;
  chestSize: number;
  waistSize: number;
  hipSize: number;
  shoulderWidth: number;
  armLength: number;
  legLength: number;
  neckLength: number;
  headSize: number;
  morphing: BodyMorphing;
  scaling: BodyScaling;
  metadata: Map<string, any>;
}

export interface BodyMorphing {
  enabled: boolean;
  regions: MorphingRegion[];
  intensity: number;
  smoothness: number;
  metadata: Map<string, any>;
}

export interface MorphingRegion {
  id: string;
  name: string;
  type: MorphingType;
  position: Position3D;
  size: Size3D;
  strength: number;
  falloff: number;
  metadata: Map<string, any>;
}

export enum MorphingType {
  BULGE = 'bulge',
  DEPRESS = 'depress',
  PUSH = 'push',
  PULL = 'pull',
  TWIST = 'twist',
  BEND = 'bend',
  CUSTOM = 'custom'
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Size3D {
  width: number;
  height: number;
  depth: number;
}

export interface BodyScaling {
  enabled: boolean;
  uniform: boolean;
  x: number;
  y: number;
  z: number;
  preserveProportions: boolean;
  metadata: Map<string, any>;
}

export interface FacialCustomization {
  headShape: HeadShape;
  eyes: EyeCustomization;
  nose: NoseCustomization;
  mouth: MouthCustomization;
  ears: EarCustomization;
  jaw: JawCustomization;
  cheeks: CheekCustomization;
  forehead: ForeheadCustomization;
  chin: ChinCustomization;
  metadata: Map<string, any>;
}

export interface HeadShape {
  type: HeadShapeType;
  width: number;
  height: number;
  depth: number;
  roundness: number;
  angularity: number;
  metadata: Map<string, any>;
}

export enum HeadShapeType {
  OVAL = 'oval',
  ROUND = 'round',
  SQUARE = 'square',
  HEART = 'heart',
  DIAMOND = 'diamond',
  OBLONG = 'oblong',
  TRIANGULAR = 'triangular',
  CUSTOM = 'custom'
}

export interface EyeCustomization {
  shape: EyeShape;
  size: number;
  spacing: number;
  depth: number;
  angle: number;
  eyelid: EyelidCustomization;
  eyebrow: EyebrowCustomization;
  eyelash: EyelashCustomization;
  metadata: Map<string, any>;
}

export enum EyeShape {
  ALMOND = 'almond',
  ROUND = 'round',
  NARROW = 'narrow',
  WIDE = 'wide',
  DROOPY = 'droopy',
  UPTURNED = 'upturned',
  DOWNTURNED = 'downturned',
  CUSTOM = 'custom'
}

export interface EyelidCustomization {
  type: EyelidType;
  thickness: number;
  crease: number;
  hood: number;
  metadata: Map<string, any>;
}

export enum EyelidType {
  SINGLE = 'single',
  DOUBLE = 'double',
  HOODED = 'hooded',
  DEEP_SET = 'deep_set',
  PROMINENT = 'prominent',
  CUSTOM = 'custom'
}

export interface EyebrowCustomization {
  shape: EyebrowShape;
  thickness: number;
  arch: number;
  spacing: number;
  length: number;
  color: ColorRGBA;
  metadata: Map<string, any>;
}

export enum EyebrowShape {
  STRAIGHT = 'straight',
  ARCHED = 'arched',
  ROUNDED = 'rounded',
  S_SHAPED = 's_shaped',
  ANGLED = 'angled',
  CUSTOM = 'custom'
}

export interface EyelashCustomization {
  length: number;
  thickness: number;
  curl: number;
  color: ColorRGBA;
  metadata: Map<string, any>;
}

export interface NoseCustomization {
  shape: NoseShape;
  size: number;
  width: number;
  height: number;
  bridge: NoseBridge;
  tip: NoseTip;
  nostrils: NostrilCustomization;
  metadata: Map<string, any>;
}

export enum NoseShape {
  STRAIGHT = 'straight',
  AQUILINE = 'aquiline',
  SNUB = 'snub',
  ROMAN = 'roman',
  BUTTON = 'button',
  BULBOUS = 'bulbous',
  CUSTOM = 'custom'
}

export interface NoseBridge {
  height: number;
  width: number;
  curve: number;
  metadata: Map<string, any>;
}

export interface NoseTip {
  shape: NoseTipShape;
  size: number;
  angle: number;
  metadata: Map<string, any>;
}

export enum NoseTipShape {
  ROUND = 'round',
  POINTED = 'pointed',
  SQUARE = 'square',
  UPTURNED = 'upturned',
  DOWNTURNED = 'downturned',
  CUSTOM = 'custom'
}

export interface NostrilCustomization {
  size: number;
  width: number;
  flare: number;
  metadata: Map<string, any>;
}

export interface MouthCustomization {
  shape: MouthShape;
  size: number;
  width: number;
  height: number;
  fullness: number;
  lips: LipCustomization;
  teeth: TeethCustomization;
  metadata: Map<string, any>;
}

export enum MouthShape {
  WIDE = 'wide',
  NARROW = 'narrow',
  FULL = 'full',
  THIN = 'thin',
  BOW_SHAPED = 'bow_shaped',
  HEART_SHAPED = 'heart_shaped',
  CUSTOM = 'custom'
}

export interface LipCustomization {
  upperLip: LipDetails;
  lowerLip: LipDetails;
  cupidsBow: number;
  metadata: Map<string, any>;
}

export interface LipDetails {
  thickness: number;
  fullness: number;
  definition: number;
  color: ColorRGBA;
}

export interface TeethCustomization {
  color: ColorRGBA;
  alignment: TeethAlignment;
  gaps: number;
  metadata: Map<string, any>;
}

export enum TeethAlignment {
  STRAIGHT = 'straight',
  CROOKED = 'crooked',
  GAPPED = 'gapped',
  OVERBITE = 'overbite',
  UNDERBITE = 'underbite',
  CUSTOM = 'custom'
}

export interface EarCustomization {
  size: number;
  width: number;
  height: number;
  angle: number;
  lobe: EarLobeCustomization;
  metadata: Map<string, any>;
}

export interface EarLobeCustomization {
  size: number;
  attachment: EarLobeAttachment;
  piercing: PiercingCustomization[];
  metadata: Map<string, any>;
}

export enum EarLobeAttachment {
  ATTACHED = 'attached',
  FREE = 'free',
  PARTIAL = 'partial',
  CUSTOM = 'custom'
}

export interface PiercingCustomization {
  type: PiercingType;
  position: Position3D;
  size: number;
  material: string;
  color: ColorRGBA;
  metadata: Map<string, any>;
}

export enum PiercingType {
  STUD = 'stud',
  HOOP = 'hoop',
  BARBELL = 'barbell',
  RING = 'ring',
  PLUG = 'plug',
  TUNNEL = 'tunnel',
  CUSTOM = 'custom'
}

export interface JawCustomization {
  shape: JawShape;
  width: number;
  height: number;
  angle: number;
  strength: number;
  metadata: Map<string, any>;
}

export enum JawShape {
  SQUARE = 'square',
  ROUND = 'round',
  OVAL = 'oval',
  HEART = 'heart',
  DIAMOND = 'diamond',
  CUSTOM = 'custom'
}

export interface CheekCustomization {
  prominence: number;
  width: number;
  height: number;
  definition: number;
  hollows: number;
  metadata: Map<string, any>;
}

export interface ForeheadCustomization {
  height: number;
  width: number;
  slope: number;
  prominence: number;
  metadata: Map<string, any>;
}

export interface ChinCustomization {
  shape: ChinShape;
  size: number;
  prominence: number;
  cleft: number;
  metadata: Map<string, any>;
}

export enum ChinShape {
  ROUND = 'round',
  SQUARE = 'square',
  POINTED = 'pointed',
  CLEFT = 'cleft',
  RECEDING = 'receding',
  CUSTOM = 'custom'
}

export interface HairCustomization {
  style: HairStyle;
  color: ColorRGBA;
  length: HairLength;
  texture: HairTexture;
  density: number;
  highlights: HairHighlight[];
  metadata: Map<string, any>;
}

export interface HairStyle {
  id: string;
  name: string;
  type: HairType;
  category: HairCategory;
  description: string;
  metadata: Map<string, any>;
}

export enum HairType {
  STRAIGHT = 'straight',
  WAVY = 'wavy',
  CURLY = 'curly',
  COILY = 'coily',
  BALD = 'bald',
  CUSTOM = 'custom'
}

export enum HairCategory {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  PIXIE = 'pixie',
  BOB = 'bob',
  PONYTAIL = 'ponytail',
  BRAID = 'braid',
  BUN = 'bun',
  AFRO = 'afro',
  MOHAWK = 'mohawk',
  CUSTOM = 'custom'
}

export enum HairLength {
  BALD = 'bald',
  BUZZ = 'buzz',
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
  VERY_LONG = 'very_long',
  CUSTOM = 'custom'
}

export enum HairTexture {
  FINE = 'fine',
  MEDIUM = 'medium',
  COARSE = 'coarse',
  CUSTOM = 'custom'
}

export interface HairHighlight {
  color: ColorRGBA;
  intensity: number;
  position: number;
  width: number;
  metadata: Map<string, any>;
}

export interface ClothingCustomization {
  items: ClothingItem[];
  layers: ClothingLayer[];
  materials: ClothingMaterial[];
  colors: ClothingColor[];
  patterns: ClothingPattern[];
  metadata: Map<string, any>;
}

export interface ClothingItem {
  id: string;
  name: string;
  type: ClothingType;
  category: ClothingCategory;
  layer: number;
  position: Position3D;
  rotation: Rotation3D;
  scale: Scale3D;
  material: string;
  color: ColorRGBA;
  pattern: string;
  fit: ClothingFit;
  size: ClothingSize;
  metadata: Map<string, any>;
}

export enum ClothingType {
  SHIRT = 'shirt',
  PANTS = 'pants',
  DRESS = 'dress',
  JACKET = 'jacket',
  COAT = 'coat',
  SHOES = 'shoes',
  HAT = 'hat',
  GLOVES = 'gloves',
  UNDERWEAR = 'underwear',
  CUSTOM = 'custom'
}

export enum ClothingCategory {
  CASUAL = 'casual',
  FORMAL = 'formal',
  SPORTS = 'sports',
  UNIFORM = 'uniform',
  COSTUME = 'costume',
  CUSTOM = 'custom'
}

export enum ClothingFit {
  TIGHT = 'tight',
  REGULAR = 'regular',
  LOOSE = 'loose',
  OVERSIZED = 'oversized',
  CUSTOM = 'custom'
}

export enum ClothingSize {
  XS = 'xs',
  S = 's',
  M = 'm',
  L = 'l',
  XL = 'xl',
  XXL = 'xxl',
  CUSTOM = 'custom'
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Scale3D {
  x: number;
  y: number;
  z: number;
}

export interface ClothingLayer {
  id: string;
  name: string;
  order: number;
  items: string[];
  visible: boolean;
  opacity: number;
  metadata: Map<string, any>;
}

export interface ClothingMaterial {
  id: string;
  name: string;
  type: MaterialType;
  properties: MaterialProperties;
  texture: string;
  metadata: Map<string, any>;
}

export enum MaterialType {
  COTTON = 'cotton',
  WOOL = 'wool',
  SILK = 'silk',
  LEATHER = 'leather',
  DENIM = 'denim',
  SYNTHETIC = 'synthetic',
  CUSTOM = 'custom'
}

export interface MaterialProperties {
  roughness: number;
  metallic: number;
  specular: number;
  normal: number;
  emission: number;
  transparency: number;
  metadata: Map<string, any>;
}

export interface ClothingColor {
  id: string;
  name: string;
  color: ColorRGBA;
  type: ColorType;
  metadata: Map<string, any>;
}

export enum ColorType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  ACCENT = 'accent',
  NEUTRAL = 'neutral',
  CUSTOM = 'custom'
}

export interface ClothingPattern {
  id: string;
  name: string;
  type: PatternType;
  scale: number;
  offset: Position3D;
  rotation: number;
  color: ColorRGBA;
  metadata: Map<string, any>;
}

export enum PatternType {
  SOLID = 'solid',
  STRIPES = 'stripes',
  POLKA_DOTS = 'polka_dots',
  PLAID = 'plaid',
  FLORAL = 'floral',
  GEOMETRIC = 'geometric',
  CUSTOM = 'custom'
}

export interface AccessoryCustomization {
  id: string;
  name: string;
  type: AccessoryType;
  category: AccessoryCategory;
  position: Position3D;
  rotation: Rotation3D;
  scale: Scale3D;
  color: ColorRGBA;
  material: string;
  metadata: Map<string, any>;
}

export enum AccessoryType {
  JEWELRY = 'jewelry',
  GLASSES = 'glasses',
  WATCH = 'watch',
  BELT = 'belt',
  BAG = 'bag',
  CUSTOM = 'custom'
}

export enum AccessoryCategory {
  CASUAL = 'casual',
  FORMAL = 'formal',
  SPORTS = 'sports',
  LUXURY = 'luxury',
  CUSTOM = 'custom'
}

export interface ColorCustomization {
  skin: SkinColorCustomization;
  hair: HairColorCustomization;
  eyes: EyeColorCustomization;
  clothing: ClothingColorCustomization;
  accessories: AccessoryColorCustomization[];
  metadata: Map<string, any>;
}

export interface SkinColorCustomization {
  base: ColorRGBA;
  undertone: ColorRGBA;
  highlights: ColorRGBA;
  shadows: ColorRGBA;
  freckles: FreckleCustomization;
  moles: MoleCustomization;
  scars: ScarCustomization[];
  tattoos: TattooCustomization[];
  metadata: Map<string, any>;
}

export interface FreckleCustomization {
  enabled: boolean;
  density: number;
  size: number;
  color: ColorRGBA;
  distribution: FreckleDistribution;
  metadata: Map<string, any>;
}

export enum FreckleDistribution {
  RANDOM = 'random',
  CLUSTERED = 'clustered',
  UNIFORM = 'uniform',
  CUSTOM = 'custom'
}

export interface MoleCustomization {
  enabled: boolean;
  count: number;
  size: number;
  color: ColorRGBA;
  positions: Position3D[];
  metadata: Map<string, any>;
}

export interface ScarCustomization {
  id: string;
  name: string;
  type: ScarType;
  position: Position3D;
  size: Size3D;
  color: ColorRGBA;
  opacity: number;
  metadata: Map<string, any>;
}

export enum ScarType {
  CUT = 'cut',
  BURN = 'burn',
  SURGICAL = 'surgical',
  BIRTH = 'birth',
  CUSTOM = 'custom'
}

export interface TattooCustomization {
  id: string;
  name: string;
  design: string;
  position: Position3D;
  size: Size3D;
  color: ColorRGBA;
  opacity: number;
  metadata: Map<string, any>;
}

export interface HairColorCustomization {
  base: ColorRGBA;
  highlights: HairHighlight[];
  roots: ColorRGBA;
  tips: ColorRGBA;
  metadata: Map<string, any>;
}

export interface EyeColorCustomization {
  iris: ColorRGBA;
  pupil: ColorRGBA;
  sclera: ColorRGBA;
  metadata: Map<string, any>;
}

export interface ClothingColorCustomization {
  primary: ColorRGBA;
  secondary: ColorRGBA;
  accent: ColorRGBA;
  metadata: Map<string, any>;
}

export interface AccessoryColorCustomization {
  id: string;
  color: ColorRGBA;
  material: string;
  metadata: Map<string, any>;
}

export interface TextureCustomization {
  skin: SkinTextureCustomization;
  hair: HairTextureCustomization;
  clothing: ClothingTextureCustomization;
  accessories: AccessoryTextureCustomization[];
  metadata: Map<string, any>;
}

export interface SkinTextureCustomization {
  roughness: number;
  bumpiness: number;
  pores: number;
  wrinkles: number;
  age: number;
  metadata: Map<string, any>;
}

export interface HairTextureCustomization {
  roughness: number;
  shininess: number;
  frizz: number;
  curl: number;
  metadata: Map<string, any>;
}

export interface ClothingTextureCustomization {
  roughness: number;
  shininess: number;
  bumpiness: number;
  weave: number;
  metadata: Map<string, any>;
}

export interface AccessoryTextureCustomization {
  id: string;
  roughness: number;
  shininess: number;
  bumpiness: number;
  metadata: Map<string, any>;
}

export interface AnimationCustomization {
  id: string;
  name: string;
  type: AnimationType;
  category: AnimationCategory;
  duration: number;
  loop: boolean;
  speed: number;
  weight: number;
  blending: AnimationBlending;
  triggers: AnimationTrigger[];
  metadata: Map<string, any>;
}

export enum AnimationType {
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  JUMP = 'jump',
  ATTACK = 'attack',
  DEFEND = 'defend',
  EMOTE = 'emote',
  CUSTOM = 'custom'
}

export enum AnimationCategory {
  MOVEMENT = 'movement',
  COMBAT = 'combat',
  EMOTION = 'emotion',
  INTERACTION = 'interaction',
  CUSTOM = 'custom'
}

export interface AnimationBlending {
  type: BlendingType;
  duration: number;
  curve: AnimationCurve;
  metadata: Map<string, any>;
}

export enum BlendingType {
  LINEAR = 'linear',
  SMOOTH = 'smooth',
  CUSTOM = 'custom'
}

export interface AnimationCurve {
  keys: CurveKey[];
  mode: CurveMode;
  metadata: Map<string, any>;
}

export interface CurveKey {
  time: number;
  value: number;
  inTangent: number;
  outTangent: number;
}

export enum CurveMode {
  AUTO = 'auto',
  FREE = 'free',
  BROKEN = 'broken'
}

export interface AnimationTrigger {
  id: string;
  name: string;
  type: TriggerType;
  condition: TriggerCondition;
  action: TriggerAction;
  metadata: Map<string, any>;
}

export enum TriggerType {
  INPUT = 'input',
  COLLISION = 'collision',
  TIMER = 'timer',
  CUSTOM = 'custom'
}

export interface TriggerCondition {
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

export interface TriggerAction {
  type: ActionType;
  value: any;
  metadata: Map<string, any>;
}

export enum ActionType {
  PLAY_ANIMATION = 'play_animation',
  STOP_ANIMATION = 'stop_animation',
  BLEND_ANIMATION = 'blend_animation',
  CUSTOM = 'custom'
}

export interface PoseCustomization {
  id: string;
  name: string;
  type: PoseType;
  category: PoseCategory;
  bones: BonePose[];
  duration: number;
  ease: PoseEase;
  metadata: Map<string, any>;
}

export enum PoseType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
  TRANSITION = 'transition',
  CUSTOM = 'custom'
}

export enum PoseCategory {
  IDLE = 'idle',
  ACTION = 'action',
  EMOTION = 'emotion',
  COMBAT = 'combat',
  CUSTOM = 'custom'
}

export interface BonePose {
  boneId: string;
  position: Position3D;
  rotation: Rotation3D;
  scale: Scale3D;
  metadata: Map<string, any>;
}

export interface PoseEase {
  type: EaseType;
  intensity: number;
  metadata: Map<string, any>;
}

export enum EaseType {
  LINEAR = 'linear',
  EASE_IN = 'ease_in',
  EASE_OUT = 'ease_out',
  EASE_IN_OUT = 'ease_in_out',
  CUSTOM = 'custom'
}

export interface CustomizationPreset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  customizations: Partial<CharacterCustomization>;
  thumbnail: string;
  tags: string[];
  rating: number;
  downloads: number;
  isPublic: boolean;
  metadata: Map<string, any>;
}

export enum PresetCategory {
  FACE = 'face',
  BODY = 'body',
  HAIR = 'hair',
  CLOTHING = 'clothing',
  COMPLETE = 'complete',
  CUSTOM = 'custom'
}

export interface CustomizationTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  customizations: Partial<CharacterCustomization>;
  requirements: TemplateRequirements;
  thumbnail: string;
  tags: string[];
  rating: number;
  downloads: number;
  isPublic: boolean;
  metadata: Map<string, any>;
}

export enum TemplateCategory {
  CHARACTER = 'character',
  NPC = 'npc',
  MONSTER = 'monster',
  VEHICLE = 'vehicle',
  PET = 'pet',
  CUSTOM = 'custom'
}

export interface TemplateRequirements {
  level: number;
  stats: Partial<PlayerStats>;
  class: string[];
  race: string[];
  alignment: string[];
  items: ItemRequirement[];
  achievements: string[];
  quests: string[];
  custom: Map<string, any>;
}

export interface PlayerStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  constitution: number;
  charisma: number;
  luck: number;
  perception: number;
  endurance: number;
  agility: number;
}

export interface ItemRequirement {
  itemId: string;
  quantity: number;
  quality: ItemQuality;
  rarity: ItemRarity;
  isConsumed: boolean;
}

export enum ItemQuality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
  PERFECT = 'perfect'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export interface CustomizationMetadata {
  author: string;
  version: string;
  tags: string[];
  rating: number;
  description: string;
  customMetadata: Map<string, any>;
}

export interface CharacterCustomizationStats {
  totalCustomizations: number;
  totalPresets: number;
  totalTemplates: number;
  averageRating: number;
  totalDownloads: number;
  lastUpdate: number;
}

export class CharacterCustomizationManager {
  private config: CharacterCustomizationConfig;
  private customizations: Map<string, CharacterCustomization> = new Map();
  private presets: Map<string, CustomizationPreset> = new Map();
  private templates: Map<string, CustomizationTemplate> = new Map();
  private stats: CharacterCustomizationStats = this.initializeStats();
  private isInitialized: boolean = false;

  constructor(config: Partial<CharacterCustomizationConfig> = {}) {
    this.config = {
      enableRealTimeEditing: true,
      enableBodyMorphing: true,
      enableFacialCustomization: true,
      enableHairSystem: true,
      enableClothingSystem: true,
      enableColorEditing: true,
      enableTextureEditing: true,
      enableAnimationSystem: true,
      enablePoseSystem: true,
      enablePresetManagement: true,
      enableTemplateManagement: true,
      enableImportExport: true,
      enableUndoRedo: true,
      enablePreviewMode: true,
      enableMultiPlatform: true,
      maxCustomizations: 1000,
      maxPresets: 500,
      maxTemplates: 200,
      enableCloudSync: true,
      enableBackup: true,
      enableVersioning: true,
      ...config
    };
  }

  /**
   * Initialize character customization manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize character customization manager
      await this.initializeCharacterCustomizationManager();
      
      // Load default presets
      await this.loadDefaultPresets();
      
      // Load default templates
      await this.loadDefaultTemplates();
      
      this.isInitialized = true;
      console.log('Character customization manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize character customization manager:', error);
      return false;
    }
  }

  /**
   * Create new customization
   */
  createCustomization(customization: Partial<CharacterCustomization>): CharacterCustomization | null {
    if (this.customizations.size >= this.config.maxCustomizations) {
      console.warn('Maximum number of customizations reached');
      return null;
    }

    const newCustomization: CharacterCustomization = {
      id: `customization_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customization.name || 'New Customization',
      type: customization.type || CustomizationType.PLAYER,
      status: CustomizationStatus.DRAFT,
      appearance: customization.appearance || this.createDefaultAppearance(),
      body: customization.body || this.createDefaultBody(),
      face: customization.face || this.createDefaultFace(),
      hair: customization.hair || this.createDefaultHair(),
      clothing: customization.clothing || this.createDefaultClothing(),
      accessories: customization.accessories || [],
      colors: customization.colors || this.createDefaultColors(),
      textures: customization.textures || this.createDefaultTextures(),
      animations: customization.animations || [],
      poses: customization.poses || [],
      presets: customization.presets || [],
      templates: customization.templates || [],
      metadata: customization.metadata || this.createDefaultMetadata(),
      version: '1.0.0',
      created: Date.now(),
      modified: Date.now()
    };

    this.customizations.set(newCustomization.id, newCustomization);
    this.updateStats('create_customization', newCustomization);

    console.log(`Created customization: ${newCustomization.name}`);
    return newCustomization;
  }

  /**
   * Update customization
   */
  updateCustomization(customizationId: string, updates: Partial<CharacterCustomization>): boolean {
    const customization = this.customizations.get(customizationId);
    if (!customization) {
      console.warn(`Customization ${customizationId} not found`);
      return false;
    }

    try {
      // Update customization
      Object.assign(customization, updates);
      customization.modified = Date.now();

      // Update status if needed
      if (updates.status) {
        customization.status = updates.status;
      }

      this.updateStats('update_customization', customization);
      console.log(`Updated customization: ${customization.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to update customization ${customizationId}:`, error);
      return false;
    }
  }

  /**
   * Apply preset to customization
   */
  applyPreset(customizationId: string, presetId: string): boolean {
    const customization = this.customizations.get(customizationId);
    const preset = this.presets.get(presetId);

    if (!customization) {
      console.warn(`Customization ${customizationId} not found`);
      return false;
    }

    if (!preset) {
      console.warn(`Preset ${presetId} not found`);
      return false;
    }

    try {
      // Apply preset customizations
      if (preset.customizations.appearance) {
        Object.assign(customization.appearance, preset.customizations.appearance);
      }
      if (preset.customizations.body) {
        Object.assign(customization.body, preset.customizations.body);
      }
      if (preset.customizations.face) {
        Object.assign(customization.face, preset.customizations.face);
      }
      if (preset.customizations.hair) {
        Object.assign(customization.hair, preset.customizations.hair);
      }
      if (preset.customizations.clothing) {
        Object.assign(customization.clothing, preset.customizations.clothing);
      }

      customization.modified = Date.now();
      this.updateStats('apply_preset', customization);

      console.log(`Applied preset ${preset.name} to customization ${customization.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to apply preset ${presetId} to customization ${customizationId}:`, error);
      return false;
    }
  }

  /**
   * Create preset from customization
   */
  createPreset(customizationId: string, preset: Partial<CustomizationPreset>): CustomizationPreset | null {
    const customization = this.customizations.get(customizationId);
    if (!customization) {
      console.warn(`Customization ${customizationId} not found`);
      return null;
    }

    if (this.presets.size >= this.config.maxPresets) {
      console.warn('Maximum number of presets reached');
      return null;
    }

    const newPreset: CustomizationPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: preset.name || `${customization.name} Preset`,
      description: preset.description || '',
      category: preset.category || PresetCategory.COMPLETE,
      customizations: {
        appearance: customization.appearance,
        body: customization.body,
        face: customization.face,
        hair: customization.hair,
        clothing: customization.clothing
      },
      thumbnail: preset.thumbnail || '',
      tags: preset.tags || [],
      rating: 0,
      downloads: 0,
      isPublic: preset.isPublic || false,
      metadata: preset.metadata || new Map()
    };

    this.presets.set(newPreset.id, newPreset);
    this.updateStats('create_preset', newPreset);

    console.log(`Created preset: ${newPreset.name}`);
    return newPreset;
  }

  /**
   * Get customization
   */
  getCustomization(customizationId: string): CharacterCustomization | null {
    return this.customizations.get(customizationId) || null;
  }

  /**
   * Get all customizations
   */
  getCustomizations(): CharacterCustomization[] {
    return Array.from(this.customizations.values());
  }

  /**
   * Get customizations by type
   */
  getCustomizationsByType(type: CustomizationType): CharacterCustomization[] {
    return Array.from(this.customizations.values())
      .filter(customization => customization.type === type);
  }

  /**
   * Get preset
   */
  getPreset(presetId: string): CustomizationPreset | null {
    return this.presets.get(presetId) || null;
  }

  /**
   * Get all presets
   */
  getPresets(): CustomizationPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get presets by category
   */
  getPresetsByCategory(category: PresetCategory): CustomizationPreset[] {
    return Array.from(this.presets.values())
      .filter(preset => preset.category === category);
  }

  /**
   * Get template
   */
  getTemplate(templateId: string): CustomizationTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get all templates
   */
  getTemplates(): CustomizationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: TemplateCategory): CustomizationTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  /**
   * Get manager statistics
   */
  getManagerStats(): CharacterCustomizationStats {
    return { ...this.stats };
  }

  /**
   * Initialize character customization manager
   */
  private async initializeCharacterCustomizationManager(): Promise<void> {
    console.log('Initializing character customization manager...');
  }

  /**
   * Load default presets
   */
  private async loadDefaultPresets(): Promise<void> {
    // Load default presets
    const defaultPresets = [
      this.createDefaultFacePreset(),
      this.createDefaultBodyPreset(),
      this.createDefaultHairPreset(),
      this.createDefaultClothingPreset()
    ];

    for (const preset of defaultPresets) {
      if (preset) {
        this.presets.set(preset.id, preset);
      }
    }

    console.log(`Loaded ${defaultPresets.length} default presets`);
  }

  /**
   * Load default templates
   */
  private async loadDefaultTemplates(): Promise<void> {
    // Load default templates
    const defaultTemplates = [
      this.createDefaultCharacterTemplate(),
      this.createDefaultNPCTemplate(),
      this.createDefaultMonsterTemplate()
    ];

    for (const template of defaultTemplates) {
      if (template) {
        this.templates.set(template.id, template);
      }
    }

    console.log(`Loaded ${defaultTemplates.length} default templates`);
  }

  /**
   * Create default appearance
   */
  private createDefaultAppearance(): CharacterAppearance {
    return {
      gender: Gender.MALE,
      race: Race.HUMAN,
      age: AgeGroup.ADULT,
      bodyType: BodyType.AVERAGE,
      height: 1.8,
      weight: 70,
      skinColor: { r: 0.8, g: 0.6, b: 0.4, a: 1.0 },
      eyeColor: { r: 0.0, g: 0.5, b: 0.8, a: 1.0 },
      hairColor: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
      facialHairColor: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
      metadata: new Map()
    };
  }

  /**
   * Create default body
   */
  private createDefaultBody(): BodyCustomization {
    return {
      height: 1.8,
      weight: 70,
      muscleMass: 50,
      bodyFat: 20,
      chestSize: 100,
      waistSize: 80,
      hipSize: 90,
      shoulderWidth: 45,
      armLength: 60,
      legLength: 90,
      neckLength: 15,
      headSize: 25,
      morphing: {
        enabled: false,
        regions: [],
        intensity: 1.0,
        smoothness: 1.0,
        metadata: new Map()
      },
      scaling: {
        enabled: false,
        uniform: true,
        x: 1.0,
        y: 1.0,
        z: 1.0,
        preserveProportions: true,
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default face
   */
  private createDefaultFace(): FacialCustomization {
    return {
      headShape: {
        type: HeadShapeType.OVAL,
        width: 1.0,
        height: 1.0,
        depth: 1.0,
        roundness: 0.5,
        angularity: 0.5,
        metadata: new Map()
      },
      eyes: {
        shape: EyeShape.ALMOND,
        size: 1.0,
        spacing: 1.0,
        depth: 1.0,
        angle: 0.0,
        eyelid: {
          type: EyelidType.DOUBLE,
          thickness: 0.5,
          crease: 0.5,
          hood: 0.0,
          metadata: new Map()
        },
        eyebrow: {
          shape: EyebrowShape.ARCHED,
          thickness: 0.5,
          arch: 0.5,
          spacing: 1.0,
          length: 1.0,
          color: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
          metadata: new Map()
        },
        eyelash: {
          length: 0.5,
          thickness: 0.5,
          curl: 0.5,
          color: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
          metadata: new Map()
        },
        metadata: new Map()
      },
      nose: {
        shape: NoseShape.STRAIGHT,
        size: 1.0,
        width: 1.0,
        height: 1.0,
        bridge: {
          height: 0.5,
          width: 0.5,
          curve: 0.0,
          metadata: new Map()
        },
        tip: {
          shape: NoseTipShape.ROUND,
          size: 0.5,
          angle: 0.0,
          metadata: new Map()
        },
        nostrils: {
          size: 0.5,
          width: 0.5,
          flare: 0.0,
          metadata: new Map()
        },
        metadata: new Map()
      },
      mouth: {
        shape: MouthShape.WIDE,
        size: 1.0,
        width: 1.0,
        height: 1.0,
        fullness: 0.5,
        lips: {
          upperLip: {
            thickness: 0.5,
            fullness: 0.5,
            definition: 0.5,
            color: { r: 0.8, g: 0.4, b: 0.4, a: 1.0 }
          },
          lowerLip: {
            thickness: 0.5,
            fullness: 0.5,
            definition: 0.5,
            color: { r: 0.8, g: 0.4, b: 0.4, a: 1.0 }
          },
          cupidsBow: 0.5,
          metadata: new Map()
        },
        teeth: {
          color: { r: 1.0, g: 1.0, b: 0.9, a: 1.0 },
          alignment: TeethAlignment.STRAIGHT,
          gaps: 0.0,
          metadata: new Map()
        },
        metadata: new Map()
      },
      ears: {
        size: 1.0,
        width: 1.0,
        height: 1.0,
        angle: 0.0,
        lobe: {
          size: 0.5,
          attachment: EarLobeAttachment.FREE,
          piercing: [],
          metadata: new Map()
        },
        metadata: new Map()
      },
      jaw: {
        shape: JawShape.SQUARE,
        width: 1.0,
        height: 1.0,
        angle: 0.0,
        strength: 0.5,
        metadata: new Map()
      },
      cheeks: {
        prominence: 0.5,
        width: 1.0,
        height: 1.0,
        definition: 0.5,
        hollows: 0.0,
        metadata: new Map()
      },
      forehead: {
        height: 1.0,
        width: 1.0,
        slope: 0.0,
        prominence: 0.5,
        metadata: new Map()
      },
      chin: {
        shape: ChinShape.ROUND,
        size: 1.0,
        prominence: 0.5,
        cleft: 0.0,
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default hair
   */
  private createDefaultHair(): HairCustomization {
    return {
      style: {
        id: 'default_hair',
        name: 'Default Hair',
        type: HairType.STRAIGHT,
        category: HairCategory.MEDIUM,
        description: 'Default hair style',
        metadata: new Map()
      },
      color: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
      length: HairLength.MEDIUM,
      texture: HairTexture.MEDIUM,
      density: 1.0,
      highlights: [],
      metadata: new Map()
    };
  }

  /**
   * Create default clothing
   */
  private createDefaultClothing(): ClothingCustomization {
    return {
      items: [],
      layers: [],
      materials: [],
      colors: [],
      patterns: [],
      metadata: new Map()
    };
  }

  /**
   * Create default colors
   */
  private createDefaultColors(): ColorCustomization {
    return {
      skin: {
        base: { r: 0.8, g: 0.6, b: 0.4, a: 1.0 },
        undertone: { r: 0.7, g: 0.5, b: 0.3, a: 1.0 },
        highlights: { r: 0.9, g: 0.7, b: 0.5, a: 1.0 },
        shadows: { r: 0.6, g: 0.4, b: 0.2, a: 1.0 },
        freckles: {
          enabled: false,
          density: 0.1,
          size: 0.5,
          color: { r: 0.6, g: 0.4, b: 0.2, a: 1.0 },
          distribution: FreckleDistribution.RANDOM,
          metadata: new Map()
        },
        moles: {
          enabled: false,
          count: 0,
          size: 0.5,
          color: { r: 0.4, g: 0.2, b: 0.1, a: 1.0 },
          positions: [],
          metadata: new Map()
        },
        scars: [],
        tattoos: [],
        metadata: new Map()
      },
      hair: {
        base: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
        highlights: [],
        roots: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
        tips: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
        metadata: new Map()
      },
      eyes: {
        iris: { r: 0.0, g: 0.5, b: 0.8, a: 1.0 },
        pupil: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        sclera: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
        metadata: new Map()
      },
      clothing: {
        primary: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        secondary: { r: 0.3, g: 0.3, b: 0.3, a: 1.0 },
        accent: { r: 0.8, g: 0.2, b: 0.2, a: 1.0 },
        metadata: new Map()
      },
      accessories: [],
      metadata: new Map()
    };
  }

  /**
   * Create default textures
   */
  private createDefaultTextures(): TextureCustomization {
    return {
      skin: {
        roughness: 0.5,
        bumpiness: 0.3,
        pores: 0.2,
        wrinkles: 0.1,
        age: 0.0,
        metadata: new Map()
      },
      hair: {
        roughness: 0.3,
        shininess: 0.7,
        frizz: 0.2,
        curl: 0.0,
        metadata: new Map()
      },
      clothing: {
        roughness: 0.6,
        shininess: 0.2,
        bumpiness: 0.1,
        weave: 0.3,
        metadata: new Map()
      },
      accessories: [],
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): CustomizationMetadata {
    return {
      author: 'System',
      version: '1.0.0',
      tags: [],
      rating: 0,
      description: '',
      customMetadata: new Map()
    };
  }

  /**
   * Create default face preset
   */
  private createDefaultFacePreset(): CustomizationPreset {
    return {
      id: 'default_face_preset',
      name: 'Default Face',
      description: 'Default facial features',
      category: PresetCategory.FACE,
      customizations: {
        face: this.createDefaultFace()
      },
      thumbnail: '',
      tags: ['face', 'default'],
      rating: 0,
      downloads: 0,
      isPublic: true,
      metadata: new Map()
    };
  }

  /**
   * Create default body preset
   */
  private createDefaultBodyPreset(): CustomizationPreset {
    return {
      id: 'default_body_preset',
      name: 'Default Body',
      description: 'Default body proportions',
      category: PresetCategory.BODY,
      customizations: {
        body: this.createDefaultBody()
      },
      thumbnail: '',
      tags: ['body', 'default'],
      rating: 0,
      downloads: 0,
      isPublic: true,
      metadata: new Map()
    };
  }

  /**
   * Create default hair preset
   */
  private createDefaultHairPreset(): CustomizationPreset {
    return {
      id: 'default_hair_preset',
      name: 'Default Hair',
      description: 'Default hair style',
      category: PresetCategory.HAIR,
      customizations: {
        hair: this.createDefaultHair()
      },
      thumbnail: '',
      tags: ['hair', 'default'],
      rating: 0,
      downloads: 0,
      isPublic: true,
      metadata: new Map()
    };
  }

  /**
   * Create default clothing preset
   */
  private createDefaultClothingPreset(): CustomizationPreset {
    return {
      id: 'default_clothing_preset',
      name: 'Default Clothing',
      description: 'Default clothing style',
      category: PresetCategory.CLOTHING,
      customizations: {
        clothing: this.createDefaultClothing()
      },
      thumbnail: '',
      tags: ['clothing', 'default'],
      rating: 0,
      downloads: 0,
      isPublic: true,
      metadata: new Map()
    };
  }

  /**
   * Create default character template
   */
  private createDefaultCharacterTemplate(): CustomizationTemplate {
    return {
      id: 'default_character_template',
      name: 'Default Character',
      description: 'Default character template',
      category: TemplateCategory.CHARACTER,
      customizations: {
        appearance: this.createDefaultAppearance(),
        body: this.createDefaultBody(),
        face: this.createDefaultFace(),
        hair: this.createDefaultHair(),
        clothing: this.createDefaultClothing()
      },
      requirements: {
        level: 1,
        stats: {},
        class: [],
        race: [],
        alignment: [],
        items: [],
        achievements: [],
        quests: [],
        custom: new Map()
      },
      thumbnail: '',
      tags: ['character', 'default'],
      rating: 0,
      downloads: 0,
      isPublic: true,
      metadata: new Map()
    };
  }

  /**
   * Create default NPC template
   */
  private createDefaultNPCTemplate(): CustomizationTemplate {
    return {
      id: 'default_npc_template',
      name: 'Default NPC',
      description: 'Default NPC template',
      category: TemplateCategory.NPC,
      customizations: {
        appearance: this.createDefaultAppearance(),
        body: this.createDefaultBody(),
        face: this.createDefaultFace(),
        hair: this.createDefaultHair(),
        clothing: this.createDefaultClothing()
      },
      requirements: {
        level: 1,
        stats: {},
        class: [],
        race: [],
        alignment: [],
        items: [],
        achievements: [],
        quests: [],
        custom: new Map()
      },
      thumbnail: '',
      tags: ['npc', 'default'],
      rating: 0,
      downloads: 0,
      isPublic: true,
      metadata: new Map()
    };
  }

  /**
   * Create default monster template
   */
  private createDefaultMonsterTemplate(): CustomizationTemplate {
    return {
      id: 'default_monster_template',
      name: 'Default Monster',
      description: 'Default monster template',
      category: TemplateCategory.MONSTER,
      customizations: {
        appearance: this.createDefaultAppearance(),
        body: this.createDefaultBody(),
        face: this.createDefaultFace(),
        hair: this.createDefaultHair(),
        clothing: this.createDefaultClothing()
      },
      requirements: {
        level: 1,
        stats: {},
        class: [],
        race: [],
        alignment: [],
        items: [],
        achievements: [],
        quests: [],
        custom: new Map()
      },
      thumbnail: '',
      tags: ['monster', 'default'],
      rating: 0,
      downloads: 0,
      isPublic: true,
      metadata: new Map()
    };
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, customization: CharacterCustomization | CustomizationPreset | CustomizationTemplate): void {
    switch (action) {
      case 'create_customization':
        this.stats.totalCustomizations++;
        break;
      case 'update_customization':
        // Update existing customization
        break;
      case 'apply_preset':
        // Preset applied
        break;
      case 'create_preset':
        this.stats.totalPresets++;
        break;
    }

    this.stats.lastUpdate = Date.now();
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): CharacterCustomizationStats {
    return {
      totalCustomizations: 0,
      totalPresets: 0,
      totalTemplates: 0,
      averageRating: 0,
      totalDownloads: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.customizations.clear();
    this.presets.clear();
    this.templates.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultCharacterCustomizationManager = new CharacterCustomizationManager();
export { CharacterCustomizationManager as default };