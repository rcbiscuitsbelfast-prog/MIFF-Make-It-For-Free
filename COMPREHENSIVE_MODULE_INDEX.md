# COMPREHENSIVE MODULE INDEX - 30 High-Value Modules

Generated: Mon Oct 20 10:31:54 AM UTC 2025

---

## RNGPure

**Description:**
RNGPure - Deterministic, seedable random number generation

This module provides deterministic, seedable random number generation
for modular gameplay systems. Pure TypeScript implementation with
no external dependencies.

**Structure:**
```
cliHarness.ts - 2.6K
index.ts - 4.9K
```

**Key Exports:**
- export interface IRNGProvider {
- export class RNGProvider implements IRNGProvider {
- export function createRNGProvider(seed: number): IRNGProvider {
- export const defaultRNG = new RNGProvider(12345);
- export const RNGUtils = {

**Tests:**
- simpleRNG.test.ts (8 tests)
- goldenRNGPure.test.ts (1 tests)

**Test Status:**
- ✅ PASSING

**Complexity:** Low (244 LOC)

---

## EventBusPure

**Description:**
EventBusPure - Event and Messaging System

Centralized messaging system for decoupled communication between game systems.
Provides pub/sub messaging, event routing, and network replication capabilities.


**Structure:**
```
cliHarness.ts - 12K
EventBusPure.test.ts - 2.3K
EventBusPure.ts - 19K
index.ts - 789
```

**Key Exports:**
- export const MODULE_INFO = {

**Tests:**
- EventBusPure.test.ts (15 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1178 LOC)

---

## StatePure

**STATUS:** ❌ MODULE NOT FOUND

---

## SavePure

**Description:**
SavePure - Game Save/Load System
 *
A comprehensive save and load system for handling game state persistence.
Features JSON serialization, checksum validation, version migration, and
remix-safe save data structures.

**Structure:**
```
cliHarness.ts - 23K
index.ts - 39K
SavePure.test.ts - 5.1K
```

**Key Exports:**
- export const SUPPORTED_VERSIONS = ['v1', 'v2', 'v3'] as const;
- export interface SaveValidationResult {
- export interface SaveMigrationResult {
- export interface SaveOperationResult {
- export interface IGameEntity {
- export interface ISaveSnapshot {
- export interface ISaveManager {
- export interface ISaveValidator {
- export interface ISaveMigrator {
- export interface ICompressionUtil {

**Tests:**
- SavePure.test.ts (18 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Very High (2299 LOC)

---

## SimpleGamePure

**Description:**
SimpleGamePure - Rapid Prototyping Module for MIFF
 *
A lightweight module that auto-configures basic MIFF modules for simple games.
Perfect for game jams, prototypes, and beginner developers who want to get
started quickly without complex configuration.

**Structure:**
```
cliHarness.ts - 15K
index.ts - 23K
SimpleGamePure.test.ts - 2.8K
```

**Key Exports:**
- export enum GameType {
- export enum DifficultyLevel {
- export interface SimpleGameConfig {
- export interface GameStats {
- export interface Achievement {
- export class SimpleGameBuilder {
- export class SimpleClickerGame extends SimpleGame {
- export class SimplePlatformerGame extends SimpleGame {
- export class SimpleArcadeGame extends SimpleGame {
- export class SimpleRPGGame extends SimpleGame {

**Tests:**
- SimpleGamePure.test.ts (12 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1374 LOC)

---

## AudioPure

**Description:**

**Structure:**
```
AudioPure.test.ts - 2.2K
AudioPure.ts - 23K
cliHarness.ts - 12K
cliHarnessWrapper.ts - 2.3K
index.ts - 20K
Manager.ts - 817
```

**Key Exports:**
- export enum AudioFormat {
- export enum AudioChannel {
- export enum AudioState {
- export enum AudioEffectType {
- export enum AudioBusType {
- export interface AudioSource {
- export interface AudioEffect {
- export interface AudioAutomationPoint {
- export interface AudioBus {
- export interface AudioBusSend {

**Tests:**
- AudioPure.test.ts (7 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1900 LOC)

---

## InputSystemPure

**Description:**
InputSystemPure Module

Advanced input system including input mapping, action binding,
input buffering, gesture recognition, and comprehensive input management.


**Structure:**
```
AdvancedInput.ts - 21K
cliHarness.ts - 13K
index.ts - 458
Manager.ts - 15K
```

**Key Exports:**

**Tests:**
- golden_InputSystemPure.test.ts (6 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1818 LOC)

---

## PhysicsPure

**Description:**
PhysicsPure - Module Exports
Generated: 2025-10-17

export * from './capabilities';
export * from './Manager';

**Structure:**
```
capabilities.ts - 1.6K
index.ts - 125
Manager.test.ts - 2.3K
Manager.ts - 21K
```

**Key Exports:**

**Tests:**
- Manager.test.ts (7 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1013 LOC)

---

## CollisionSystemPure

**Description:**

**Structure:**
```
cliHarness.ts - 8.7K
index.ts - 1.7K
Manager.ts - 18K
```

**Key Exports:**
- export const MODULE_INFO = {

**Tests:**
- goldenCollisionSystemPure.test.ts (1 tests)
- invariants.test.ts (1 tests)

**Test Status:**
- ✅ PASSING

**Complexity:** Medium (884 LOC)

---

## InventoryPure

**Description:**
InventoryPure - Inventory and Resource Management System

Pure, remix-safe inventory and resource management for MIFF games.
Provides item definitions, instances, inventory management, and persistence.


**Structure:**
```
cliHarness.ts - 3.7K
index.ts - 826
InventoryPure.test.ts - 18K
InventoryPure.ts - 16K
```

**Key Exports:**
- export const MODULE_INFO = {

**Tests:**
- goldenInventoryPure.test.ts (8 tests)
- InventoryPure.test.ts (43 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Medium (673 LOC)

---

## DialoguePure

**Description:**

**Structure:**
```
cliHarness.ts - 15K
DialoguePure.test.ts - 1.8K
index.ts - 248
Manager.ts - 14K
```

**Key Exports:**

**Tests:**
- DialoguePure.test.ts (5 tests)
- golden_DialoguePure.flow.test.ts (1 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Medium (937 LOC)

---

## QuestSystemPure

**Description:**

**Structure:**
```
cliHarness.ts - 956
index.ts - 11K
```

**Key Exports:**
- export interface QuestTrigger {
- export interface QuestReward {
- export interface QuestStep {
- export interface Quest {
- export interface QuestState {
- export interface QuestEvent {
- export interface QuestResult {
- export function applyQuestEvent(state: QuestState, event: QuestEvent): QuestResult {
- export function applyQuestEvents(state: QuestState, events: QuestEvent[]): QuestResult {
- export function createQuest(

**Tests:**
- golden_QuestSystemPure.test.ts (3 tests)

**Test Status:**
- ✅ PASSING

**Complexity:** Medium (411 LOC)

---

## CombatCorePure

**Description:**

**Structure:**
```
cliHarness.ts - 1.7K
cliHarnessWrapper.ts - 4.2K
CombatManager.ts - 1.3K
index.ts - 35K
Manager.ts - 48
```

**Key Exports:**
- export enum CombatType {
- export enum DamageType {
- export enum CombatState {
- export enum CombatPhase {
- export enum CombatResult {
- export interface CombatEntity {
- export interface CombatStats {
- export interface DamageResistances {
- export interface StatusEffect {
- export interface StatModifier {

**Tests:**
- goldenCombatCorePure.test.ts (1 tests)
- goldenCombatCorePure.edge.test.ts (0
0 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1467 LOC)

---

## NPCsPure

**Description:**
NPCsPure Module

Comprehensive NPC management system including behavior simulation,
quest integration, faction management, and location tracking.


**Structure:**
```
cliHarness.ts - 11K
index.ts - 605
Manager.ts - 16K
```

**Key Exports:**

**Tests:**
- goldenNPCsPure.test.ts (7 tests)
- golden_NPCsPure.test.ts (21 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Medium (952 LOC)

---

## PathfindingPure

**Description:**
PathfindingPure Module

Advanced pathfinding system including A* algorithm, grid management,
dynamic obstacles, path optimization, and comprehensive pathfinding workflows.


**Structure:**
```
cliHarness.ts - 1.5K
index.ts - 475
PathfindingManager.ts - 19K
```

**Key Exports:**

**Tests:**
- golden_PathfindingPure.test.ts (13 tests)
- goldenPathfindingPure.edge.test.ts (0
0 tests)
- fuzz_pathfinding.test.ts (1 tests)
- goldenPathfindingPure.test.ts (1 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Medium (746 LOC)

---

## ProgressionPure

**Description:**
ProgressionPure Module - AAA Quality XP and Leveling System
 *
Advanced progression mechanics with:
- XP gain and level management
- Multiple XP curve types

**Structure:**
```
cliHarness.ts - 16K
index.ts - 1.7K
Manager.ts - 9.6K
```

**Key Exports:**
- export interface SpiritInstance {
- export interface LevelUpEffect {
- export interface XPCurve {
- export interface ProgressionStats {
- export interface XPManagerConfig {

**Tests:**
- golden_ProgressionPure.test.ts (38 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Medium (943 LOC)

---

## EquipmentPure

**Description:**
EquipmentPure Module

Advanced equipment management system including stat modifiers,
equipment sets, durability, enchantments, and comprehensive equipment workflows.


**Structure:**
```
cliHarness.ts - 3.2K
cliHarnessWrapper.ts - 1.8K
EquipmentManager.ts - 21K
index.ts - 533
Manager.ts - 1.4K
```

**Key Exports:**

**Tests:**
- enhancedEquipment.test.ts (7 tests)
- goldenEquipment.test.ts (1 tests)
- golden_EquipmentPure.errors.test.ts (1 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1020 LOC)

---

## FusionPure

**Description:**
FusionPure Module - AAA Quality Spirit Fusion System
 *
Advanced fusion mechanics with:
- Spirit combination and evolution
- Rule-based fusion validation

**Structure:**
```
cliHarness.ts - 16K
index.ts - 2.1K
Manager.ts - 9.7K
Rules.ts - 12K
```

**Key Exports:**
- export interface FusionTrait {
- export interface FusionPairRule {
- export interface PlayerContext {
- export interface FusionResult {
- export interface FusionStats {
- export interface FusionRulesStats {

**Tests:**
- golden_FusionPure.test.ts (33 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1325 LOC)

---

## ModdingPure

**Description:**
ModdingPure - Module Exports
Generated: 2025-10-17

export * from './ModdingPure';

**Structure:**
```
cliHarness.ts - 7.8K
index.ts - 97
ModdingPure.test.ts - 17K
ModdingPure.ts - 21K
```

**Key Exports:**

**Tests:**
- goldenModdingPure.test.ts (13 tests)
- ModdingPure.test.ts (26 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1023 LOC)

---

## SyncPure

**Description:**

**Structure:**
```
cliHarness.ts - 15K
index.ts - 79
Manager.ts - 13K
```

**Key Exports:**

**Tests:**
- golden_SyncPure.test.ts (66 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Medium (944 LOC)

---

## ValidationPure

**Description:**
ValidationPure Module

Advanced validation system including rule-based validation,
custom validators, validation reports, and comprehensive validation workflows.


**Structure:**
```
cliHarness.ts - 11K
index.ts - 846
Manager.ts - 2.8K
```

**Key Exports:**

**Tests:**
- goldenValidationPure.test.ts (1 tests)
- golden_ValidationPure.errors.test.ts (1 tests)
- golden_ValidationPure.test.ts (18 tests)

**Test Status:**
- ✅ PASSING

**Complexity:** Medium (409 LOC)

---

## LogPure

**Description:**

**Structure:**
```
cliHarness.ts - 17K
index.ts - 78
Manager.ts - 38K
```

**Key Exports:**

**Tests:**
- golden_LogPure.test.ts (12 tests)

**Test Status:**
- ✅ PASSING

**Complexity:** Very High (2076 LOC)

---

## SessionManifestPure

**Description:**

**Structure:**
```
cliHarness.ts - 16K
cliHarnessWrapper.ts - 3.0K
index.ts - 1016
Manager.ts - 9.7K
```

**Key Exports:**
- export interface SessionPlayerRef {
- export interface SessionManifest {
- export class SessionManifestPure {

**Tests:**
- golden_SessionManifestPure.test.ts (10 tests)
- session.test.ts (1 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** High (1004 LOC)

---

## PlayerStatePure

**Description:**
PlayerStatePure - stateless movement/interaction/animation state reducer

export type Facing = 'up'|'down'|'left'|'right';
export interface Vec2 { x: number; y: number }


**Structure:**
```
cliHarness.ts - 9.0K
index.ts - 3.9K
```

**Key Exports:**
- export interface Vec2 { x: number; y: number }
- export interface PlayerConfig { speed: number; }
- export interface PlayerState {
- export function createPlayerState(): PlayerState { return { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, facing: 'down', anim: 'idle' }; }
- export function reducePlayer(state: PlayerState, action: PlayerAction, cfg: PlayerConfig): PlayerState {
- export interface Vector2 { x: number; y: number }
- export interface InputState {
- export interface PlayerIdentity {
- export interface PlayerAvatarRef {
- export interface PlayerStateSnapshot {

**Tests:**
- state.test.ts (1 tests)
- golden_PlayerStatePure.test.ts (2 tests)

**Test Status:**
- ✅ PASSING

**Complexity:** Medium (404 LOC)

---

## PixelAnimPure

**Description:**

**Structure:**
```
Animator.ts - 929
cliHarness.ts - 18K
cliHarnessWrapper.ts - 2.5K
index.ts - 2.4K
Manager.ts - 16K
```

**Key Exports:**
- export interface AnimationFrame {
- export interface Animation {
- export interface SpriteSheet {
- export const PixelAnimPure = {

**Tests:**
- animation.test.ts (4 tests)
- golden_PixelAnimPure.test.ts (14 tests)

**Test Status:**
- ✅ PASSING

**Complexity:** High (1351 LOC)

---

## RenderWorldPure

**Description:**
RenderWorld Pure - Real-Time AI-Native Game Preview Engine
 *
The central hub scene for navigating between MIFF demo worlds, showcasing
modular rendering capabilities with Superhot-inspired aesthetics.
 *

**Structure:**
```
AdvancedRendering.ts - 20K
cliHarness.ts - 946
index.ts - 46K
RenderWorldPure.test.ts - 4.4K
webBridge.ts - 22K
```

**Key Exports:**
- export class RenderWorldPure {
- export function renderWorldDemo(): any {

**Tests:**
- RenderWorldPure.test.ts (12 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Very High (3160 LOC)

---

## SlicePure

**Description:**
SlicePure - Overworld Battle Vertical Slice
 *
A comprehensive vertical slice demonstration showing a complete game loop:
overworld encounter generation → battle execution → logging and output.
This tool demonstrates how all the MIFF modules work together in practice.

**Structure:**
```
cliHarness.ts - 24K
index.ts - 41K
SlicePure.test.ts - 3.0K
```

**Key Exports:**
- export enum ActionSource {
- export enum MoveCategory {
- export enum TriggerType {
- export enum TimeOfDay {
- export interface IPlayerState {
- export interface IEncounterTableEntry {
- export interface IEncounterTable {
- export interface IEncounterTrigger {
- export interface IEncounterResult {
- export interface IEncounterController {

**Tests:**
- SlicePure.test.ts (10 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Very High (2265 LOC)

---

## AudioMixerPure

**Description:**
AudioMixerPure
Auto-generated index file

export * from './AudioMixerPure';


**Structure:**
```
AudioMixerPure.test.ts - 3.4K
AudioMixerPure.ts - 27K
cliHarness.ts - 1.3K
index.ts - 146
```

**Key Exports:**

**Tests:**
- AudioMixerPure.test.ts (11 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Medium (937 LOC)

---

## ButtonStylePure

**Description:**
ButtonStylePure - Stateless Button Styling Presets

Provides stateless button styling presets and theme management for consistent
UI design across the MIFF framework.


**Structure:**
```
ButtonStylePure.test.ts - 4.1K
index.ts - 18K
```

**Key Exports:**
- export enum ButtonVariant {
- export enum ButtonSize {
- export enum ButtonState {
- export interface ButtonStyle {
- export interface ButtonTheme {
- export class ButtonStyleManager {
- export const buttonStyleManager = new ButtonStyleManager();

**Tests:**
- ButtonStylePure.test.ts (14 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Medium (645 LOC)

---

## CreaturesPure

**Structure:**
```
cliHarness.ts - 3.7K
CreaturesPure.test.ts - 2.3K
```

**Tests:**
- CreaturesPure.test.ts (6 tests)

**Test Status:**
- ❌ FAILING

**Complexity:** Low (65 LOC)

---


# Analysis Complete
