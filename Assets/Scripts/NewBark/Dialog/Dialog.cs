using NewBark.Input;
using UnityEngine;
using NewBark.QuestsPure;

namespace NewBark.Dialog
{
    public class Dialog : MonoBehaviour
    {
        [TextArea(2, 10)] public string text;

        [Header("Quest Trigger (optional)")]
        public string questId;
        public int questStep = -1;
        public string questStatus; // Active | Completed | Failed

        [Header("Gate by Quest (optional)")]
        public string requireQuestId;
        public string requireStatus; // Active | Completed | Failed
        public int requireMinStep = -1;

        public void Interact(GameButton button)
        {
            var isAb = button == GameButton.A || button == GameButton.B;

            if (button == GameButton.None || !isAb)
            {
                return;
            }

            // Gate dialog by quest state (if configured)
            if (!string.IsNullOrEmpty(requireQuestId))
            {
                var ok = true;
                if (!string.IsNullOrEmpty(requireStatus))
                {
                    if (requireStatus == "Completed") ok = QuestManager.Instance.IsCompleted(requireQuestId);
                    else if (requireStatus == "Active") ok = QuestManager.Instance.IsActive(requireQuestId);
                }
                if (requireMinStep >= 0)
                {
                    ok = ok && QuestManager.Instance.GetStep(requireQuestId) >= requireMinStep;
                }
                if (!ok)
                {
                    return; // gated out
                }
            }

            DialogController dm = GameManager.Dialog;

            var shouldEndDialog = dm.InDialog() && !dm.HasNext();

            if (shouldEndDialog)
            {
                dm.EndDialog();
                return;
            }

            if (!dm.InDialog())
            {
                if (button == GameButton.A) dm.StartDialog(this);
                return;
            }

            dm.PrintNext();

            // Apply quest trigger after progressing dialog
            if (!string.IsNullOrEmpty(questId))
            {
                QuestManager.Instance.SetFlag(questId, questStep >= 0 ? questStep : QuestManager.Instance.GetStep(questId),
                    string.IsNullOrEmpty(questStatus) ? null : questStatus);
            }
        }

        protected void OnPlayerInteract(GameButton button)
        {
            Interact(button);
        }

        protected void OnButtonAPerformed()
        {
            //Debug.Log("OnButtonAPerformed: " + name);
            Interact(GameButton.A);
        }

        protected void OnButtonBPerformed()
        {
            //Debug.Log("OnButtonBPerformed: " + name);
            Interact(GameButton.B);
        }

        protected void OnDialogStart()
        {
            //Debug.Log("OnDialogStart: " + name);
            GameManager.Input.SwitchTarget(gameObject);
        }

        protected void OnDialogEnd()
        {
            //Debug.Log("OnDialogEnd: " + name);
            GameManager.Input.RestoreTarget();
        }
    }
}