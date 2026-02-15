/**
 * Game Configuration
 * Complete configuration for the Cygnus-style hexagonal puzzle game
 */

export const GAME_CONFIG = {
    // ========================================
    // VERTICAL SLOT GRID CONFIGURATION
    // ========================================
    columns: 7,              // 7 vertical columns
    minRows: 4,              // Minimum 4 rows visible
    maxRows: 8,              // Maximum 8 rows (expandable)
    cellWidth: 70,           // Width of each cell
    cellHeight: 70,          // Height of each cell
    spacing: 5,              // Space between cells
    startX: 300,             // Grid start X (between pillars)
    startY: 150,             // Grid start Y
    gemRadius: 30,           // Radius for rendering
    lordGemRadius: 32,       // Lord gem radius
    gemSize: 60,             // Size of gems (deprecated, use cellWidth/cellHeight)
    columnWidth: 75,         // Column width (deprecated, use cellWidth + spacing)
    
    // ========================================
    // PHYSICS CONFIGURATION
    // ========================================
    gravity: 400,            // Vertical gravity (pixels per second squared)
    bounce: 0,               // No bounce after landing
    drag: 0,                 // No friction
    slideSpeed: 150,         // Horizontal slide speed when column full
    settleVelocityThreshold: 30,
    
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
