using System;

namespace MIFF.Economy
{
    public enum TransactionStatus
    {
        Success,
        InsufficientFunds,
        ItemUnavailable,
        InventoryFull
    }

    [Serializable]
    public struct TransactionResult
    {
        public TransactionStatus status;
        public string message;

        public bool IsSuccess => status == TransactionStatus.Success;

        public static TransactionResult Ok(string message = "") => new TransactionResult { status = TransactionStatus.Success, message = message };
        public static TransactionResult Fail(TransactionStatus status, string message) => new TransactionResult { status = status, message = message };
        public override string ToString() => $"{status}: {message}";
    }
}

