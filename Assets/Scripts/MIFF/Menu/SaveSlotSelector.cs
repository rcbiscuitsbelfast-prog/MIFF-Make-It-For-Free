using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Core;

namespace MIFF.Menu
{
    /// <summary>
    /// Pure C# save slot selector that queries SaveManager and emits selection events.
    /// </summary>
    [Serializable]
    public class SaveSlotSelector
    {
        private readonly SaveManager saveManager;
        private readonly List<string> cachedSlots = new List<string>();
        private int currentIndex = -1;

        public event Action<string> OnSaveSlotSelected; // slotID

        public SaveSlotSelector(SaveManager saveManager)
        {
            this.saveManager = saveManager ?? new SaveManager();
            Refresh();
        }

        /// <summary>
        /// Refresh local slot list from SaveManager.
        /// </summary>
        public void Refresh()
        {
            cachedSlots.Clear();
            cachedSlots.AddRange(saveManager.ListSaveSlots().OrderBy(s => s));
            currentIndex = cachedSlots.Count > 0 ? 0 : -1;
        }

        public IReadOnlyList<string> GetSlots() => cachedSlots;

        public string GetCurrentSelection()
        {
            return currentIndex >= 0 && currentIndex < cachedSlots.Count ? cachedSlots[currentIndex] : null;
        }

        public void Next()
        {
            if (cachedSlots.Count == 0) return;
            currentIndex = (currentIndex + 1) % cachedSlots.Count;
        }

        public void Previous()
        {
            if (cachedSlots.Count == 0) return;
            currentIndex = (currentIndex - 1 + cachedSlots.Count) % cachedSlots.Count;
        }

        public void Select(string slotID)
        {
            if (string.IsNullOrEmpty(slotID)) return;
            int idx = cachedSlots.IndexOf(slotID);
            if (idx >= 0)
            {
                currentIndex = idx;
                OnSaveSlotSelected?.Invoke(slotID);
            }
        }

        public void ConfirmCurrent()
        {
            var slot = GetCurrentSelection();
            if (!string.IsNullOrEmpty(slot))
            {
                OnSaveSlotSelected?.Invoke(slot);
            }
        }
    }
}

