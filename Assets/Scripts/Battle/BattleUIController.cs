using System.Collections.Generic;
using NewBark.SpiritBattles.Objects.Creatures;
using NewBark.SpiritBattles.Objects.Items;
using NewBark.SpiritBattles.Objects.Moves;
using NewBark.SpiritBattles.Objects.Player;
using UnityEngine;
using UnityEngine.UI;

namespace NewBark.Battle
{
    public class BattleUIController : MonoBehaviour
    {
        [Header("Refs")] 
        public BattleController battleController;
        public PlayerProfile playerProfile;

        [Header("Panels")] 
        public GameObject commandPanel;
        public GameObject movePanel;
        public GameObject spiritPanel;
        public GameObject itemPanel;

        [Header("Command Buttons")] 
        public Button fightButton;
        public Button bagButton;
        public Button switchButton;
        public Button runButton;

        [Header("Dynamic Lists")] 
        public Transform moveListParent;
        public Transform spiritListParent;
        public Transform itemListParent;
        public Button listButtonPrefab;

        [Header("Demo/Optional")] 
        public List<BattleItem> demoUsableItems;

        private void Awake()
        {
            WireCommandButtons();
            HideAllPanels();
        }

        public void HideAllPanels()
        {
            if (commandPanel) commandPanel.SetActive(false);
            if (movePanel) movePanel.SetActive(false);
            if (spiritPanel) spiritPanel.SetActive(false);
            if (itemPanel) itemPanel.SetActive(false);
        }

        public void ShowCommandPanel()
        {
            HideAllPanels();
            if (commandPanel) commandPanel.SetActive(true);
        }

        private void WireCommandButtons()
        {
            if (fightButton) fightButton.onClick.AddListener(OnFightClicked);
            if (bagButton) bagButton.onClick.AddListener(OnBagClicked);
            if (switchButton) switchButton.onClick.AddListener(OnSwitchClicked);
            if (runButton) runButton.onClick.AddListener(OnRunClicked);
        }

        private void OnFightClicked()
        {
            HideAllPanels();
            if (movePanel) movePanel.SetActive(true);
            PopulateMoveList();
        }

        private void OnBagClicked()
        {
            HideAllPanels();
            if (itemPanel) itemPanel.SetActive(true);
            PopulateItemList();
        }

        private void OnSwitchClicked()
        {
            HideAllPanels();
            if (spiritPanel) spiritPanel.SetActive(true);
            PopulateSpiritList();
        }

        private void OnRunClicked()
        {
            battleController?.AttemptEscape();
        }

        private void PopulateMoveList()
        {
            ClearChildren(moveListParent);

            var currentSpirit = battleController ? battleController.GetCurrentPlayerSpirit() : null;
            var buttons = new List<Button>();

            if (currentSpirit && currentSpirit.moveSet != null)
            {
                foreach (var mv in currentSpirit.moveSet)
                {
                    if (!mv) continue;
                    buttons.Add(CreateListButton(moveListParent, mv.displayName, () =>
                    {
                        battleController.ReceivePlayerAction(mv);
                        HideAllPanels();
                    }));
                }
            }

            if (playerProfile && playerProfile.signatureMoves != null)
            {
                foreach (var mv in playerProfile.signatureMoves)
                {
                    if (!mv) continue;
                    buttons.Add(CreateListButton(moveListParent, mv.displayName + " (Style)", () =>
                    {
                        battleController.ReceivePlayerAction(mv);
                        HideAllPanels();
                    }));
                }
            }
        }

        private void PopulateSpiritList()
        {
            ClearChildren(spiritListParent);
            if (battleController?.playerSpirits == null) return;

            for (int i = 0; i < battleController.playerSpirits.Length; i++)
            {
                var idx = i;
                var sp = battleController.playerSpirits[i];
                if (!sp) continue;
                CreateListButton(spiritListParent, sp.displayName, () =>
                {
                    battleController.ReceivePlayerAction(sp);
                    HideAllPanels();
                });
            }
        }

        private void PopulateItemList()
        {
            ClearChildren(itemListParent);
            if (demoUsableItems != null)
            {
                foreach (var it in demoUsableItems)
                {
                    if (!it) continue;
                    CreateListButton(itemListParent, it.displayName, () =>
                    {
                        battleController.ReceivePlayerAction(it);
                        HideAllPanels();
                    });
                }
            }
        }

        private static void ClearChildren(Transform parent)
        {
            if (!parent) return;
            for (int i = parent.childCount - 1; i >= 0; i--)
            {
                Object.Destroy(parent.GetChild(i).gameObject);
            }
        }

        private Button CreateListButton(Transform parent, string label, UnityEngine.Events.UnityAction onClick)
        {
            if (!listButtonPrefab || !parent) return null;
            var btn = Instantiate(listButtonPrefab, parent);
            var txt = btn.GetComponentInChildren<Text>();
            if (txt) txt.text = label;
            btn.onClick.AddListener(onClick);
            return btn;
        }
    }
}

