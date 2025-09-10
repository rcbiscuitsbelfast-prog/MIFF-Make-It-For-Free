# Canvas Context Failures

## Validation
- Acquire `webgl` or fallback `2d` context
- Log success or error

## Logs
- `[Canvas] Context acquired: <ctx>`
- `[Canvas] Context failed — rendering aborted`

## Steps
1. Inspect console on each zone boot.
2. If acquisition fails, inspect canvas element presence and size.