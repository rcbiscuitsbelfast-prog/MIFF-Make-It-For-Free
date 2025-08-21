using System;
using System.Collections.Generic;

namespace MIFF.FusionPure
{
    public enum FusionStatus
    {
        Success,
        IncompatiblePair,
        AlreadyFused
    }

    [Serializable]
    public class FusionResult
    {
        public FusionStatus status;
        public string message;
        public string newSpiritID;
        public List<string> inheritedTraits = new List<string>();
        public string fusionNotes;

        public bool IsSuccess => status == FusionStatus.Success;

        public static FusionResult Ok(string newId, IEnumerable<string> traits, string notes = "")
        {
            return new FusionResult { status = FusionStatus.Success, newSpiritID = newId, inheritedTraits = new List<string>(traits ?? new List<string>()), fusionNotes = notes, message = "OK" };
        }

        public static FusionResult Fail(FusionStatus s, string msg)
        {
            return new FusionResult { status = s, message = msg };
        }

        public override string ToString()
        {
            return $"{status}: {message} -> {newSpiritID} | traits: [{string.Join(",", inheritedTraits)}]";
        }
    }
}

