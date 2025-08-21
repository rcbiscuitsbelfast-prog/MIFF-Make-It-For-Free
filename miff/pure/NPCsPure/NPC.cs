using System;
using System.Collections.Generic;
using System.Linq;
using MIFF.Core;

namespace MIFF.NPCsPure
{
    [Serializable]
    public class InteractionResult
    {
        public bool success;
        public string message;
        public List<DialogueLine> playedLines;
        public static InteractionResult Ok(string msg, List<DialogueLine> lines) => new InteractionResult { success = true, message = msg, playedLines = lines };
        public static InteractionResult Fail(string msg) => new InteractionResult { success = false, message = msg, playedLines = new List<DialogueLine>() };
        public override string ToString() => success ? $"OK: {message}" : $"ERR: {message}";
    }

    /// <summary>
    /// Pure C# NPC definition and interaction entry point.
    /// </summary>
    [Serializable]
    public class NPC
    {
        public string npcID;
        public string name;
        public InteractionType interactionType = InteractionType.Dialogue;
        public List<DialogueLine> dialogueLines = new List<DialogueLine>();

        // Optional hooks
        public List<string> questIDsToTrigger = new List<string>();
        public Dictionary<string, int> itemsToGive = new Dictionary<string, int>();
        public List<string> loreFlagsToSet = new List<string>();

        public InteractionResult Interact(PlayerContext ctx)
        {
            switch (interactionType)
            {
                case InteractionType.Dialogue:
                    var lines = FilterDialogueByFlags(ctx, dialogueLines);
                    ApplyChoiceFlagEffects(ctx, lines);
                    return InteractionResult.Ok("Dialogue played.", lines);
                case InteractionType.QuestTrigger:
                    TriggerQuests(ctx);
                    return InteractionResult.Ok("Quests triggered.", new List<DialogueLine>());
                case InteractionType.ItemExchange:
                    GiveItems(ctx);
                    return InteractionResult.Ok("Items given.", new List<DialogueLine>());
                case InteractionType.LoreUnlock:
                    SetLoreFlags(ctx);
                    return InteractionResult.Ok("Lore unlocked.", new List<DialogueLine>());
                case InteractionType.BattleChallenge:
                    return InteractionResult.Ok("Battle initiated.", new List<DialogueLine>());
                default:
                    return InteractionResult.Fail("Unknown interaction.");
            }
        }

        private List<DialogueLine> FilterDialogueByFlags(PlayerContext ctx, List<DialogueLine> lines)
        {
            if (lines == null) return new List<DialogueLine>();
            return lines.Where(l => ConditionsMet(ctx, l.conditions)).ToList();
        }

        private bool ConditionsMet(PlayerContext ctx, List<FlagCondition> conditions)
        {
            if (conditions == null || conditions.Count == 0) return true;
            var flags = GetFlagsDictionary(ctx);
            if (flags == null) return true; // no flags means no gating
            foreach (var c in conditions)
            {
                bool has = flags.Contains(c.flagID) && (bool)flags[c.flagID] == true;
                if (has != c.requiredState) return false;
            }
            return true;
        }

        private void ApplyChoiceFlagEffects(PlayerContext ctx, List<DialogueLine> lines)
        {
            // In a real UI, the player chooses; here, apply all choice flag sets that pass conditions
            foreach (var line in lines)
            {
                foreach (var choice in line.choices)
                {
                    if (ConditionsMet(ctx, choice.conditions))
                    {
                        var flags = GetFlagsDictionary(ctx);
                        if (flags != null)
                        {
                            foreach (var f in choice.setFlags) flags[f] = true;
                        }
                    }
                }
            }
        }

        private System.Collections.IDictionary GetFlagsDictionary(PlayerContext ctx)
        {
            var gameData = ctx?.GetType().GetProperty("GameData")?.GetValue(ctx);
            var flagsField = gameData?.GetType().GetField("onboardingFlags");
            return flagsField?.GetValue(gameData) as System.Collections.IDictionary;
        }

        private void TriggerQuests(PlayerContext ctx)
        {
            // Reflect a QuestManager-like API if provided by host
            var qm = ctx?.GetType().GetProperty("QuestManager")?.GetValue(ctx);
            if (qm == null) return;
            var start = qm.GetType().GetMethod("StartQuest");
            foreach (var id in questIDsToTrigger) start?.Invoke(qm, new object[] { id });
        }

        private void GiveItems(PlayerContext ctx)
        {
            var inv = Economy.PlayerAdapters.GetInventory(ctx);
            if (inv == null) return;
            foreach (var kv in itemsToGive)
            {
                inv.AddOrIncrement(kv.Key, kv.Value);
            }
        }

        private void SetLoreFlags(PlayerContext ctx)
        {
            var flags = GetFlagsDictionary(ctx);
            if (flags == null) return;
            foreach (var f in loreFlagsToSet) flags[f] = true;
        }
    }
}

