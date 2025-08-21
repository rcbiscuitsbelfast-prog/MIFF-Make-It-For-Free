using System;

namespace MIFF.ItemsPure
{
    public enum UsageStatus
    {
        Success,
        InvalidTarget,
        EffectBlocked,
        AlreadyUsed
    }

    [Serializable]
    public struct UsageResult
    {
        public UsageStatus status;
        public string message;

        public bool IsSuccess => status == UsageStatus.Success;

        public static UsageResult Ok(string msg = "") => new UsageResult { status = UsageStatus.Success, message = msg };
        public static UsageResult Fail(UsageStatus s, string msg) => new UsageResult { status = s, message = msg };
        public override string ToString() => $"{status}: {message}";
    }
}

