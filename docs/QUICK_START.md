# MIFF Quick Start (5 minutes)

## Requirements
- Node.js 18+

## Install
```bash
npm ci
```

## Run Tests (CI parity)
```bash
npm run test:ci
```

## Spirit Tamer (Trial of the Grove)
```bash
npm run start:grove
```

## Validate Orchestration & Release
```bash
npm run validate:orchestration
npm run validate-release
```

## Build AutoBuilder Demo
```bash
npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out dist/toppler.html
```

## Troubleshooting
- If DOM-related tests fail, ensure jsdom is applied via Jest projects (jest.config.js)
- Use `node miff/scripts/validate-bridge.js` to check zone-router/export