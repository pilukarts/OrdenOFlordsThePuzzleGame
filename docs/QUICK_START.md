# Cygnus 6-Style Slot Game - Quick Start Guide

## 🎰 What This Is

A professional casino-style slot game inspired by **Cygnus 6** from ELK Studios, featuring:
- ✨ Golden circular symbols with glow effects
- 🎮 6×4 grid with cascading matches
- 💰 Professional betting system (£0.20-£10.00)
- 📈 Incremental multipliers per cascade
- 🎨 Fantasy landscape theme with ruin columns

## 🚀 Quick Start

### Install & Run:
```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Build for Production:
```bash
npm run build
npm run preview
```

## 🎮 How to Play

1. **Check Your Balance**: Starts at £100.00 (top left)
2. **Set Your Bet**: Click "⚙️ CHANGE BET" to select from £0.20 to £10.00
3. **Press SPIN**: Deducts bet from balance and starts the game
4. **Watch the Magic**:
   - Symbols drop from above with animation
   - 3+ matching connected symbols are removed
   - Remaining symbols fall down
   - New symbols fill the gaps
   - Multiplier increases (+1 per cascade)
   - Process repeats until no more matches
5. **Collect Winnings**: Total win added to your balance

## 📊 Game Rules

- **Match Requirement**: 3 or more identical symbols connected orthogonally (up/down/left/right)
- **Win Calculation**: (matched_symbols - 2) × bet × current_multiplier
- **Multiplier**: Starts at x1, increases by +1 with each cascade
- **Multiplier Reset**: Returns to x1 on next SPIN
- **Free Spins**: Do not deduct from balance (currently displayed, not yet implemented for triggers)

## 🎨 Visual Elements

### Symbol Design:
- Each mascot appears inside a **golden circle**
- **Thick golden border** (4px, #FFD700)
- **Outer glow effect** (#FFA500)
- 4 different mascot characters

### UI Layout:
- **Left Panel**: Balance, Bet, Free Spins, Multiplier
- **Center-Right**: 6×4 game grid with golden symbols
- **Background**: Fantasy landscape with cascading waterfall
- **Frame**: Ancient ruin columns around the board

## 🛠️ Technical Details

- **Framework**: Phaser 3.90.0 (WebGL)
- **Language**: TypeScript
- **React**: 19.2.0
- **Build Tool**: Vite
- **Canvas Size**: 900×650 pixels
- **Grid**: 6 columns × 4 rows (64px cells)

## 📁 Project Structure

```
src/
├── GameCanvas.tsx           # React wrapper for Phaser
├── scenes/
│   └── GameScene.tsx        # Main game logic
└── App.tsx                  # Main React app

public/
└── assets/
    ├── fantasy landscape co.png   # Background
    ├── ruin_columns.png           # Board frame
    ├── macota1.png                # Symbol 1
    ├── mascota2.png               # Symbol 2
    ├── mascota3.png               # Symbol 3
    └── mascota4.png               # Symbol 4

docs/
├── GAME_IMPLEMENTATION.md   # Detailed technical docs
└── VISUAL_LAYOUT.md         # Visual design guide
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Key Features Checklist

- [x] Golden circular symbols (Cygnus 6 style)
- [x] 6×4 game grid
- [x] Professional betting UI with modal
- [x] 8 fixed bet values (£0.20-£10.00)
- [x] Balance management
- [x] Match-3+ detection
- [x] Cascade system
- [x] Incremental multipliers
- [x] Smooth animations
- [x] Fantasy theme
- [x] No security vulnerabilities

## 📖 Documentation

- **[GAME_IMPLEMENTATION.md](./docs/GAME_IMPLEMENTATION.md)** - Complete technical documentation
- **[VISUAL_LAYOUT.md](./docs/VISUAL_LAYOUT.md)** - Visual design guide with diagrams

## 💡 Tips

- Symbols drop with bounce physics for natural feel
- Cascades continue automatically until no matches remain
- Each cascade increases your multiplier
- Higher bet = higher potential wins
- Watch your balance - can't spin with insufficient funds

## 🎨 Color Reference

- **Gold**: #FFD700 (primary UI, borders)
- **Gold Glow**: #FFA500 (symbol glow)
- **Yellow**: #ffef7a (multiplier)
- **Cyan**: #7fe0ff (free spins)
- **Green**: #4CAF50 (confirm)
- **Red**: #F44336 (cancel)

## 🔒 Security

- No external API calls
- No user data collection
- Client-side only
- Passed CodeQL security scan

## 📝 License

Private repository - All rights reserved

---

**Enjoy the game! 🎰✨**
