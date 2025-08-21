using System;

namespace MIFF.SyncPure
{
    /// <summary>
    /// Placeholder rhythm challenge evaluator. Maps accuracy to sync gain.
    /// </summary>
    [Serializable]
    public class SyncChallenge
    {
        public double bpm = 120.0;
        public int difficulty = 1; // 1=easy,2=normal,3=hard
        public string stemID;

        public int EvaluatePerformance(double accuracy)
        {
            // accuracy: 0.0 - 1.0. Map to base gain and scale by difficulty.
            accuracy = Math.Clamp(accuracy, 0.0, 1.0);
            double baseGain = 10.0 * accuracy; // up to 10 points
            double diffMult = 0.5 + 0.5 * difficulty; // 1.0, 1.5, 2.0
            return (int)Math.Round(baseGain * diffMult);
        }
    }
}

