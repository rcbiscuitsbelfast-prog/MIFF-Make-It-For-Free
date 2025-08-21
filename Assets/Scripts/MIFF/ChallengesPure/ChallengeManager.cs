using System;
using System.Collections.Generic;

namespace MIFF.ChallengesPure
{
    /// <summary>
    /// Tracks available and completed challenges.
    /// </summary>
    [Serializable]
    public class ChallengeManager
    {
        private readonly Dictionary<string, BattleChallenge> available = new Dictionary<string, BattleChallenge>();
        private readonly HashSet<string> completed = new HashSet<string>();

        public event Action<BattleChallenge> OnChallengeStarted;
        public event Action<BattleChallenge, ChallengeResult> OnChallengeCompleted;

        public void Register(BattleChallenge challenge)
        {
            if (challenge == null || string.IsNullOrEmpty(challenge.challengeID)) return;
            available[challenge.challengeID] = challenge;
        }

        public void StartChallenge(string challengeID)
        {
            if (available.TryGetValue(challengeID, out var c))
            {
                OnChallengeStarted?.Invoke(c);
            }
        }

        public void CompleteChallenge(string challengeID, ChallengeResult result = null)
        {
            if (available.TryGetValue(challengeID, out var c))
            {
                completed.Add(challengeID);
                OnChallengeCompleted?.Invoke(c, result ?? new ChallengeResult { outcome = ChallengeOutcome.Victory });
            }
        }

        public bool IsChallengeComplete(string challengeID) => completed.Contains(challengeID);

        public IReadOnlyCollection<BattleChallenge> GetAvailable() => available.Values;
    }
}

