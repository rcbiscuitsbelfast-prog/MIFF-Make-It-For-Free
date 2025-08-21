using System;
using System.Collections.Generic;

namespace MIFF.Pure.Input
{
    public class InputAction
    {
        public string ActionId { get; set; } = string.Empty;
        public string DefaultInput { get; set; } = string.Empty; // e.g., "W", "Space", "Gamepad:A"
        public bool Remappable { get; set; } = true;
        public string Category { get; set; } = "general";
    }

    public class InputProfile
    {
        // map input token -> actionId
        private readonly Dictionary<string, string> _map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        // registry of actions for lookup
        private readonly Dictionary<string, InputAction> _actions = new Dictionary<string, InputAction>(StringComparer.OrdinalIgnoreCase);

        public void RegisterAction(InputAction action)
        {
            if (action == null || string.IsNullOrWhiteSpace(action.ActionId)) return;
            _actions[action.ActionId] = action;
            if (!string.IsNullOrWhiteSpace(action.DefaultInput) && !_map.ContainsKey(action.DefaultInput))
            {
                _map[action.DefaultInput] = action.ActionId;
            }
        }

        public bool Rebind(string actionId, string newInput)
        {
            if (!_actions.TryGetValue(actionId, out var a) || !a.Remappable) return false;
            // Remove any existing binding of newInput
            foreach (var kv in new List<KeyValuePair<string, string>>(_map))
            {
                if (string.Equals(kv.Key, newInput, StringComparison.OrdinalIgnoreCase))
                    _map.Remove(kv.Key);
            }
            // Remove old bindings for this action
            foreach (var kv in new List<KeyValuePair<string, string>>(_map))
            {
                if (string.Equals(kv.Value, actionId, StringComparison.OrdinalIgnoreCase))
                    _map.Remove(kv.Key);
            }
            _map[newInput] = actionId;
            return true;
        }

        public InputAction? GetActionForInput(string input)
        {
            if (_map.TryGetValue(input, out var actionId) && _actions.TryGetValue(actionId, out var action))
                return action;
            return null;
        }

        public IReadOnlyDictionary<string, string> GetBindings() => _map;
    }

    public class InputMapper
    {
        private readonly InputProfile _profile;
        public InputMapper(InputProfile profile) { _profile = profile; }

        public InputAction? GetMappedAction(string input) => _profile.GetActionForInput(input);
        public bool RebindAction(string actionId, string newInput) => _profile.Rebind(actionId, newInput);
    }
}

