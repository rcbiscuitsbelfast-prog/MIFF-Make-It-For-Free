namespace MIFF.Pure.StatusEffects
{
    public enum StackRule
    {
        None,
        Additive,
        MaxOnly,
        MinOnly,
        Replace
    }

    /// <summary>
    /// Rules for combining multiple instances of a buff/debuff.
    /// </summary>
    public static class BuffStackRules
    {
        public static float Combine(StackRule rule, float currentValue, float newValue)
        {
            switch (rule)
            {
                case StackRule.Additive: return currentValue + newValue;
                case StackRule.MaxOnly: return currentValue > newValue ? currentValue : newValue;
                case StackRule.MinOnly: return currentValue < newValue ? currentValue : newValue;
                case StackRule.Replace: return newValue;
                default: return currentValue;
            }
        }
    }
}

