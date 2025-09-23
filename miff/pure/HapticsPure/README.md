# HapticsPure

Deterministic haptics scheduling and playback wrapper over `navigator.vibrate` with graceful fallbacks.

## CLI

```bash
npx ts-node miff/pure/HapticsPure/cliHarness.ts miff/pure/HapticsPure/tests/requests.json
```

## API
- `enqueue(requests)` schedules one or more haptic requests
- `playNext()` plays the next request
- `playAll()` drains the queue

## Notes
- In non-browser envs, playback is a no-op but returns `played` for test determinism.