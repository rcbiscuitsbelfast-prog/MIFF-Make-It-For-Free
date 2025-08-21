# NewBark — Modular, CLI‑First Game Framework (Unity Runtime)
🌳 Retro-style 2D RPG engine and a set of engine-agnostic, CLI-first gameplay modules for rapid iteration.

![screenshot](Assets/Graphics/Images/screenshot.png)

> IMPORTANT: This project is in low-maintainance mode, meaning that compatibility fixes with new Unity and package versions will be published but new additions or features are not going to happen any time soon and there are no plans for them yet. 

Looking for a GameMaker version? Check [newbark-gamemaker](https://github.com/itsjavi/newbark-gamemaker)

## Requirements

- Unity 2021.1 or greater (for runtime)
- Node.js 18+ (for CLI harnesses)

## CLI-First Modules

Each module comes with a self-contained CLI harness under the repository root. Run with ts-node:

- QuestsPure: `npx ts-node --compiler-options '{"module":"commonjs"}' QuestsPure/cliHarness.ts QuestsPure/sample_quest_npc.json 1234`
- InventoryPure: `npx ts-node --compiler-options '{"module":"commonjs"}' InventoryPure/cliHarness.ts InventoryPure/sample_commands.json`
- CreaturesPure: `npx ts-node --compiler-options '{"module":"commonjs"}' CreaturesPure/cliHarness.ts Assets/Resources/species/species.json CreaturesPure/sample_commands.json`
- LorePure: `npx ts-node --compiler-options '{"module":"commonjs"}' LorePure/cliHarness.ts LorePure/sample_commands.json`
- SettingsPure: `npx ts-node --compiler-options '{"module":"commonjs"}' SettingsPure/cliHarness.ts SettingsPure/sample_init.json SettingsPure/sample_commands.json`
- AudioMixerPure: `npx ts-node --compiler-options '{"module":"commonjs"}' AudioMixerPure/cliHarness.ts AudioMixerPure/sample_commands.json`
- WorldEnhancementsPure: `npx ts-node --compiler-options '{"module":"commonjs"}' WorldEnhancementsPure/cliHarness.ts WorldEnhancementsPure/sample_commands.json`
- WorldLayoutPure: `npx ts-node --compiler-options '{"module":"commonjs"}' WorldLayoutPure/cliHarness.ts WorldLayoutPure/sample_commands.json`
- MovementPure: `npx ts-node --compiler-options '{"module":"commonjs"}' MovementPure/cliHarness.ts MovementPure/sample_commands.json`
- XPLevelingPure: `npx ts-node --compiler-options '{"module":"commonjs"}' XPLevelingPure/cliHarness.ts XPLevelingPure/sample_commands.json`
- CombatPure: `npx ts-node --compiler-options '{"module":"commonjs"}' CombatPure/cliHarness.ts CombatPure/sample_commands.json`
- NPCsPure (Python): `python3 cli/npcs_pure/harness.py --npc cli/npcs_pure/sample_npc.json`

See `Documents/Remix_Review_V3.md` for a full assessment including coverage and gaps.


## License

This software is copyrighted and licensed under the 
[MIT license](https://github.com/itsjavi/newbark-unity/LICENSE).

### Disclaimer

This software comes bundled with data and graphics extracted from the
Pokémon series of video games. Some terminology from the Pokémon franchise is
also necessarily used within the software itself. This is all the intellectual
property of Nintendo, Creatures, inc., and GAME FREAK, inc. and is protected by
various copyrights and trademarks.

The goal of this project is not to create and/or distribute a game, but to learn
how to create similar retro games in Unity. So this project, apart from being a possible
base engine for future similar projects unrelated to the Pokémon franchise,
has mainly educational purposes.

The author believes that the use of this intellectual property for a fan reference
is covered by fair use and that the software is significantly impaired without said
property included. Any use of this copyrighted property is at your own legal risk.

This software is not affiliated in any way with Nintendo,
Pokémon or any other game company.

A complete revision history of this software is available from
https://github.com/itsjavi/newbark-unity

---


Created by [@itsjavi](https://github.com/itsjavi)
