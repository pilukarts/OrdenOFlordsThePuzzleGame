/**
 * MaxWinConfig.ts
 * Configuration for the MAX WIN meter system inspired by Cygnus 5
 */

export interface MaxWinLevel {
    name: string;
    lordsRequired: number;
    multiplier: number;
    reward: number;
    color: number;
    emoji: string;
}

export const MAX_WIN_CONFIG = {
    levels: [
        { 
            name: 'Bronze', 
            lordsRequired: 3, 
            multiplier: 50, 
            reward: 50,
            color: 0xCD7F32,
            emoji: '🥉'
        },
        { 
            name: 'Silver', 
            lordsRequired: 5, 
            multiplier: 100, 
            reward: 100,
            color: 0xC0C0C0,
            emoji: '🥈'
        },
        { 
            name: 'Gold', 
            lordsRequired: 7, 
            multiplier: 200, 
            reward: 200,
            color: 0xFFD700,
            emoji: '🥇'
        },
        { 
            name: 'Platinum', 
            lordsRequired: 10, 
            multiplier: 500, 
            reward: 500,
            color: 0xE5E4E2,
            emoji: '💎'
        },
        { 
            name: 'MAX WIN', 
            lordsRequired: 15, 
            multiplier: 1000, 
            reward: 1000,
            color: 0xFF00FF,
            emoji: '👑'
        }
    ] as MaxWinLevel[],
    
    // Visual config
    meterPosition: { x: 100, y: 500 },
    meterSize: { width: 150, height: 400 },
    
    // Animation config
    fillDuration: 500,
    rewardDuration: 2000,
    
    // Persistence
    resetOnRoundEnd: false,  // Keep between rounds
    resetOnMaxWin: true      // Reset when MAX WIN is reached
};
