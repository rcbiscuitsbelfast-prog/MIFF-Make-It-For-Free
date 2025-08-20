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
        public bool isSoloMode;
        public bool mustSwitchSpirit;
        // Events
        public System.Action<BattleContext> OnBattleStarted;
        public System.Action<int> OnTurnChanged;
        public System.Action<MoveResult> OnMoveResolved;
        public System.Action<bool> OnBattleEnded;

        private int _turnNumber;

        private int[] _playerSpiritHP;
        private int[] _enemySpiritHP;

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

            // Initialize per-spirit HP pools
            _playerSpiritHP = InitSpiritHpArray(playerSpirits);
            _enemySpiritHP = InitSpiritHpArray(enemySpirits);

            isSoloMode = AreAllSpiritsDown(_playerSpiritHP);
            mustSwitchSpirit = false;

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

            _turnNumber = 0;
            OnBattleStarted?.Invoke(new BattleContext
            {
                IsRival = isRivalEncounter,
                PlayerSpiritCount = playerSpirits?.Length ?? 0,
                EnemySpiritCount = enemySpirits?.Length ?? 0
            });
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
                    _turnNumber++;
                    OnTurnChanged?.Invoke(_turnNumber);
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

                    // Handle fainted player spirit
                    if (!isSoloMode && GetPlayerCurrentSpiritHP() <= 0)
                    {
                        // Check for any remaining spirits with HP > 0
                        int nextAlive = FindFirstAlive(_playerSpiritHP);
                        if (nextAlive >= 0)
                        {
                            mustSwitchSpirit = true; // UI should prompt switch
                            currentState = BattleState.PlayerTurn;
                            break;
                        }

                        // Enter Solo mode
                        isSoloMode = true;
                        mustSwitchSpirit = false;
                    }

                    currentState = BattleState.PlayerTurn;
                    _turnNumber++;
                    OnTurnChanged?.Invoke(_turnNumber);
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

        public SpiritSpecies GetCurrentPlayerSpirit()
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

            OnMoveResolved?.Invoke(new MoveResult
            {
                UserIsPlayer = userIsPlayer,
                Move = move,
                Damage = dmg
            });
        }

        private void ApplyEnemyDamage(int dmg)
        {
            if (dmg <= 0 || enemySpirits == null || enemySpirits.Length == 0) return;
            if (_enemySpiritHP == null || _enemySpiritHP.Length != enemySpirits.Length)
            {
                _enemySpiritHP = InitSpiritHpArray(enemySpirits);
            }

            _enemySpiritHP[currentEnemySpiritIndex] = Mathf.Max(0, _enemySpiritHP[currentEnemySpiritIndex] - dmg);

            // Advance to next enemy spirit if fainted
            if (_enemySpiritHP[currentEnemySpiritIndex] <= 0)
            {
                int next = FindFirstAliveFrom(_enemySpiritHP, currentEnemySpiritIndex + 1);
                if (next >= 0)
                {
                    currentEnemySpiritIndex = next;
                }
            }
        }

        private void ApplyPlayerDamage(int dmg)
        {
            playerHP = Mathf.Max(0, playerHP - dmg);
            if (!isSoloMode)
            {
                if (_playerSpiritHP == null || _playerSpiritHP.Length != (playerSpirits?.Length ?? 0))
                {
                    _playerSpiritHP = InitSpiritHpArray(playerSpirits);
                }
                _playerSpiritHP[currentPlayerSpiritIndex] = Mathf.Max(0, _playerSpiritHP[currentPlayerSpiritIndex] - dmg);
            }
        }

        // Example capture hook (call this when capture succeeds)
        public void OnSpiritCaptured(NewBark.SpiritBattles.Objects.Creatures.SpiritSpecies species)
        {
            if (species == null) return;
            var data = GameManager.Data;
            if (data == null) return;
            if (data.discoveredSpiritIDs == null) data.discoveredSpiritIDs = new System.Collections.Generic.HashSet<string>();
            data.discoveredSpiritIDs.Add(species.spiritID);
            SaveManager.Save(data);
        }

        private bool IsEnemyTeamDefeated()
        {
            if (enemySpirits == null || enemySpirits.Length == 0) return true;
            if (_enemySpiritHP == null || _enemySpiritHP.Length != enemySpirits.Length)
            {
                _enemySpiritHP = InitSpiritHpArray(enemySpirits);
            }
            return AreAllSpiritsDown(_enemySpiritHP);
        }

        private bool IsPlayerDefeated()
        {
            var noSpirits = playerSpirits == null || playerSpirits.Length == 0;
            bool spiritsAllDown = noSpirits || AreAllSpiritsDown(_playerSpiritHP);
            return playerHP <= 0 && spiritsAllDown;
        }

        private void OnBattleEnd(bool victory)
        {
            Log(victory ? "Victory!" : "Defeat...");
            battleAudioManager?.StopStems();
            // TODO: cleanup UI, rewards, return to overworld
            OnBattleEnded?.Invoke(victory);
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
            if (_playerSpiritHP == null || _playerSpiritHP.Length != playerSpirits.Length)
            {
                _playerSpiritHP = InitSpiritHpArray(playerSpirits);
            }

            if (_playerSpiritHP[index] <= 0)
            {
                Log("Cannot switch to a fainted spirit.");
                return;
            }

            currentPlayerSpiritIndex = index;
            Log($"Player switched to {playerSpirits[index].displayName}.");
            mustSwitchSpirit = false;
            currentState = BattleState.EnemyTurn; // switching consumes turn
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
                if (isSoloMode)
                {
                    // Only allow player style moves in solo mode (we'll treat signature moves as allowed)
                    bool isStyleMove = playerProfile && System.Array.IndexOf(playerProfile.signatureMoves, mv) >= 0;
                    if (!isStyleMove)
                    {
                        Log("Cannot use spirit moves in Solo Mode.");
                        return;
                    }
                }
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

        // Helpers for HP arrays and checks
        private int[] InitSpiritHpArray(SpiritSpecies[] spirits)
        {
            if (spirits == null || spirits.Length == 0) return new int[0];
            var arr = new int[spirits.Length];
            for (int i = 0; i < spirits.Length; i++)
            {
                // Use simple base stat for demo; sync acts like HP pool here
                arr[i] = Mathf.Max(1, spirits[i] ? spirits[i].sync : 1);
            }
            return arr;
        }

        private int GetPlayerCurrentSpiritHP()
        {
            if (_playerSpiritHP == null || _playerSpiritHP.Length == 0) return 0;
            return _playerSpiritHP[Mathf.Clamp(currentPlayerSpiritIndex, 0, _playerSpiritHP.Length - 1)];
        }

        // Public safe getters for UI and systems
        public int GetPlayerSpiritHP(int index)
        {
            if (_playerSpiritHP == null || index < 0 || index >= _playerSpiritHP.Length) return 0;
            return _playerSpiritHP[index];
        }

        public int PlayerSpiritCount => playerSpirits?.Length ?? 0;
        public bool MustSwitchSpirit => mustSwitchSpirit;

        private static int FindFirstAlive(int[] hp)
        {
            if (hp == null) return -1;
            for (int i = 0; i < hp.Length; i++)
            {
                if (hp[i] > 0) return i;
            }
            return -1;
        }

        private static int FindFirstAliveFrom(int[] hp, int start)
        {
            if (hp == null) return -1;
            for (int i = start; i < hp.Length; i++)
            {
                if (hp[i] > 0) return i;
            }
            return -1;
        }

        private static bool AreAllSpiritsDown(int[] hp)
        {
            if (hp == null || hp.Length == 0) return true;
            for (int i = 0; i < hp.Length; i++)
            {
                if (hp[i] > 0) return false;
            }
            return true;
        }
    }
}

