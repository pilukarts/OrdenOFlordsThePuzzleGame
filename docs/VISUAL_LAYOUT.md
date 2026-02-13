# Visual Layout Guide - Cygnus 6 Style Slot Game

## Screen Layout (900×650px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  FANTASY LANDSCAPE BACKGROUND (full screen)                              │
│  ╔══════════════════════╗                                                │
│  ║  LEFT PANEL (UI)     ║        ┏━━━━━━━━━━━━━━━━━━┓                  │
│  ║                      ║        ┃ RUIN COLUMNS     ┃                  │
│  ║  Balance: £100.00    ║        ┃  (FRAME)         ┃                  │
│  ║  Bet: £1.00          ║        ┃                  ┃                  │
│  ║  Free Spins: 0       ║        ┃  ⭕ ⭕ ⭕ ⭕ ⭕ ⭕  ┃                  │
│  ║  Multiplier: x1      ║        ┃  ⭕ ⭕ ⭕ ⭕ ⭕ ⭕  ┃  ← Golden circles │
│  ║                      ║        ┃  ⭕ ⭕ ⭕ ⭕ ⭕ ⭕  ┃     with mascots  │
│  ║  ┌────────────────┐  ║        ┃  ⭕ ⭕ ⭕ ⭕ ⭕ ⭕  ┃                  │
│  ║  │ ⚙️ CHANGE BET  │  ║        ┃                  ┃  6 columns       │
│  ║  └────────────────┘  ║        ┃                  ┃  4 rows          │
│  ║                      ║        ┗━━━━━━━━━━━━━━━━━━┛                  │
│  ║  ┌────────────────┐  ║                                                │
│  ║  │     SPIN       │  ║                                                │
│  ║  └────────────────┘  ║                                                │
│  ╚══════════════════════╝                                                │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Symbol Design

Each symbol is a mascot image inside a golden circular border:

```
     ╔═══════════════════════════════╗
     ║   SYMBOL (64×64px)            ║
     ║                               ║
     ║        ┌───────────┐          ║
     ║       ╱             ╲         ║
     ║      │   🐾 Mascot  │         ║ ← Outer glow (orange-gold #FFA500)
     ║      │    Image     │         ║
     ║       ╲   48×48px  ╱          ║
     ║        └───────────┘          ║ ← Main border (gold #FFD700, 4px thick)
     ║                               ║
     ╚═══════════════════════════════╝
```

## Color Palette

### Primary Colors:
- **Gold**: #FFD700 - Main UI text, borders, SPIN button background
- **Gold Glow**: #FFA500 - Symbol outer glow effect
- **Yellow Accent**: #ffef7a - Multiplier text
- **Cyan**: #7fe0ff - Free spins counter

### UI Colors:
- **Dark Background**: #1a1a2e - Modal panel background
- **Dark Panel**: #2d2d44 - Button backgrounds
- **Selected**: #4d4d64 - Selected bet option
- **Success Green**: #4CAF50 - Confirm button
- **Error Red**: #F44336 - Cancel button
- **Black Overlay**: rgba(0,0,0,0.8) - Modal overlay

## BET Modal Layout

When "⚙️ CHANGE BET" is pressed:

```
╔═══════════════════════════════════════════════╗
║                                               ║
║           SELECT YOUR BET                     ║
║           ────────────────                    ║
║                                               ║
║      ┌──────────┐      ┌──────────┐          ║
║      │  £0.20   │      │  £0.40   │          ║
║      └──────────┘      └──────────┘          ║
║                                               ║
║      ┌──────────┐      ┌──────────┐          ║
║      │  £1.00   │      │  £2.00   │          ║
║      └──────────┘      └──────────┘          ║
║                                               ║
║      ┌──────────┐      ┌──────────┐          ║
║      │  £3.00   │      │  £4.00   │          ║
║      └──────────┘      └──────────┘          ║
║                                               ║
║      ┌──────────┐      ┌──────────┐          ║
║      │  £5.00   │      │  £10.00  │          ║
║      └──────────┘      └──────────┘          ║
║                                               ║
║      ┌──────────┐      ┌──────────┐          ║
║      │ CONFIRM  │      │ CANCEL   │          ║
║      │  (green) │      │  (red)   │          ║
║      └──────────┘      └──────────┘          ║
║                                               ║
╚═══════════════════════════════════════════════╝
     ↑                                     ↑
   400px width                          550px height
```

## Animation Sequence

### 1. SPIN Animation
```
Frame 1:  Symbols above screen
          ↓ ↓ ↓ ↓ ↓ ↓
          
Frame 2:  Symbols falling
          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
          ↓ ↓ ↓ ↓ ↓ ↓
          
Frame 3:  Symbols landing (with bounce)
          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
```

### 2. Match Detection
```
Before:                  Match Found (same color):
⭕ 🟡 🟡 🟡 ⭕ ⭕          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
⭕ ⭕ ⭕ ⭕ ⭕ ⭕   →      ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
⭕ ⭕ ⭕ ⭕ ⭕ ⭕          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
⭕ ⭕ ⭕ ⭕ ⭕ ⭕          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
                        (3 symbols highlighted)
```

### 3. Cascade Removal
```
Step 1: Fade out matched     Step 2: Symbols fall     Step 3: New symbols drop
⭕ 💨 💨 💨 ⭕ ⭕          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕           ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
⭕ ⭕ ⭕ ⭕ ⭕ ⭕   →      ⭕ __ __ __ ⭕ ⭕   →     ⭕ 🆕 🆕 🆕 ⭕ ⭕
⭕ ⭕ ⭕ ⭕ ⭕ ⭕          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕           ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
⭕ ⭕ ⭕ ⭕ ⭕ ⭕          ⭕ ⭕ ⭕ ⭕ ⭕ ⭕           ⭕ ⭕ ⭕ ⭕ ⭕ ⭕
```

## Win Display

When cascades complete and player wins:

```
                    ╔═════════════════════╗
                    ║                     ║
                    ║   WIN: £45.00       ║  ← Center screen
                    ║                     ║     Animated scale & fade
                    ╚═════════════════════╝
```

## Button States

### SPIN Button:
```
Normal:    ┌─────────────┐
           │    SPIN     │  (Gold background #FFD700, black text)
           └─────────────┘

Hover:     ┌─────────────┐
           │    SPIN     │  (Slightly larger, scale 1.05)
           └─────────────┘

Disabled:  ┌─────────────┐
           │    SPIN     │  (During animations)
           └─────────────┘
```

### CHANGE BET Button:
```
Normal:    ┌─────────────────┐
           │ ⚙️ CHANGE BET   │  (Dark background #2d2d44)
           └─────────────────┘

Hover:     ┌─────────────────┐
           │ ⚙️ CHANGE BET   │  (Slightly larger)
           └─────────────────┘
```

## Typography

- **Balance**: 20px, bold, gold (#FFD700)
- **Bet**: 18px, white
- **Free Spins**: 18px, cyan (#7fe0ff)
- **Multiplier**: 18px, yellow (#ffef7a)
- **Modal Title**: 26px, bold, gold
- **Bet Options**: 20px, bold, white
- **Button Labels**: 18-24px, bold

## Spacing

- **UI Panel**: 30px from left edge
- **UI Elements**: 35px vertical spacing between items
- **Buttons**: 40px vertical spacing between buttons
- **Grid Spacing**: 0px between symbols (symbols are adjacent)
- **Modal Padding**: 20px internal padding
- **Bet Grid**: 80px vertical, 160px horizontal between bet buttons

## Assets Used

1. **fantasy landscape co.png** - Full screen background
2. **ruin_columns.png** - Game board frame (420×400px approx)
3. **macota1.png** - Mascot symbol 1 (displayed at 48×48px)
4. **mascota2.png** - Mascot symbol 2 (displayed at 48×48px)
5. **mascota3.png** - Mascot symbol 3 (displayed at 48×48px)
6. **mascota4.png** - Mascot symbol 4 (displayed at 48×48px)

All assets loaded from `/assets/` directory.

## Professional Casino Features

✅ **Professional UI**
- Clean, readable typography
- High-contrast golden theme
- Consistent spacing and alignment

✅ **Clear Betting System**
- Fixed currency values (GBP)
- Modal confirmation before bet change
- Clear balance display

✅ **Visible Feedback**
- Multiplier updates in real-time
- Win amount displayed prominently
- Balance updates immediately

✅ **Smooth Animations**
- Natural physics (bounce, easing)
- Clear visual transitions
- No jarring movements

✅ **Cygnus 6 Style**
- Golden circular symbols with glow
- Cascading mechanics
- Incremental multipliers
- Fantasy theme
