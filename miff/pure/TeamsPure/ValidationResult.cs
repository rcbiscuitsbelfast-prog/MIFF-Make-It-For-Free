using System;

namespace MIFF.TeamsPure
{
    public enum ValidationStatus
    {
        Valid,
        TooManyMembers,
        DuplicateSpecies,
        InvalidSynergy
    }

    [Serializable]
    public struct ValidationResult
    {
        public ValidationStatus status;
        public string message;

        public bool IsValid => status == ValidationStatus.Valid;
        public static ValidationResult Ok(string msg = "") => new ValidationResult { status = ValidationStatus.Valid, message = msg };
        public static ValidationResult Fail(ValidationStatus s, string msg) => new ValidationResult { status = s, message = msg };
        public override string ToString() => $"{status}: {message}";
    }
}

