using System;
using System.Collections.Generic;
using MIFF.Pure.Combat;

namespace MIFF.Pure.Party
{
    public class PartySlot
    {
        public SpiritInstance? Member { get; set; }
        public bool IsKO => Member != null && Member.CurrentHP <= 0;
    }

    public class PartyManager
    {
        private readonly List<PartySlot> _slots;
        private readonly int _maxSize;
        public event Action<SpiritInstance>? OnRevived;

        public PartyManager(int maxSize = 6)
        {
            _maxSize = Math.Max(1, maxSize);
            _slots = new List<PartySlot>(_maxSize);
            for (int i = 0; i < _maxSize; i++) _slots.Add(new PartySlot());
        }

        public IReadOnlyList<PartySlot> Slots => _slots;

        public bool AddToParty(SpiritInstance spirit)
        {
            foreach (var slot in _slots)
            {
                if (slot.Member == null)
                {
                    slot.Member = spirit;
                    return true;
                }
            }
            return false;
        }

        public bool SwapMembers(int indexA, int indexB)
        {
            if (!IsValid(indexA) || !IsValid(indexB)) return false;
            ( _slots[indexA].Member, _slots[indexB].Member ) = ( _slots[indexB].Member, _slots[indexA].Member );
            return true;
        }

        public void HandleKO(string spiritId)
        {
            foreach (var slot in _slots)
            {
                if (slot.Member != null && string.Equals(slot.Member.SpiritId ?? slot.Member.Id.ToString(), spiritId, StringComparison.Ordinal))
                {
                    slot.Member.CurrentHP = 0;
                }
            }
        }

        public void HealAll()
        {
            foreach (var slot in _slots)
            {
                if (slot.Member != null)
                {
                    bool wasKO = slot.Member.CurrentHP <= 0;
                    slot.Member.CurrentHP = slot.Member.MaxHP;
                    if (wasKO) OnRevived?.Invoke(slot.Member);
                }
            }
        }

        private bool IsValid(int idx) => idx >= 0 && idx < _maxSize;
    }

    public class KOHandler
    {
        private readonly HashSet<string> _fainted = new HashSet<string>();
        public event Action<string>? OnRevive;

        public void MarkKO(string spiritId)
        {
            if (!string.IsNullOrWhiteSpace(spiritId)) _fainted.Add(spiritId);
        }

        public void Revive(string spiritId)
        {
            if (_fainted.Remove(spiritId)) OnRevive?.Invoke(spiritId);
        }

        public bool IsFainted(string spiritId) => _fainted.Contains(spiritId);
    }
}

