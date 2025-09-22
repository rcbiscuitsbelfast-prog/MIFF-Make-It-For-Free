# CI Guide (Q4 2025)

## Workflows
- ci-jest-pin.yml: Runs Jest in-band to avoid worker IPC issues
- coverage.yml: Generates coverage artifact from in-band test run
- license-scan.yml: Scheduled license/asset scan

## Best Practices
- Keep Jest at 29.x until worker issues are resolved
- Prefer `--runInBand` in CI for determinism
- Use dedicated branches for tooling upgrades (e.g., vite/vitest)

## Troubleshooting
- If workers hang or tests fail intermittently, re-run in-band
- For long outputs, write artifacts to files and upload via actions