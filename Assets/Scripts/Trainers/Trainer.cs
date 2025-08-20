using NewBark.Battle;
using NewBark.State;
using NewBark.Trainers;
using NewBark.UI;
using UnityEngine;

namespace NewBark.NPC
{
    [RequireComponent(typeof(Collider2D))]
    public class Trainer : MonoBehaviour
    {
        public TrainerParty trainerParty;
        public bool hasBeenDefeated = false;
        public string defeatFlagID;

        public BattleController battleController;
        public TransitionController transitionController;

        private void Reset()
        {
            var col = GetComponent<Collider2D>();
            col.isTrigger = true; // interaction trigger
        }

        private void Awake()
        {
            // Load persisted defeat flag
            if (!string.IsNullOrEmpty(defeatFlagID) && GameManager.Data?.flags != null)
            {
                GameManager.Data.flags.TryGetValue(defeatFlagID, out hasBeenDefeated);
            }

            if (!battleController) battleController = FindObjectOfType<BattleController>();
            if (!transitionController) transitionController = FindObjectOfType<TransitionController>();
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (!other || !other.CompareTag("Player")) return;
            TryStartBattle();
        }

        // Alternative hook for interaction
        private void OnPlayerInteract()
        {
            TryStartBattle();
        }

        private void TryStartBattle()
        {
            if (hasBeenDefeated || trainerParty == null || battleController == null)
            {
                return;
            }

            if (transitionController)
            {
                transitionController.TransitionOut();
            }

            // Configure enemy roster on the battle controller
            battleController.enemySpirits = trainerParty.spiritRoster;
            battleController.isRivalEncounter = true;
            battleController.StartBattle(null, isRival: true);

            if (transitionController)
            {
                transitionController.TransitionIn();
            }
        }

        // Call this from a global battle end event, or from BattleController when victory occurs
        public void OnBattleEnd(bool playerWon)
        {
            if (playerWon)
            {
                hasBeenDefeated = true;
                if (!string.IsNullOrEmpty(defeatFlagID))
                {
                    if (GameManager.Data.flags == null)
                    {
                        GameManager.Data.flags = new System.Collections.Generic.Dictionary<string, bool>();
                    }
                    GameManager.Data.flags[defeatFlagID] = true;
                }
            }
        }
    }
}

