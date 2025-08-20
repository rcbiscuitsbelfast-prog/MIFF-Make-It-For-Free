using System.Linq;
using NewBark.Quests;
using UnityEngine;
using UnityEngine.UI;

namespace NewBark.UI
{
    public class QuestJournalUI : MonoBehaviour
    {
        [Header("Refs")] public QuestManager questManager;

        [Header("List")] public RectTransform questListPanel;
        public Button listEntryButtonPrefab;

        [Header("Detail")] public Text titleText;
        public Text descriptionText;
        public RectTransform objectivesParent;
        public Text objectiveTextPrefab;

        public void ShowJournal()
        {
            ClearList();
            ClearDetail();

            if (!questManager) return;

            var quests = questManager.GetActiveQuests().ToArray();
            foreach (var q in quests)
            {
                var btn = Instantiate(listEntryButtonPrefab, questListPanel);
                var t = btn.GetComponentInChildren<Text>();
                if (t) t.text = q.title;
                btn.onClick.AddListener(() => ShowQuestDetail(q));
            }
        }

        private void ShowQuestDetail(Quest q)
        {
            if (titleText) titleText.text = q.title;
            if (descriptionText) descriptionText.text = q.description;
            ClearObjectives();

            if (q.objectives != null)
            {
                foreach (var obj in q.objectives)
                {
                    var key = q.questID + "." + obj.objectiveID;
                    bool done = false;
                    var data = GameManager.Data;
                    if (data != null && data.questObjectiveProgress != null)
                        data.questObjectiveProgress.TryGetValue(key, out done);
                    var line = Instantiate(objectiveTextPrefab, objectivesParent);
                    var desc = string.IsNullOrEmpty(obj.description) ? obj.targetID : obj.description;
                    line.text = (done ? "[x] " : "[ ] ") + desc;
                    if (done) line.color = Color.green;
                }
            }
        }

        private void ClearList()
        {
            if (!questListPanel) return;
            for (int i = questListPanel.childCount - 1; i >= 0; i--)
            {
                Destroy(questListPanel.GetChild(i).gameObject);
            }
        }

        private void ClearDetail()
        {
            if (titleText) titleText.text = "";
            if (descriptionText) descriptionText.text = "";
            ClearObjectives();
        }

        private void ClearObjectives()
        {
            if (!objectivesParent) return;
            for (int i = objectivesParent.childCount - 1; i >= 0; i--)
            {
                Destroy(objectivesParent.GetChild(i).gameObject);
            }
        }
    }
}

