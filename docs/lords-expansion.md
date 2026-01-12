# Lords, Expansions & Avatars

Each player selects a Lord at the beginning of the game. The Lord’s avatar is shown next to their board, making their elemental group and identity clear.

## Base Lords

- **Lord Ignis** (South, Summer, Red)
- **Lady Aqua** (North, Winter, Blue)
- **Sir Terra** (West, Autumn, Green)
- **Dama Ventus** (East, Spring, Yellow)

## Expanding the Roster

To add new Lords:
1. Add the avatar image to `assets/lords/`.
2. Add the Lord’s data to the `LORDS` array in `src/game/player.ts`.

## UI/UX

- The Lord avatar appears beside the player’s board.
- The name, color, and season/region are shown.
- Each board (player and rival) displays their chosen Lord.
- Special effects/animations can highlight Lord abilities.

## Example UI Layout

```
+-----------------------------+   +-----------------------------+
|  [Lord Avatar & info]       |   |    [Lord Avatar & info]     |
|  Name: Lady Aqua            |   |    Name: Lord Ignis         |
|  Color: Blue (Winter)       |   |    Color: Red (Summer)      |
|  [Puzzle board: player]     |   |    [Puzzle board: rival]    |
+-----------------------------+   +-----------------------------+
```
