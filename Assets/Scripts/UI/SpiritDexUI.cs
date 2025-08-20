using System.Linq;
using NewBark.SpiritBattles.Objects.Creatures;
using NewBark.State;
using UnityEngine;
using UnityEngine.UI;

namespace NewBark.UI
{
    public class SpiritDexUI : MonoBehaviour
    {
        [Header("List")] public RectTransform spiritListPanel;
        public Button listEntryButtonPrefab;

        [Header("Detail")] public Image frontImage;
        public Image backImage;
        public Text nameText;
        public Text emotionText;
        public Text genreText;
        public Text affinityText;
        public Text roleText;
        public Text statsText;
        public Text loreText;
        public Button playCryButton;

        private SpiritSpecies _current;

        public void ShowDex()
        {
            ClearList();
            ClearDetail();

            var data = GameManager.Data;
            if (data == null || data.discoveredSpiritIDs == null) return;

            // Use database instead of Resources search
            var db = UnityEditor.AssetDatabase.LoadAssetAtPath<NewBark.Databases.SpiritDatabase>("Assets/Objects/Databases/SpiritDatabase.asset");
            if (!db) return;
            var discovered = db.spirits.Where(s => s && data.discoveredSpiritIDs.Contains(s.spiritID)).ToArray();

            foreach (var sp in discovered)
            {
                var btn = Instantiate(listEntryButtonPrefab, spiritListPanel);
                var txt = btn.GetComponentInChildren<Text>();
                if (txt) txt.text = sp.displayName;
                var img = btn.GetComponentInChildren<Image>();
                if (img && sp.frontSprite) img.sprite = sp.frontSprite;
                btn.onClick.AddListener(() => ShowSpiritDetail(sp));
            }
        }

        private void ShowSpiritDetail(SpiritSpecies s)
        {
            _current = s;
            if (nameText) nameText.text = s.displayName;
            if (emotionText) emotionText.text = s.emotionCore.ToString();
            if (genreText) genreText.text = s.genreBias.ToString();
            if (affinityText) affinityText.text = s.affinity.ToString();
            if (roleText) roleText.text = s.battleRole.ToString();
            if (statsText) statsText.text = $"Pulse {s.pulse}  Rhythm {s.rhythm}  Flow {s.flow}  Sync {s.sync}";
            if (loreText) loreText.text = s.lore;
            if (frontImage) frontImage.sprite = s.frontSprite;
            if (backImage) backImage.sprite = s.backSprite;

            if (playCryButton)
            {
                playCryButton.onClick.RemoveAllListeners();
                playCryButton.onClick.AddListener(() => PlayCry(s));
            }
        }

        private void PlayCry(SpiritSpecies s)
        {
            if (s.cry)
            {
                GameManager.Audio.PlaySfx(s.cry);
            }
        }

        private void ClearList()
        {
            if (!spiritListPanel) return;
            for (int i = spiritListPanel.childCount - 1; i >= 0; i--)
            {
                Destroy(spiritListPanel.GetChild(i).gameObject);
            }
        }

        private void ClearDetail()
        {
            if (nameText) nameText.text = "";
            if (emotionText) emotionText.text = "";
            if (genreText) genreText.text = "";
            if (affinityText) affinityText.text = "";
            if (roleText) roleText.text = "";
            if (statsText) statsText.text = "";
            if (loreText) loreText.text = "";
            if (frontImage) frontImage.sprite = null;
            if (backImage) backImage.sprite = null;
        }
    }
}

