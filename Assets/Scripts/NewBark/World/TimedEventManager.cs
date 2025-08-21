using System.Collections.Generic;
using UnityEngine;

namespace NewBark.World
{
    public class TimedEventManager : MonoBehaviour
    {
        public static TimedEventManager Instance { get; private set; }

        private class TimedEvent
        {
            public float remaining;
            public float repeat;
            public string name;
        }

        private readonly List<TimedEvent> events = new List<TimedEvent>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("TimedEventManager initialized (singleton, DontDestroyOnLoad).");
        }

        public void Schedule(string name, float delaySeconds, float repeatSeconds = 0)
        {
            events.Add(new TimedEvent {name = name, remaining = delaySeconds, repeat = repeatSeconds});
            Debug.Log($"Scheduled event '{name}' in {delaySeconds}s repeat={repeatSeconds}");
        }

        private void Update()
        {
            for (int i = events.Count - 1; i >= 0; i--)
            {
                var ev = events[i];
                ev.remaining -= Time.deltaTime;
                if (ev.remaining <= 0)
                {
                    Debug.Log($"Timed event fired: {ev.name}");
                    if (ev.repeat > 0)
                    {
                        ev.remaining = ev.repeat;
                    }
                    else
                    {
                        events.RemoveAt(i);
                    }
                }
            }
        }
    }
}