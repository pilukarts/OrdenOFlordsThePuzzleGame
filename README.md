# OrdenOFlordsThePuzzleGame
A match-3 puzzle game with player battles, multi-platform vision, and future support for casinos and Telegram Game.

# OrdenOFlordsThePuzzleGame

A match-3 puzzle game with player battles, multi-platform vision, and future support for casinos and Telegram Game.

---

> **All graphics and visual assets in this project are original work by the author (pilukarts) and are not taken from any existing game or resource.**
>
> **Todos los gráficos y recursos visuales de este proyecto son creaciones originales del autor (pilukarts) y no han sido tomados de ningún otro juego ni recurso existente.**
>
> *This project is inspired by the innovative mechanics of the Cygnus slot games by ELK Studios. All assets, story, and code in this project are original creations and not affiliated with or endorsed by ELK Studios.*
>
> *Este proyecto está inspirado en las mecánicas innovadoras de los juegos Cygnus de ELK Studios. Todos los assets, historia y código de este proyecto son creaciones originales y no están afiliadas ni aprobadas por ELK Studios.*

---

## Description

- Combine pieces on a match-3 board to attack, defend, and gain energy.
- Real-time (or turn-based) battles against other players, each with their own board and Lord.
- Four initial Lords, each representing a season, a color, a region of the world, and a cardinal direction.
- Every combination of 3 or more pieces creates **blocking circles** on the board, preventing players from getting more pieces of the same color until they are unlocked.
- Multi-platform support: Web, mobile, tablet, and future **Telegram Game**.
- Future plan to port to Godot, Unity, or Unreal.
- **Casino vision:** Future integration for betting, tournaments, and prizes.

---

## Inspiration from Cygnus (ELK Studios)

Orden of Lords is also inspired by the innovative mechanics of Cygnus 4 by ELK Studios:

- **Expandable board:** The play grid starts small and can expand during the game, unlocking new rows and more ways to win, just like in Cygnus slots.
- **Gravity mechanics:** Pieces don’t just fall down—they can slide left or right, allowing for new combinations and tactical depth.
- **Progressive multipliers:** Special symbols that reach the board’s edge or bottom can trigger or increase powerful multipliers for future matches.
- **Bonus rounds:** Occasionally, the board enters a special “bonus state,” with all rows and multipliers active, for massive potential combos and rewards.

---

## Story

The story of **Orden of Lords** tells how four Lords, each from different corners of the Earth and representing the four cardinal points and four seasons, compete and cooperate in an ancient tournament where nature and strategy intertwine.

Each Lord represents a season and a territory, united by the power of the elements. Their color and season also symbolize the region of the world they come from, adding diversity, lore, and depth to the game universe.

---

## Lords: Selection, Identity and Expansions

At the start of the game, each player selects a Lord—visible beside their board and representing a cardinal direction and a season:

- **Lord Ignis** (South, Summer, Red)
- **Lady Aqua** (North, Winter, Blue)
- **Sir Terra** (West, Autumn, Green)
- **Dama Ventus** (East, Spring, Yellow)

Each Lord’s avatar appears next to their board, showing their unique look and elemental affiliation.

**Expansions:**  
New Lords can be added in future updates—simply add their image to `assets/lords/` and update the `LORDS` array in `src/game/player.ts`.

---

## Game Piece Design

- Puzzle pieces are **circular**, each one representing a season (color/character).
- Each piece features a special visual design:
  - **Shine and gradients** for a sense of volume and luxury.
  - **Subtle textures** and graphic details to differentiate each season (snowflakes, leaves, flames, flowers, etc).
  - **Not flat circles**—they have lighting and graphic effects to stand out on any screen.
- This design works well on web, mobile, tablet, Telegram Game, and future casino adaptations.

**Visual examples:**  
- Red (Summer): Shiny circle with fire sparkles.
- Blue (Winter): Circle with cool shine and snowflakes.
- Green (Autumn): Circle with leaf texture and golden highlights.
- Yellow (Spring): Circle with flowers and warm sparkles.

---

## Online Battles & Leaderboards

- **Duel mode:** Two players compete in real-time, each with their own board and Lord. Special moves and combos can send obstacles or effects to the opponent’s board.
- **Real-time multiplayer:** Built using websockets for fast and interactive gameplay.
- **Victory & Progression:** The winner is determined by points, speed, or defeating the rival Lord. Results are sent to the server.
- **Leaderboards:** Track the best players globally, with live rankings and historical stats.

---

## Technologies

- Frontend: Phaser + TypeScript (Web, mobile, tablet, Telegram Game)
- Backend: Python (FastAPI/Flask) for matchmaking and multiplayer logic
- **Future:** Port to Godot, Unity, or Unreal for advanced and casino versions.

---

## Structure

```
OrdenOFlordsThePuzzleGame/
├── src/         # Game code (frontend)
│   ├── game/
│   │   ├── player.ts
│   │   ├── board.ts
│   │   ├── render.ts
│   └── network/
│       └── socket.ts
├── server/      # Backend (Python)
│   ├── main.py
│   └── db.py
├── assets/      # Images, sounds
│   └── lords/   # Lord avatars
│   └── pieces/  # Puzzle piece sprites
├── docs/        # Documentation and design
│   └── lords-expansion.md
├── public/      # Static files
└── README.md
```

---

## Roadmap

1. Playable prototype on web, mobile, and tablet
2. Matchmaking and real-time battles
3. Progression and rewards system
4. Telegram Game integration
5. Support for tournaments and betting (casino)
6. Port to Godot/Unity/Unreal

---

## Quick Install (Frontend)

```bash
npm install
npm run dev
```

## Backend install (Python)

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Contributing & Contact

Pull requests, ideas, and collaborations are welcome!  
Author: **pilukarts**

---

