using System.Collections.Generic;
using System.Linq;
using NewBark.Localization;
using NewBark.State;
using NewBark.QuestsPure;
using NewBark.InventoryPure;
using UnityEngine;

namespace NewBark.Dialog
{
    public class DialogManager : MonoBehaviour
    {
        public static DialogManager Instance { get; private set; }

        private GameData.DialogEntry currentDialog;
        private GameData.LineEntry currentLine;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("DialogManager initialized (singleton, DontDestroyOnLoad).");
        }

        public bool StartDialog(string dialogId)
        {
            currentDialog = GameManager.Data.dialogs.FirstOrDefault(d => d.id == dialogId);
            if (currentDialog == null || currentDialog.lines == null || currentDialog.lines.Length == 0)
            {
                Debug.LogWarning("DialogManager: Dialog not found or empty: " + dialogId);
                return false;
            }
            currentLine = currentDialog.lines[0];
            return true;
        }

        public string GetCurrentLine()
        {
            return currentLine == null ? string.Empty : LocalizationManager.Instance.T(currentLine.textId);
        }

        public (string choiceId, string text)[] GetChoices()
        {
            if (currentLine?.choices == null) return new (string, string)[0];
            return currentLine.choices.Select((c, idx) => ($"{idx}", LocalizationManager.Instance.T(c.textId))).ToArray();
        }

        public bool SelectChoice(string choiceId)
        {
            if (currentLine?.choices == null) return false;
            if (!int.TryParse(choiceId, out var idx)) return false;
            if (idx < 0 || idx >= currentLine.choices.Length) return false;
            var choice = currentLine.choices[idx];

            // triggers
            if (!string.IsNullOrEmpty(choice.startQuestId))
            {
                QuestManager.Instance.SetFlag(choice.startQuestId, 0, "Active");
            }
            if (!string.IsNullOrEmpty(choice.rewardItemId) && choice.rewardQty > 0)
            {
                InventoryManager.Instance.AddItem(choice.rewardItemId, choice.rewardQty);
            }

            if (!string.IsNullOrEmpty(choice.nextLineId))
            {
                var next = currentDialog.lines.FirstOrDefault(l => l.id == choice.nextLineId);
                if (next != null)
                {
                    currentLine = next;
                    return true;
                }
            }

            // end of dialog if no next
            currentLine = null;
            return true;
        }
    }
}