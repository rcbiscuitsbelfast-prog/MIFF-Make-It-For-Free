using System;
using System.Collections.Generic;

namespace MIFF.Pure.Events
{
    /// <summary>
    /// Minimal adapter-ready event bus. Pure C#, supports string topic routing.
    /// </summary>
    public class EventBus
    {
        private readonly Dictionary<string, List<Action<object?>>> _topicToHandlers = new Dictionary<string, List<Action<object?>>>();

        public void Publish(string topic, object? payload = null)
        {
            if (string.IsNullOrWhiteSpace(topic)) return;
            if (_topicToHandlers.TryGetValue(topic, out var handlers))
            {
                foreach (var h in handlers)
                {
                    h?.Invoke(payload);
                }
            }
        }

        public EventListener Subscribe(string topic, Action<object?> handler)
        {
            if (!_topicToHandlers.ContainsKey(topic))
            {
                _topicToHandlers[topic] = new List<Action<object?>>();
            }
            _topicToHandlers[topic].Add(handler);
            return new EventListener(topic, handler, Unsubscribe);
        }

        private void Unsubscribe(string topic, Action<object?> handler)
        {
            if (_topicToHandlers.TryGetValue(topic, out var handlers))
            {
                handlers.Remove(handler);
                if (handlers.Count == 0) _topicToHandlers.Remove(topic);
            }
        }
    }
}

