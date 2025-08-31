# AIProfilesPure

NPC behavior and role system with roles, schedules, and interaction logic. Engine-agnostic and CLI-first with golden tests.

## Schema

```ts
export type Role = 'vendor' | 'questGiver' | 'wanderer' | 'guard' | 'custom';
export type ScheduleEntry = { time: string; action: string };
export type AIProfile = {
  id: string;
  role: Role;
  behaviorTree?: string;
  schedule?: ScheduleEntry[];
  dialogId?: string;
  questId?: string;
};
```

## CLI Usage

```bash
npx ts-node --compiler-options '{"module":"commonjs"}' AIProfilesPure/cliHarness.ts AIProfilesPure/sample_profiles.json AIProfilesPure/tests/commands.json
```

Commands:
- listProfiles
- simulateBehavior <npcId>
- dumpSchedule <npcId>
- assignRole <npcId> <role>
- linkDialog <npcId> <dialogId>
- linkQuest <npcId> <questId>

## Remix Hooks

- onNPCInteract(npcId, role)
- onScheduleTrigger(npcId, entry)
- onRoleAssigned(npcId, role)

## Golden Test

- `AIProfilesPure/tests/goldenAIProfiles.test.ts` verifies behavior simulation, links, and schedules.