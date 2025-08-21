using System;

namespace MIFF.EvolutionPure
{
    public enum EvolutionStatus
    {
        Success,
        ConditionsNotMet,
        AlreadyEvolved
    }

    [Serializable]
    public struct EvolutionResult
    {
        public EvolutionStatus status;
        public string message;
        public string newSpeciesID;

        public bool IsSuccess => status == EvolutionStatus.Success;

        public static EvolutionResult Ok(string newId, string msg = "") => new EvolutionResult { status = EvolutionStatus.Success, message = msg, newSpeciesID = newId };
        public static EvolutionResult Fail(EvolutionStatus s, string msg) => new EvolutionResult { status = s, message = msg, newSpeciesID = null };
        public override string ToString() => $"{status}: {message} -> {newSpeciesID}";
    }
}

