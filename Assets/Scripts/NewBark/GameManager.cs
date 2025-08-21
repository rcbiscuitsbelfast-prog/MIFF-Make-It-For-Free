using System;
using NewBark.Audio;
using NewBark.Dialog;
using NewBark.Input;
using NewBark.State;
using NewBark.Support;
using NewBark.Tilemap;
using UnityEngine;
using UnityEngine.Events;
using NewBark.QuestsPure;
using NewBark.InventoryPure;
using NewBark.Localization;
using NewBark.Creatures;
using NewBark.Lore;
using NewBark.Settings;
using NewBark.World;
using NewBark.WorldLayout;
using NewBark.Movement;
using NewBark.XP;

namespace NewBark
{
    public class GameManager : MonoBehaviour
    {
        public const int DefaultLayer = 0;
        public const int TransparentFxLayer = 1;
        public const int IgnoreRaycastLayer = 2;
        public const int CollisionsLayer = 8;
        public static GameData Data { get; set; }
        public static PlayerController Player => Singleton<PlayerController>.Instance;
        public static InputController Input => Singleton<InputController>.Instance;
        public static AudioController Audio => Singleton<AudioController>.Instance;
        public static DialogController Dialog => Singleton<DialogController>.Instance;

        public bool autoLoad;
        public bool autoSave;
        public UnityEvent onLoadState;
        public UnityEvent onBeforeLoadState;
        public UnityEvent onBeforeSaveState;
        public UnityEvent onSaveState;

        private void Awake()
        {
            // Ensure QuestManager exists before state load
            if (QuestManager.Instance == null)
            {
                var go = new GameObject("QuestManager");
                go.AddComponent<QuestManager>();
                Debug.Log("QuestManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure InventoryManager exists before state load
            if (InventoryManager.Instance == null)
            {
                var go2 = new GameObject("InventoryManager");
                go2.AddComponent<InventoryManager>();
                Debug.Log("InventoryManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure LocalizationManager exists
            if (LocalizationManager.Instance == null)
            {
                var go3 = new GameObject("LocalizationManager");
                go3.AddComponent<LocalizationManager>();
                Debug.Log("LocalizationManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure DialogManager exists
            if (DialogManager.Instance == null)
            {
                var go4 = new GameObject("DialogManager");
                go4.AddComponent<DialogManager>();
                Debug.Log("DialogManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure PartyManager exists
            if (PartyManager.Instance == null)
            {
                var go5 = new GameObject("PartyManager");
                go5.AddComponent<PartyManager>();
                Debug.Log("PartyManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure EncounterManager exists
            if (EncounterManager.Instance == null)
            {
                var go6 = new GameObject("EncounterManager");
                go6.AddComponent<EncounterManager>();
                Debug.Log("EncounterManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure SpeciesDatabase exists
            if (SpeciesDatabase.Instance == null)
            {
                var go7 = new GameObject("SpeciesDatabase");
                go7.AddComponent<SpeciesDatabase>();
                Debug.Log("SpeciesDatabase was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure CodexManager exists
            if (CodexManager.Instance == null)
            {
                var go8 = new GameObject("CodexManager");
                go8.AddComponent<CodexManager>();
                Debug.Log("CodexManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure LoreDatabase exists
            if (LoreDatabase.Instance == null)
            {
                var go9 = new GameObject("LoreDatabase");
                go9.AddComponent<LoreDatabase>();
                Debug.Log("LoreDatabase was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure SettingsManager exists
            if (SettingsManager.Instance == null)
            {
                var go10 = new GameObject("SettingsManager");
                go10.AddComponent<SettingsManager>();
                Debug.Log("SettingsManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure AudioMixerManager exists
            if (AudioMixerManager.Instance == null)
            {
                var go11 = new GameObject("AudioMixerManager");
                go11.AddComponent<AudioMixerManager>();
                Debug.Log("AudioMixerManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure WorldEnhancementsManager exists
            if (WorldEnhancementsManager.Instance == null)
            {
                var go12 = new GameObject("WorldEnhancementsManager");
                go12.AddComponent<WorldEnhancementsManager>();
                Debug.Log("WorldEnhancementsManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure MapManager exists
            if (MapManager.Instance == null)
            {
                var go13 = new GameObject("MapManager");
                go13.AddComponent<MapManager>();
                Debug.Log("MapManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure NPCMovementManager exists
            if (NPCMovementManager.Instance == null)
            {
                var go14 = new GameObject("NPCMovementManager");
                go14.AddComponent<NPCMovementManager>();
                Debug.Log("NPCMovementManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure LevelUpManager exists
            if (LevelUpManager.Instance == null)
            {
                var go15 = new GameObject("LevelUpManager");
                go15.AddComponent<LevelUpManager>();
                Debug.Log("LevelUpManager was missing in scene. Auto-instantiated by GameManager.");
            }
            // Ensure XPManager exists
            if (XPManager.Instance == null)
            {
                var go16 = new GameObject("XPManager");
                go16.AddComponent<XPManager>();
                Debug.Log("XPManager was missing in scene. Auto-instantiated by GameManager.");
            }
        }

        private void Start()
        {
            LoadState();
        }

        private void Update()
        {
            Data.playTime += Time.deltaTime;
        }

        private void OnApplicationQuit()
        {
            SaveState();
        }

        private void LoadState()
        {
            if (!autoLoad)
            {
                Data = new GameData();
                return;
            }

            onBeforeLoadState.Invoke();
            Data = SaveManager.Load();
            if (Data is null)
            {
                Data = new GameData();
                return;
            }

            //
            Player.transform.position = Data.playerPosition;
            Player.playerAnimationController.UpdateAnimation(Data.playerDirection, Data.playerDirection);
            AreaTitleTrigger.SwitchTo(Data.areaTitleTrigger);
            //
            onLoadState.Invoke();
        }

        private void SaveState()
        {
            if (!autoSave)
            {
                return;
            }

            onBeforeSaveState.Invoke();
            Data.saveDate = DateTime.Now;
            //
            Data.areaTitleTrigger = AreaTitleTrigger.LastTriggerName;
            Data.playerPosition = Player.transform.position;
            Data.playerDirection = Player.playerAnimationController.GetLastAnimationDirection();
            //
            SaveManager.Save(Data);
            onSaveState.Invoke();
        }
    }
}
