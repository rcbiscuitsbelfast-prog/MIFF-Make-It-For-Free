# TouchGesturePure

Deterministic touch gesture recognition (tap, doubleTap, longPress, swipe, pinch) from low-level touch events.

## CLI

```bash
npx ts-node miff/pure/TouchGesturePure/cliHarness.ts miff/pure/TouchGesturePure/tests/events.tap.json
```

## API
- `feed(event)` adds a low-level touch event
- `analyze()` returns detected gestures and clears the buffer