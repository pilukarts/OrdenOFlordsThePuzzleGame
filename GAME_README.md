# 🎮 Orden of Lords - Hexagonal Puzzle Game

A comprehensive Cygnus-style hexagonal puzzle game with pinball physics, special Lord powers, and cascading matches.

## ✨ Features

### 🎯 Core Gameplay
- **Hexagonal Grid**: 9×12 unique hexagonal playing field
- **Pinball Physics**: Gems drop through pins with realistic gravity and bounce
- **Cluster Matching**: 3+ connected gems explode with satisfying effects
- **Cascade System**: Gems fall to fill gaps, creating chain reactions
- **Combo Multipliers**: Up to ×4.0 for consecutive cascades

### 👑 Special Gems
- **Mascot Gems**: 4 types (Red, Green, Blue, Yellow) with glass marble effects
- **Lord Gems**: 4 powerful Lords (Ignis, Ventus, Aqua, Terra) with face portraits
- **Black Gems**: Penalty gems costing -£50 if not eliminated
- **Bombs**: 5 types with different explosion patterns

### 💫 Special Powers
- **Lord Powers**: ×10 multiplier when Lord touches matching mascot
- **Super Bonus**: £10,000 jackpot for activating all 4 Lords in one round
- **Area Explosions**: Bombs create spectacular chain reactions

### 🎨 Visual Polish
- Glass marble effects with shadows and highlights
- Floating and rotating animations
- Particle explosions with screen shake
- Magic sparkles and glow effects
- Epic super bonus celebration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📖 How to Play

1. **Start**: Click "SPIN" to bet and start a round
2. **Watch**: Gems drop with physics through pins
3. **Match**: 3+ connected gems explode automatically
4. **Cascade**: Gems fall to create more matches
5. **Special**: Lord powers trigger ×10 multipliers
6. **Win**: Collect rewards with multipliers

## 🎰 Game Values

### Gem Values
- Red Mascot: £5
- Green Mascot: £8
- Blue Mascot: £12
- Yellow Mascot: £15
- Lord Ignis: £100
- Lord Ventus: £120
- Lord Aqua: £150
- Lord Terra: £200

### Multipliers
- Match (3 gems): ×1.0
- Match (5 gems): ×2.0
- Match (10+ gems): ×5.0
- Cascade combo: ×1.0 to ×4.0
- Lord Power: ×10.0
- Super Bonus: £10,000 flat

### Betting
- Bet Range: £0.20 - £10.00
- Starting Balance: £1,000
- Gems per Round: 8-12

## 🏗️ Architecture

### File Structure
```
src/
├── config/
│   └── GameConfig.ts          # Complete game configuration
├── utils/
│   ├── HexGrid.ts             # Hexagonal grid utilities
│   ├── GemFactory.ts          # Gem creation & visual effects
│   ├── ClusterDetector.ts     # Match detection algorithms
│   └── ParticleEffects.ts     # Visual effects library
├── scenes/
│   └── GameScene.tsx          # Main game scene (860 lines)
└── GameCanvas.tsx             # Phaser container
```

### Key Systems
1. **HexGrid**: Coordinate conversion and neighbor detection
2. **GemFactory**: Creates gems with visual effects
3. **ClusterDetector**: Finds matching gem clusters
4. **ParticleEffects**: Explosions, sparkles, effects
5. **GameScene**: Main game loop and state management

## 🔧 Technical Details

### Technologies
- **Phaser 3**: Game engine with arcade physics
- **TypeScript**: Type-safe development
- **React**: UI framework
- **Vite**: Fast build tool

### Performance
- Target: 60 FPS
- Max Gems: ~120 concurrent
- Build Size: 1.23 MB
- Grid Cells: 108 (9×12)

### Quality
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 warnings
- ✅ CodeQL: 0 vulnerabilities
- ✅ Build: Success

## 📊 Implementation Status

### Completed (20/20)
1. ✅ Hexagonal Grid System
2. ✅ Marble Gem Effects
3. ✅ Lord Face Gems
4. ✅ Pinball Physics
5. ✅ Random Lord Spawn
6. ✅ Cluster Detection
7. ✅ Explosion & Rewards
8. ✅ Cascade System
9. ✅ Lord Powers
10. ✅ Super Bonus
11. ✅ Black Gems
12. ✅ Bombs (5 types)
13. ✅ Round System
14. ✅ Persistent Win Displays
15. ✅ UI Components
16. ✅ Frame Integration
17. ✅ Mission Tracking Data
18. ✅ Visual Polish
19. ✅ Match Multipliers
20. ✅ Combo Multipliers

### Future Enhancements
- Sound effects and music
- Obstacle system (Stone, Rock, Chain, Ice, Fog)
- Mission tracking UI
- Mobile touch controls
- Save/load system
- Online leaderboards
- Daily challenges

## 🎯 Game Strategy

### Tips for Success
1. **Watch for Lords**: Lords create ×10 multiplier opportunities
2. **Create Cascades**: Chain reactions multiply your wins
3. **Eliminate Black Gems**: Don't let them reach the end
4. **Target Super Bonus**: All 4 Lords = £10,000 jackpot
5. **Use Bombs Wisely**: Color bombs can clear entire colors

### Gem Priority
1. Lord gems (highest value + powers)
2. Yellow mascots (£15)
3. Blue mascots (£12)
4. Green mascots (£8)
5. Red mascots (£5)

## 📝 Documentation

- `IMPLEMENTATION.md` - Detailed implementation notes
- `STATUS.md` - Complete status report
- `README.md` - This file

## 🤝 Contributing

This is a demonstration project showcasing:
- Hexagonal grid game mechanics
- Physics-based gameplay
- Visual effects and polish
- TypeScript game development
- Phaser 3 integration

## 📄 License

This is a demonstration project created for educational purposes.

## 🎉 Credits

### Game Design
- Cygnus-style hexagonal puzzle mechanics
- Pinball physics inspiration
- Lord power system

### Assets
- Mascot images: `/assets/macota1.png`, `/assets/mascota2-4.png`
- Lord portraits: `/lords/LordIgnis.png`, etc.
- Frame: `/assets/ruin_columns.png`
- Background: `/assets/fantasy landscape co.png`

### Technology
- Phaser 3 game engine
- React UI framework
- TypeScript language
- Vite build tool

---

**Enjoy the game!** 🎮✨
