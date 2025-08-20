using System;
using System.Collections.Generic;
using NewBark.Battle.Audio;
using NewBark.SpiritBattles;
using NewBark.SpiritBattles.Objects.Creatures;
using NewBark.SpiritBattles.Objects.Encounters;
using NewBark.SpiritBattles.Objects.Items;
using NewBark.SpiritBattles.Objects.Moves;
using NewBark.SpiritBattles.Objects.Player;
using UnityEngine;
using Random = UnityEngine.Random;

namespace NewBark.Battle
{
    public class BattleController : MonoBehaviour
    {
        [Header("Config/Refs")] 
        public PlayerProfile playerProfile;
        public SpiritSpecies[] playerSpirits; // runtime roster
        public SpiritSpecies[] enemySpirits;  // runtime roster
        public EncounterTable currentEncounterTable;
        public bool isRivalEncounter;

        [Header("Audio (optional)")] 
        [SerializeField] private BattleAudioManager battleAudioManager;
        [SerializeField] private AudioClip wildBaseTrack;
        [SerializeField] private AudioClip rivalBaseTrack;

        [Header("State (runtime)")]
        public BattleState currentState = BattleState.Idle;
        public int playerHP;
        public int currentPlayerSpiritIndex;
        public int currentEnemySpiritIndex;

        private readonly List<string> _battleLog = new List<string>();

        // Base tracks are started inside StartBattle() based on encounter type

        public void StartBattle(EncounterTable table, bool isRival)
        {
            currentEncounterTable = table;
            isRivalEncounter = isRival;

            if (!isRivalEncounter)
            {
                // Wild encounter: roll 1 enemy from table
                var entry = table ? table.GetRandomEncounter(TerrainType.Grass, TimeOfDay.Any) : null;
                if (entry != null && entry.species != null)
                {
                    enemySpirits = new[] { entry.species };
                }
                else
                {
                    enemySpirits = Array.Empty<SpiritSpecies>();
                }
            }
            else
            {
                // Rival encounter: assume enemySpirits already assigned by caller/designer
                if (enemySpirits == null) enemySpirits = Array.Empty<SpiritSpecies>();
            }

            currentPlayerSpiritIndex = 0;
            currentEnemySpiritIndex = 0;
            playerHP = playerProfile ? Mathf.Max(1, playerProfile.HP) : 100;

            _battleLog.Clear();
            Log($"Battle started. Player HP: {playerHP}. Player Spirits: {playerSpirits?.Length ?? 0}, Enemy Spirits: {enemySpirits?.Length ?? 0}");

            // Start base track depending on encounter type
            if (battleAudioManager)
            {
                if (isRival && rivalBaseTrack != null)
                {
                    battleAudioManager.PlayBaseTrack(rivalBaseTrack);
                }
                else if (wildBaseTrack != null)
                {
                    battleAudioManager.PlayBaseTrack(wildBaseTrack);
                }
            }

            currentState = BattleState.Intro;
        }

        private void Update()
        {
            switch (currentState)
            {
                case BattleState.Idle:
                    break;
                case BattleState.Intro:
                    // TODO: Show intro UI/animations
                    currentState = BattleState.PlayerTurn;
                    break;
                case BattleState.PlayerTurn:
                    // Wait for UI to feed an action; noop here. Designer should show command panel via UI.
                    break;
                case BattleState.EnemyTurn:
                    var enemyMove = GetDefaultEnemyMove();
                    ResolveMove(userIsPlayer: false, enemyMove);
                    currentState = BattleState.Resolve;
                    break;
                case BattleState.Resolve:
                    // Minimal check for defeat/victory
                    if (IsEnemyTeamDefeated())
                    {
                        currentState = BattleState.Victory;
                        break;
                    }

                    if (IsPlayerDefeated())
                    {
                        currentState = BattleState.Defeat;
                        break;
                    }

                    currentState = BattleState.PlayerTurn;
                    break;
                case BattleState.Victory:
                    OnBattleEnd(true);
                    currentState = BattleState.Idle;
                    break;
                case BattleState.Defeat:
                    OnBattleEnd(false);
                    currentState = BattleState.Idle;
                    break;
            }
        }

        private SongMove GetDefaultPlayerMove()
        {
            var spirit = GetCurrentPlayerSpirit();
            if (spirit && spirit.moveSet != null && spirit.moveSet.Length > 0)
            {
                return spirit.moveSet[0];
            }
            return null;
        }

        private SongMove GetDefaultEnemyMove()
        {
            var spirit = GetCurrentEnemySpirit();
            if (spirit && spirit.moveSet != null && spirit.moveSet.Length > 0)
            {
                return spirit.moveSet[Random.Range(0, spirit.moveSet.Length)];
            }
            return null;
        }

        private SpiritSpecies GetCurrentPlayerSpirit()
        {
            if (playerSpirits == null || playerSpirits.Length == 0) return null;
            currentPlayerSpiritIndex = Mathf.Clamp(currentPlayerSpiritIndex, 0, playerSpirits.Length - 1);
            return playerSpirits[currentPlayerSpiritIndex];
        }

        private SpiritSpecies GetCurrentEnemySpirit()
        {
            if (enemySpirits == null || enemySpirits.Length == 0) return null;
            currentEnemySpiritIndex = Mathf.Clamp(currentEnemySpiritIndex, 0, enemySpirits.Length - 1);
            return enemySpirits[currentEnemySpiritIndex];
        }

        private void ResolveMove(bool userIsPlayer, SongMove move)
        {
            if (move == null)
            {
                Log((userIsPlayer ? "Player" : "Enemy") + " has no move.");
                return;
            }

            // Simple damage placeholder based on move power with ±10% variance
            int dmg = Mathf.Max(0, Mathf.RoundToInt(move.power * (1f + Random.Range(-0.1f, 0.1f))));

            if (userIsPlayer)
            {
                ApplyEnemyDamage(dmg);
            }
            else
            {
                ApplyPlayerDamage(dmg);
            }

            Log($"{(userIsPlayer ? "Player" : "Enemy")} used {move.displayName} and dealt {dmg}.");

            // Optional stem playback
            if (battleAudioManager && move.stemClip)
            {
                // Audio manager schedules stems to bar boundaries when beat sync is enabled
                battleAudioManager.PlayMoveStem(move.stemClip);
            }
        }

        private void ApplyEnemyDamage(int dmg)
        {
            // In a more complete system, enemy HP would be tracked per spirit. Here we simulate by removing spirits.
            if (dmg <= 0 || enemySpirits == null || enemySpirits.Length == 0) return;
            currentEnemySpiritIndex++;
            if (currentEnemySpiritIndex >= enemySpirits.Length)
            {
                currentEnemySpiritIndex = enemySpirits.Length - 1;
            }
        }

        private void ApplyPlayerDamage(int dmg)
        {
            playerHP = Mathf.Max(0, playerHP - dmg);
        }

        private bool IsEnemyTeamDefeated()
        {
            // Minimal logic: once we've advanced beyond last enemy, consider victory
            return enemySpirits == null || enemySpirits.Length == 0 || currentEnemySpiritIndex >= enemySpirits.Length - 1;
        }

        private bool IsPlayerDefeated()
        {
            var noSpirits = playerSpirits == null || playerSpirits.Length == 0;
            return playerHP <= 0 && noSpirits;
        }

        private void OnBattleEnd(bool victory)
        {
            Log(victory ? "Victory!" : "Defeat...");
            battleAudioManager?.StopStems();
            // TODO: cleanup UI, rewards, return to overworld
        }

        private void Log(string msg)
        {
            _battleLog.Add(msg);
            Debug.Log("[Battle] " + msg);
        }

        // Example public API for switching spirits and using items
        public void SwitchPlayerSpirit(int index)
        {
            if (playerSpirits == null || index < 0 || index >= playerSpirits.Length) return;
            currentPlayerSpiritIndex = index;
            Log($"Player switched to {playerSpirits[index].displayName}.");
            // Typically ends turn; caller should manage state advance.
        }

        public void UseItem(BattleItem item)
        {
            if (item == null) return;
            switch (item.effectType)
            {
                case ItemEffectType.HealHP:
                    playerHP = Mathf.Min(playerHP + item.effectValue, playerProfile ? playerProfile.HP : 100);
                    Log($"Used {item.displayName}, healed {item.effectValue} HP.");
                    break;
                case ItemEffectType.Revive:
                    // Minimal: restore some HP if 0
                    if (playerHP <= 0)
                    {
                        playerHP = Mathf.Clamp(item.effectValue, 1, playerProfile ? playerProfile.HP : 100);
                        Log($"Used {item.displayName}, revived to {playerHP} HP.");
                    }
                    break;
                default:
                    Log($"Used {item.displayName}. No implemented effect.");
                    break;
            }
        }

        // New: receive player action from UI, then advance state
        public void ReceivePlayerAction(object action)
        {
            if (currentState != BattleState.PlayerTurn) return;

            if (action is SongMove mv)
            {
                ResolveMove(true, mv);
                currentState = BattleState.EnemyTurn;
                return;
            }

            if (action is BattleItem item)
            {
                UseItem(item);
                currentState = BattleState.EnemyTurn;
                return;
            }

            if (action is SpiritSpecies spirit)
            {
                // Switch to the requested spirit if present in roster
                var idx = System.Array.IndexOf(playerSpirits, spirit);
                if (idx >= 0)
                {
                    SwitchPlayerSpirit(idx);
                }
                currentState = BattleState.EnemyTurn;
                return;
            }

            Log("Unknown action type");
        }

        // Optional escape attempt stub (UI Run button)
        public void AttemptEscape()
        {
            // Minimal: always succeed for now
            Log("Escaped!");
            OnBattleEnd(false);
            currentState = BattleState.Idle;
        }
    }
}

