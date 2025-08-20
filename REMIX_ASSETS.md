## Remix Assets Inventory

This file lists every discovered NPC/player name, Pokémon mentions, and all locations, plus the unique/branded assets you likely need to replace to remix this game.

### Player and NPC names
- GOLD — found in dialog/sign text in `Assets/Scenes/Main.unity` (e.g., "GOLD turned on the PC.", "GOLD's House").
- Elm — referenced throughout `Assets/Scenes/Main.unity` (GameObjects `ElmLaboratory`, `ElmHouse`, sign text "ELM'S HOUSE", "ELM POKéMON LAB"); also see `Assets/Objects/AreaTitles/ElmsLab_AreaTitle.asset`.

Notes:
- No other explicit NPC names were discovered in the project assets.

### Pokémon species listed
- None. No explicit Pokémon species names (e.g., Pikachu, Chikorita) were found in the repository. The term “POKéMON” appears in UI text and asset names but not specific species.

### Locations
- Area Titles (assets):
  - New Bark Town — `Assets/Objects/AreaTitles/NewBark_AreaTitle.asset`
  - Route 29 — `Assets/Objects/AreaTitles/Route29_AreaTitle.asset`
  - Cherrygrove City — `Assets/Objects/AreaTitles/CherryGrove_AreaTitle.asset`
  - Elms Lab — `Assets/Objects/AreaTitles/ElmsLab_AreaTitle.asset` (title currently empty)

- Area Triggers (scene objects):
  - `AT_NewBark` — `Assets/Scenes/Main.unity`
  - `AT_Route29` — `Assets/Scenes/Main.unity`
  - `AT_CherryGrove` — `Assets/Scenes/Main.unity`

- Buildings/places (scene objects):
  - `ElmLaboratory` — `Assets/Scenes/Main.unity`
  - `ElmHouse` — `Assets/Scenes/Main.unity`
  - `PlayerHouse` — `Assets/Scenes/Main.unity`
  - `NewBarkHouseSW` — `Assets/Scenes/Main.unity`
  - Interiors/Exteriors named in prefab instances: `ElmLab_In`, `ElmLab_Out`, `ElmHouse_In`, `ElmHouse_Out` — `Assets/Scenes/Main.unity`

- Sign/label texts (scene):
  - "NEW BARK TOWN" — `Assets/Scenes/Main.unity`
  - "ROUTE 29" — `Assets/Scenes/Main.unity`
  - "ELM'S HOUSE" — `Assets/Scenes/Main.unity`
  - "GOLD's House" — `Assets/Scenes/Main.unity`
  - "ELM POKéMON LAB" — `Assets/Scenes/Main.unity`

### Assets to replace for a clean remix

- Fonts (Pokémon-branded):
  - `Assets/Graphics/Fonts/Pokemon GB.ttf`
  - `Assets/Graphics/Fonts/Pokemon Unown GB.ttf`
  - `Assets/Graphics/Fonts/Pokemon GB Japan KT.ttf`
  - `Assets/Graphics/Fonts/Pokemon GB Japan HR.ttf`

- BGM (track titles reference Pokémon series content):
  - `Assets/Audio/BGM/01-MainTheme.mp3`
  - `Assets/Audio/BGM/09-Pokemon-Center.mp3`
  - `Assets/Audio/BGM/13-Pokemon-Recovery.mp3`
  - `Assets/Audio/BGM/19-Bicycle.mp3`
  - `Assets/Audio/BGM/33-Surfing.mp3`
  - `Assets/Audio/BGM/34-Evolution.mp3`
  - `Assets/Audio/BGM/38-Cherrygrove-City.mp3`
  - `Assets/Audio/BGM/41-Wild-Battle.mp3`
  - `Assets/Audio/BGM/42-Trainer-Battle.mp3`
  - `Assets/Audio/BGM/50-Elm-Lab.mp3`
  - `Assets/Audio/BGM/52-Route-29.mp3`
  - `Assets/Audio/BGM/60-NewBarkTown.mp3`

- SFX (may be derived from original material; review/replace as needed):
  - `Assets/Audio/SFX/collide.ogg`
  - `Assets/Audio/SFX/collide_slow.mp3`
  - `Assets/Audio/SFX/door_enter.mp3`
  - `Assets/Audio/SFX/door_exit.mp3`
  - `Assets/Audio/SFX/escape.mp3`
  - `Assets/Audio/SFX/heal.mp3`
  - `Assets/Audio/SFX/jump.mp3`
  - `Assets/Audio/SFX/select.mp3`

- Graphics: Sprites/Atlases likely extracted from the original games:
  - `Assets/Graphics/Sprites/Player_Sprites.png`
  - `Assets/Graphics/Sprites/NPC01_Sprite.png`
  - `Assets/Graphics/Sprites/OverWorld_Sprite.png`
  - `Assets/Graphics/Sprites/Interiors_Sprite.png`

- Graphics: Tiles (tile assets referencing those atlases):
  - Interiors: `Assets/Graphics/Tiles/Interiors/`
    - Palette: `Assets/Graphics/Tiles/Interiors/Interiors_Palette.prefab`
    - Tile assets: `Assets/Graphics/Tiles/Interiors/Tiles/Interiors_Sprite_*.asset`
  - OverWorld: `Assets/Graphics/Tiles/OverWorld/`
    - Palette: `Assets/Graphics/Tiles/OverWorld/OverWorld_Palette.prefab`
    - Tile assets: `Assets/Graphics/Tiles/OverWorld/Tiles/OverWorld_Sprite_*.asset`

- Images/UI:
  - `Assets/Graphics/Images/icon.png`
  - `Assets/Graphics/Images/logo.png`
  - `Assets/Graphics/Images/screenshot.png`

- Prefabs and components tied to location display (generic, but included for awareness):
  - `Assets/Prefabs/AreaTrigger.prefab`
  - `Assets/Prefabs/SignDialog.prefab`
  - `Assets/Objects/AreaTitles/*.asset`

### Sprite metadata (trainer references)
- `Assets/Graphics/Sprites/Player_Sprites.png.meta` contains sprite names like `trainer_sprite_0` .. `trainer_sprite_21` which reflect trainer/player graphics slices.

### Notes for remix
- Replace the above branded fonts, BGM, sprites, and tiles with your original assets.
- Update Area Title assets in `Assets/Objects/AreaTitles/` with your own titles and music.
- Search and update any UI dialog in `Assets/Scenes/Main.unity` that mentions "POKéMON", "GOLD", or "ELM".

