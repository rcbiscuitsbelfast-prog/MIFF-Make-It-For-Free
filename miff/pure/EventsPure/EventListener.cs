using System;

namespace MIFF.Pure.Events
{
    /// <summary>
    /// Disposable subscription wrapper, remix-safe.
    /// </summary>
    public sealed class EventListener : IDisposable
    {
        private readonly string _topic;
        private readonly Action<object?> _handler;
        private readonly Action<string, Action<object?>> _unsubscribe;
        private bool _disposed;

        public EventListener(string topic, Action<object?> handler, Action<string, Action<object?>> unsubscribe)
        {
            _topic = topic;
            _handler = handler;
            _unsubscribe = unsubscribe;
        }

        public void Dispose()
        {
            if (_disposed) return;
            _unsubscribe(_topic, _handler);
            _disposed = true;
        }
    }
}

