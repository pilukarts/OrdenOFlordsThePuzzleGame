/**
 * Game Configuration
 * Complete configuration for the Cygnus-style hexagonal puzzle game
 */

export const GAME_CONFIG = {
    // ========================================
    // VERTICAL SLOT GRID CONFIGURATION
    // ========================================
    columns: 6,              // 6 vertical columns
    minRows: 4,              // Minimum 4 rows visible
    maxRows: 8,              // Maximum 8 rows (expandable)
    cellWidth: 72,           // Width of each cell (COMPACT)
    cellHeight: 72,          // Height of each cell (COMPACT)
    spacing: 4,              // Space between cells (COMPACT - gems almost touching)
    startX: 300,             // Grid start X (between pillars)
    startY: 150,             // Grid start Y
    gemRadius: 34,           // Radius for rendering (68px diameter for compact layout)
    lordGemRadius: 34,       // Lord gem radius (same as regular gems for consistency)
    
    // ========================================
    // PHYSICS CONFIGURATION
    // ========================================
    gravity: 400,            // Vertical gravity (pixels per second squared)
    bounce: 0,               // No bounce after landing
    drag: 0,                 // No friction
    slideSpeed: 150,         // Horizontal slide speed when column full
    settleVelocityThreshold: 30,
    
    // Physics constants
    frameTime60FPS: 0.016,   // Frame time for 60 FPS calculations
    collisionTolerance: 10,  // Pixels tolerance for collision detection
    
    // ========================================
    // SPAWN RATES
    // ========================================
    mascotRates: {
        red: 0.25,
        green: 0.25,
        blue: 0.20,
        yellow: 0.20
    },
    
    lordRoundChances: {
        ignis: 0.30,
        ventus: 0.30,
        aqua: 0.25,
        terra: 0.25
    },
    
    lordSpawnChanceIfEnabled: 0.05,
    blackGemRate: 0.02,
    
    bombRates: {
        small: 0.03,
        medium: 0.015,
        large: 0.008,
        line: 0.005,
        color: 0.002
    },
    
    obstacleRates: {
        stone: 0.05,
        rock: 0.02,
        chain: 0.01,
        ice: 0.03,
        fog: 0.02
    },
    
    // ========================================
    // GEM VALUES (in £)
    // ========================================
    gemValues: {
        mascot_red: 5,
        mascot_green: 8,
        mascot_blue: 12,
        mascot_yellow: 15,
        lord_ignis: 100,
        lord_ventus: 120,
        lord_aqua: 150,
        lord_terra: 200,
        black_gem: -50,
        bomb_small: 25,
        bomb_medium: 50,
        bomb_large: 100,
        bomb_line: 150,
        bomb_color: 300,
        obstacle: 0
    },
    
    // ========================================
    // MULTIPLIERS
    // ========================================
    matchMultipliers: {
        3: 1.0,
        4: 1.5,
        5: 2.0,
        6: 2.5,
        7: 3.0,
        8: 4.0,
        9: 4.5,
        10: 5.0
    } satisfies Record<number, number>,
    
    comboMultipliers: {
        1: 1.0,
        2: 1.2,
        3: 1.5,
        4: 2.0,
        5: 3.0,
        6: 4.0
    } satisfies Record<number, number>,
    
    lordPowerMultiplier: 10,
    superBonusReward: 10000,
    
    roundConfiguration: {
        gemsPerRound: { min: 15, max: 25 },  // 15-25 gems per spin
        gemDropDelay: 100,                    // 100ms between gems
        settlementDelay: 2000
    },
    
    // ========================================
    // WAVE SYSTEM
    // ========================================
    waveBonus: 50,          // £50 per wave completed
    
    // ========================================
    // WILD MULTIPLIER
    // ========================================
    wildMultiplier: 10,     // x10 when W touches base/pillar
    
    // ========================================
    // COLORS (HEX)
    // ========================================
    colors: {
        // Mascots
        red: 0xFF0000,
        green: 0x00FF00,
        blue: 0x0000FF,
        yellow: 0xFFFF00,
        
        // Lords
        lordIgnis: 0xFF4500,
        lordIgnisGlow: 0xFF6B00,
        lordIgnisRim: 0xFFD700,
        
        lordVentus: 0x32CD32,
        lordVentusGlow: 0x90EE90,
        lordVentusRim: 0xFFFFFF,
        
        lordAqua: 0x1E90FF,
        lordAquaGlow: 0x87CEEB,
        lordAquaRim: 0xC0C0C0,
        
        lordTerra: 0xFFD700,
        lordTerraGlow: 0xFFA500,
        lordTerraRim: 0x8B4513,
        
        // Black gem
        black: 0x0a0a0a,
        blackAura: 0x2d004d,
        
        // UI
        gold: 0xFFD700,
        silver: 0xC0C0C0,
        bronze: 0x8B4513,
        white: 0xFFFFFF,
        darkBg: 0x000000
    },
    
    // ========================================
    // ANIMATIONS
    // ========================================
    animations: {
        gemFloat: {
            yOffset: 3,  // Subtle floating
            duration: 2000
        },
        gemRotate: {
            angle: 5,
            duration: 3000
        },
        lordFloat: {
            yOffset: 5,
            duration: 2500
        },
        lordRotate: {
            angle: 5,
            duration: 3000
        },
        sparkle: {
            duration: 3000
        },
        glowPulse: {
            duration: 1500
        },
        highlight: {
            alphaMin: 0.4,
            alphaMax: 0.8,
            duration: 1500
        }
    },
    
    // ========================================
    // VICTORY ANIMATION CONFIGURATION
    // ========================================
    victoryAnimation: {
        normalVictory: {
            duration: 3000,
            blinks: 4,
            blinkOnTime: 300,
            blinkOffTime: 200,
            scale: 1.15,
            glowColor: 0xFFFFFF,
            shake: 0,
            confetti: false
        },
        bigVictory: {
            duration: 4000,
            blinks: 6,
            blinkOnTime: 300,
            blinkOffTime: 200,
            scale: 1.2,
            glowColor: 0xFFD700,
            shake: 0.008,
            confetti: false
        },
        megaVictory: {
            duration: 5000,
            blinks: 8,
            blinkOnTime: 300,
            blinkOffTime: 200,
            scale: 1.3,
            glowColor: 0xFF00FF,
            shake: 0.015,
            confetti: true
        }
    },
    
    // ========================================
    // BOMB EXPLOSION RADII
    // ========================================
    bombExplosion: {
        small: 1, // 3×3 area
        medium: 2, // 5×5 area
        large: 3, // 7×7 cross
        line: -1, // Full row or column
        color: -2 // All of one color
    },
    
};

/**
 * Lord Configuration
 */
export const LORD_CONFIG = {
    ignis: {
        id: 'ignis',
        name: 'LORD IGNIS',
        element: 'Fire',
        baseColor: 0xFF4500,
        glowColor: 0xFF6B00,
        rimColor: 0xFFD700,
        assetKey: 'lord_ignis_face',
        assetPath: '/OrdenOFlordsThePuzzleGame/lords/LordIgnis.png',
        matchColor: 'red',
        value: 100,
        spawnChance: 0.30,
        emoji: '🔥'
    },
    ventus: {
        id: 'ventus',
        name: 'LORD VENTUS',
        element: 'Wind',
        baseColor: 0x32CD32,
        glowColor: 0x90EE90,
        rimColor: 0xFFFFFF,
        assetKey: 'lord_ventus_face',
        assetPath: '/OrdenOFlordsThePuzzleGame/lords/dama ventus.png',
        matchColor: 'green',
        value: 120,
        spawnChance: 0.30,
        emoji: '🌬️'
    },
    aqua: {
        id: 'aqua',
        name: 'LORD AQUA',
        element: 'Water',
        baseColor: 0x1E90FF,
        glowColor: 0x87CEEB,
        rimColor: 0xC0C0C0,
        assetKey: 'lord_aqua_face',
        assetPath: '/OrdenOFlordsThePuzzleGame/lords/ladyaqua.png',
        matchColor: 'blue',
        value: 150,
        spawnChance: 0.25,
        emoji: '💧'
    },
    terra: {
        id: 'terra',
        name: 'LORD TERRA',
        element: 'Earth',
        baseColor: 0xFFD700,
        glowColor: 0xFFA500,
        rimColor: 0x8B4513,
        assetKey: 'lord_terra_face',
        assetPath: '/OrdenOFlordsThePuzzleGame/lords/sirterra.png',
        matchColor: 'yellow',
        value: 200,
        spawnChance: 0.25,
        emoji: '🍃'
    }
};

/**
 * Mascot Configuration
 */
export const MASCOT_CONFIG = {
    red: {
        id: 'red',
        color: 0xFF0000,
        value: 5,
        assetKey: 'mascot1',
        assetPath: '/OrdenOFlordsThePuzzleGame/assets/macota1.png'
    },
    green: {
        id: 'green',
        color: 0x00FF00,
        value: 8,
        assetKey: 'mascot2',
        assetPath: '/OrdenOFlordsThePuzzleGame/assets/mascota2.png'
    },
    blue: {
        id: 'blue',
        color: 0x0000FF,
        value: 12,
        assetKey: 'mascot3',
        assetPath: '/OrdenOFlordsThePuzzleGame/assets/mascota3.png'
    },
    yellow: {
        id: 'yellow',
        color: 0xFFFF00,
        value: 15,
        assetKey: 'mascot4',
        assetPath: '/OrdenOFlordsThePuzzleGame/assets/mascota4.png'
    }
};

/**
 * Get match multiplier based on cluster size
 */
export function getMatchMultiplier(clusterSize: number): number {
    const multipliers = GAME_CONFIG.matchMultipliers as Record<number, number>;
    return multipliers[clusterSize] || multipliers[10];
}

/**
 * Get combo multiplier based on cascade level
 */
export function getComboMultiplier(cascadeLevel: number): number {
    const multipliers = GAME_CONFIG.comboMultipliers as Record<number, number>;
    return multipliers[cascadeLevel] || multipliers[6];
}

/**
 * RTP (Return to Player) Configuration
 * Controls game fairness and win distribution
 */
export const RTP_CONFIG = {
    targetRTP: 96,          // 96% RTP (industry standard)
    volatility: 'medium',
    
    // Gem probability weights (total = 100)
    gemWeights: {
        // Mascots (common) - 70%
        mascot_red: 17.5,
        mascot_green: 17.5,
        mascot_blue: 17.5,
        mascot_yellow: 17.5,
        
        // Lords (rare) - 28%
        lord_ignis: 7,
        lord_ventus: 7,
        lord_aqua: 7,
        lord_terra: 7,
        
        // Bombs (rare) - 2%
        bomb_small: 1,
        bomb_medium: 0.5,
        bomb_large: 0.3,
        bomb_line: 0.1,
        bomb_color: 0.1
    },
    
    // Win/loss control
    maxConsecutiveWins: 3,      // Force loss after 3 wins
    minConsecutiveLosses: 2,    // Force win after 2 losses
    
    // Win size distribution
    winDistribution: {
        noWin: 45,          // 45% no win
        smallWin: 35,       // 35% small win (1x-2x bet)
        mediumWin: 15,      // 15% medium (2x-5x bet)
        bigWin: 4,          // 4% big (5x-10x bet)
        megaWin: 1          // 1% mega (10x+ bet)
    },
    
    // Cascade configuration
    maxCascades: 5,             // Maximum cascades per round
    refillRowsPerCascade: 2     // Max rows added per cascade
};

/**
 * Grid Configuration for Compact Layout
 * Gems almost touching for Cygnus-style appearance
 */
export const GRID_CONFIG = {
    columns: 6,
    startRows: { min: 3, max: 4 },     // Random 3 or 4 rows per spin
    maxRows: 8,
    
    // COMPACT spacing (gems almost touching)
    cellWidth: 72,
    cellHeight: 72,
    gemSize: 68,        // Gem fills almost entire cell
    gap: 4,             // Only 4px between gems
    
    playArea: {
        left: 380,
        right: 950,
        top: 200,
        bottom: 650
    }
};
