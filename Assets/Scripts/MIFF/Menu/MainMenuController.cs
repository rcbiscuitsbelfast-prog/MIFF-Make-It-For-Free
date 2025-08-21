using System;
using System.Collections.Generic;
using MIFF.Core;

namespace MIFF.Menu
{
    /// <summary>
    /// Pure C# main menu controller that manages menu state and integrates with the SaveManager.
    /// Designed to be remix-safe and console/headless friendly.
    /// </summary>
    [Serializable]
    public class MainMenuController
    {
        // Dependencies
        private readonly SaveManager saveManager;
        private readonly SaveSlotSelector saveSlotSelector;
        private readonly SceneNavigator sceneNavigator;

        // State
        public MenuState CurrentState { get; private set; } = MenuState.Main;

        // Events for external systems or test harnesses
        public event Action OnNewGame;
        public event Action<string> OnContinueGame; // slotID
        public event Action OnOpenSettings;
        public event Action OnExit;

        public MainMenuController(SaveManager saveManager, SaveSlotSelector saveSlotSelector, SceneNavigator sceneNavigator)
        {
            this.saveManager = saveManager ?? new SaveManager();
            this.saveSlotSelector = saveSlotSelector ?? new SaveSlotSelector(this.saveManager);
            this.sceneNavigator = sceneNavigator ?? new SceneNavigator();

            // Wire save slot selector callback into continue flow
            this.saveSlotSelector.OnSaveSlotSelected += HandleSaveSlotSelected;
        }

        /// <summary>
        /// Move to the main menu root.
        /// </summary>
        public void GoToMain()
        {
            CurrentState = MenuState.Main;
        }

        /// <summary>
        /// Start a new game (emits event and leaves navigation to listener).
        /// </summary>
        public void NewGame()
        {
            CurrentState = MenuState.Main;
            OnNewGame?.Invoke();
        }

        /// <summary>
        /// Enter continue flow by listing saves and moving to SaveSelect state.
        /// </summary>
        public IReadOnlyList<string> Continue()
        {
            CurrentState = MenuState.SaveSelect;
            return saveManager.ListSaveSlots();
        }

        /// <summary>
        /// Open settings state.
        /// </summary>
        public void OpenSettings()
        {
            CurrentState = MenuState.Settings;
            OnOpenSettings?.Invoke();
        }

        /// <summary>
        /// Enter confirm-exit state; caller should confirm/deny.
        /// </summary>
        public void ConfirmExit()
        {
            CurrentState = MenuState.ConfirmExit;
        }

        /// <summary>
        /// Confirm and emit exit event.
        /// </summary>
        public void Exit()
        {
            OnExit?.Invoke();
        }

        /// <summary>
        /// Delegate to selector to choose a save slot by id.
        /// </summary>
        public void SelectSaveSlot(string slotID)
        {
            if (CurrentState != MenuState.SaveSelect)
                CurrentState = MenuState.SaveSelect;
            saveSlotSelector.Select(slotID);
        }

        private void HandleSaveSlotSelected(string slotID)
        {
            // Attempt to load the save and emit continue
            var data = saveManager.LoadGame(slotID);
            if (data != null)
            {
                OnContinueGame?.Invoke(slotID);
            }
            else
            {
                // stay in SaveSelect; external UI could show an error
            }
        }
    }
}

