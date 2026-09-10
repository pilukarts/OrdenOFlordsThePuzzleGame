/**
 * GameScene.tsx
 * Grid-based puzzle game with tween animations
 */

import Phaser from 'phaser';
import { GAME_CONFIG, LORD_CONFIG, MASCOT_CONFIG, RTP_CONFIG, getMatchMultiplier, getComboMultiplier } from '../config/GameConfig';
import { MAX_WIN_CONFIG, type MaxWinLevel } from '../config/MaxWinConfig';
import { createMascotGem, createLordGem, createBlackGem, createBombGem, getRandomGemType } from '../utils/GemFactory';
import {
    detectAllMatches,
    checkLordPower, 
    findAllGemsOfColor, 
    getBombExplosionGems 
} from '../utils/ClusterDetector';
import type { Cluster } from '../utils/ClusterDetector';
import { 
    createExplosion, 
    shakeScreen, 
    createLordPowerEffect, 
    createSuperBonusEffect, 
    createWinText,
    createConfetti,
    createVictoryGlow
} from '../utils/ParticleEffects';

type LordKey = keyof typeof LORD_CONFIG;

export class GameScene extends Phaser.Scene {
    // Grid and gems
    private grid: (Phaser.GameObjects.Container | null)[][] = [];
    private activeRows = 4;  // Current number of active rows (starts at 4, can expand to 11)
    
    // Game state
    private balance = 1000;
    private currentBet = 1.0;
    private roundInProgress = false;
    private cascadeLevel = 0;
    private roundWinnings = 0;  // Accumulated winnings for the current round
    private lordsThisRound: string[] = [];
    private lordsActivatedThisRound = new Set<string>();
    private waveNumber = 0;
    private bonusActive = false;
    private bonusTriggered = false;
    private bonusSpinsRemaining = 0;
    private background?: Phaser.GameObjects.Image;
    private bonusNightOverlay?: Phaser.GameObjects.Rectangle;
    private bonusLabel?: Phaser.GameObjects.Text;
    private bonusPrizeTotal = 0;
    private bonusPrizeText?: Phaser.GameObjects.Text;
    private selectedBonusLord?: LordKey;
    private bonusDice?: Phaser.GameObjects.Container;
    private bonusDiceSymbol?: Phaser.GameObjects.Text;
    private bonusLordCard?: Phaser.GameObjects.Container;
    private bonusRollInProgress = false;
    
    // RTP tracking system
    private rtpTracker = {
        totalBets: 0,
        totalWins: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        sessionRTP: 100
    };
    private resultDisplay: Phaser.GameObjects.Text | null = null;
    
    // Cache for gem weight total (computed once)
    private gemWeightTotal = 0;
    
    // UI elements
    private balanceText?: Phaser.GameObjects.Text;
    private betText?: Phaser.GameObjects.Text;
    private roundInfoText?: Phaser.GameObjects.Text;
    private lordsIndicator?: Phaser.GameObjects.Container;
    private winDisplays: Phaser.GameObjects.Text[] = [];
    
    // MAX WIN system
    private lordsCaptured: number = 0;
    private maxWinMeter?: Phaser.GameObjects.Container;
    private maxWinProgressBar?: Phaser.GameObjects.Graphics;
    private maxWinText?: Phaser.GameObjects.Text;
    
    // Frame bounds
    private frameCenterX = 0;
    private frameCenterY = 0;
    


    constructor() {
        super({ key: 'GameScene' });
        // Cache gem weight total for performance
        this.gemWeightTotal = Object.values(RTP_CONFIG.gemWeights).reduce((a, b) => a + b, 0);
    }

    preload() {
        // Background
        this.load.image('background', '/OrdenOFlordsThePuzzleGame/assets/fantasy landscape co.png');
        
        // Frame
        this.load.image('frame', '/OrdenOFlordsThePuzzleGame/assets/ruin_columns.png');
        
        // Mascots
        this.load.image(MASCOT_CONFIG.red.assetKey, MASCOT_CONFIG.red.assetPath);
        this.load.image(MASCOT_CONFIG.green.assetKey, MASCOT_CONFIG.green.assetPath);
        this.load.image(MASCOT_CONFIG.blue.assetKey, MASCOT_CONFIG.blue.assetPath);
        this.load.image(MASCOT_CONFIG.yellow.assetKey, MASCOT_CONFIG.yellow.assetPath);
        
        // Lords
        this.load.image(LORD_CONFIG.ignis.assetKey, LORD_CONFIG.ignis.assetPath);
        this.load.image(LORD_CONFIG.ventus.assetKey, LORD_CONFIG.ventus.assetPath);
        this.load.image(LORD_CONFIG.aqua.assetKey, LORD_CONFIG.aqua.assetPath);
        this.load.image(LORD_CONFIG.terra.assetKey, LORD_CONFIG.terra.assetPath);
        
        // Create simple particle texture
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.background = this.add.image(0, 0, 'background');
        this.background.setOrigin(0, 0);
        this.background.setDisplaySize(width, height);
        this.background.setDepth(0);
        

        this.frameCenterX = width / 2;
        this.frameCenterY = height / 2;
        
        // Note: We keep the frame image but it should only show pillars
        const frame = this.add.image(this.frameCenterX, this.frameCenterY, 'frame');
        frame.setOrigin(0.5, 0.5);
        frame.setScale(1);
        frame.setDepth(1);
        frame.setAlpha(0); // Hide the arch, keep only background columns

        this.createGemChannels();
        
        // Initialize empty grid
        this.initializeGrid();
        
        // Create UI
        this.createUI();
        
        // Create Lords indicator
        this.createLordsIndicator();
        
        // Create MAX WIN meter
        this.createMaxWinMeter();
    }

    // ========================================
    // INITIALIZATION METHODS
    // ========================================
    
    private initializeGrid(): void {
        this.grid = [];
        for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GAME_CONFIG.columns; col++) {
                this.grid[row][col] = null;
            }
        }
    }

    private async clearBoard(): Promise<void> {
        const gems = this.grid.flat().filter((gem): gem is Phaser.GameObjects.Container => gem !== null);
        if (gems.length === 0) return;

        gems.forEach(gem => {
            this.tweens.killTweensOf(gem);
            gem.each((child: Phaser.GameObjects.GameObject) => this.tweens.killTweensOf(child));
        });

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: gems,
                alpha: 0,
                scale: 0.65,
                duration: 180,
                ease: 'Sine.easeIn',
                onComplete: () => {
                    gems.forEach(gem => gem.destroy());
                    this.initializeGrid();
                    resolve();
                }
            });
        });
    }

    private createGemChannels(): void {
        const laneHeight = 600;
        const laneTop = GAME_CONFIG.playArea.bottom - laneHeight;
        for (let col = 0; col < GAME_CONFIG.columns; col++) {
            const x = this.getGridX(col);
            const lane = this.add.rectangle(x, laneTop + laneHeight / 2, 70, laneHeight, 0x09111f, 0.24);
            lane.setStrokeStyle(2, 0xd8b85a, 0.34).setDepth(0);
            this.add.line(0, 0, x - 29, laneTop, x - 29, GAME_CONFIG.playArea.bottom, 0xe9cf7a, 0.22).setOrigin(0).setDepth(0);
            this.add.line(0, 0, x + 29, laneTop, x + 29, GAME_CONFIG.playArea.bottom, 0xe9cf7a, 0.22).setOrigin(0).setDepth(0);
        }
    }

    // ========================================
    // GRID HELPER METHODS
    // ========================================
    
    /**
     * Calculate X position for a grid column
     */
    private getGridX(col: number): number {
        const playableWidth = GAME_CONFIG.playArea.right - GAME_CONFIG.playArea.left;
        const cellWidth = playableWidth / GAME_CONFIG.columns;
        return GAME_CONFIG.playArea.left + (col * cellWidth) + (cellWidth / 2);
    }
    
    /**
     * Calculate Y position for a grid row
     * Row 0 is at bottom, higher rows are higher up
     */
    private getGridY(row: number): number {
        const rowSpacing = 56;
        return GAME_CONFIG.playArea.bottom - (row * rowSpacing) - (rowSpacing / 2);
    }
    
    /**
     * Wait for a specified duration
     */
    private wait(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.time.delayedCall(ms, () => resolve());
        });
    }


    // ========================================
    // UI CREATION METHODS
    // ========================================
    
    private createUI(): void {
        const panelX = 100;
        const panelY = 150;
        
        // UI background
        const bg = this.add.rectangle(panelX, panelY, 180, 350, 0x000000, 0.7);
        bg.setStrokeStyle(3, GAME_CONFIG.colors.gold);
        bg.setDepth(10);
        
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        };
        
        // Balance
        this.balanceText = this.add.text(
            panelX, panelY - 120,
            `Balance: £${this.balance.toFixed(2)}`,
            textStyle
        ).setOrigin(0.5).setDepth(11);
        
        // Bet
        this.betText = this.add.text(
            panelX, panelY - 80,
            `Bet: £${this.currentBet.toFixed(2)}`,
            textStyle
        ).setOrigin(0.5).setDepth(11);
        
        // Round info
        this.roundInfoText = this.add.text(
            panelX, panelY - 40,
            'Ready to Spin',
            { ...textStyle, fontSize: '14px' }
        ).setOrigin(0.5).setDepth(11);
        
        // Spin button
        this.createButton(
            panelX, panelY + 50,
            160, 60,
            'SPIN',
            GAME_CONFIG.colors.gold,
            () => this.startRound()
        );
        
        // Change bet button
        this.createButton(
            panelX, panelY + 130,
            160, 45,
            'CHANGE BET',
            0x8B5CF6,
            () => this.showBetModal()
        );

        this.bonusPrizeText = this.add.text(this.cameras.main.width / 2, 38, '', {
            fontSize: '22px',
            color: '#FF4DDB',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#11051CCC',
            padding: { x: 14, y: 7 },
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1100).setVisible(false);
    }
    
    private createButton(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        color: number,
        callback: () => void
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 15);
        bg.lineStyle(3, 0xFFFFFF, 0.8);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 15);
        
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '20px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        container.add([bg, buttonText]);
        container.setSize(width, height);
        container.setDepth(11);
        container.setInteractive();
        
        container.on('pointerover', () => container.setScale(1.05));
        container.on('pointerout', () => container.setScale(1));
        container.on('pointerdown', callback);
        
        return container;
    }
    
    private createLordsIndicator(): void {
        const x = this.cameras.main.width - 120;
        const y = 200;
        
        this.lordsIndicator = this.add.container(x, y);
        this.lordsIndicator.setDepth(10);
        
        // Title
        const title = this.add.text(0, -80, 'LORDS\nTHIS ROUND', {
            fontSize: '16px',
            color: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.lordsIndicator.add(title);
    }
    
    private updateLordsIndicator(): void {
        if (!this.lordsIndicator) return;
        
        // Clear old indicators
        this.lordsIndicator.removeAll(true);
        
        // Title
        const title = this.add.text(0, -80, 'LORDS\nTHIS ROUND', {
            fontSize: '16px',
            color: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.lordsIndicator.add(title);
        
        // Show active lords
        this.lordsThisRound.forEach((lordType, index) => {
            const config = LORD_CONFIG[lordType as keyof typeof LORD_CONFIG];
            const yPos = index * 50;
            
            const bg = this.add.rectangle(0, yPos, 100, 40, config.baseColor, 0.8);
            bg.setStrokeStyle(2, config.rimColor);
            
            const text = this.add.text(0, yPos, config.emoji, {
                fontSize: '24px'
            }).setOrigin(0.5);
            
            this.lordsIndicator?.add([bg, text]);
        });
    }

    // ========================================
    // MAX WIN METER SYSTEM
    // ========================================
    
    private createMaxWinMeter(): void {
        const config = MAX_WIN_CONFIG;
        const { x, y } = config.meterPosition;
        const { width, height } = config.meterSize;
        
        this.maxWinMeter = this.add.container(x, y);
        this.maxWinMeter.setDepth(20);
        
        // Ancient ruined tower surrounding the match-energy slots.
        const ruinFrame = this.add.graphics();
        ruinFrame.fillStyle(0x080b10, 0.9);
        ruinFrame.fillRoundedRect(-width / 2 + 13, -height / 2 + 32, width - 26, height - 66, 8);
        ruinFrame.lineStyle(2, 0x9f873f, 0.5);
        ruinFrame.strokeRoundedRect(-width / 2 + 13, -height / 2 + 32, width - 26, height - 66, 8);

        const stoneColors = [0x59584f, 0x45463f, 0x69675b, 0x3b3e39];
        const stoneStep = (height - 88) / 9;
        for (let index = 0; index < 9; index++) {
            const stoneY = -height / 2 + 42 + index * stoneStep;
            const offset = index % 2 === 0 ? 0 : 3;
            ruinFrame.fillStyle(stoneColors[index % stoneColors.length], 1);
            ruinFrame.fillRoundedRect(-width / 2 - offset, stoneY, 24, 32, 4);
            ruinFrame.fillRoundedRect(width / 2 - 24 + offset, stoneY, 24, 32, 4);
            ruinFrame.lineStyle(1, 0xb9ae85, 0.32);
            ruinFrame.strokeRoundedRect(-width / 2 - offset, stoneY, 24, 32, 4);
            ruinFrame.strokeRoundedRect(width / 2 - 24 + offset, stoneY, 24, 32, 4);
        }

        [-52, -17, 18].forEach((stoneX, index) => {
            ruinFrame.fillStyle(stoneColors[(index + 1) % stoneColors.length], 1);
            ruinFrame.fillRoundedRect(stoneX, -height / 2 + 4 + (index === 1 ? -5 : 0), 34, 30, 4);
            ruinFrame.fillRoundedRect(stoneX, height / 2 - 35 + (index === 2 ? 3 : 0), 34, 31, 4);
        });

        ruinFrame.lineStyle(4, 0x315b20, 0.9);
        ruinFrame.beginPath();
        ruinFrame.moveTo(-width / 2 + 8, -height / 2 + 28);
        ruinFrame.lineTo(-width / 2 + 18, -height / 2 + 92);
        ruinFrame.lineTo(-width / 2 + 8, -height / 2 + 145);
        ruinFrame.strokePath();

        const crestGlow = this.add.circle(0, -height / 2 + 7, 22, 0xFFD45A, 0.16)
            .setBlendMode(Phaser.BlendModes.ADD);
        const crestStone = this.add.circle(0, -height / 2 + 7, 16, 0x4F5049, 1)
            .setStrokeStyle(3, 0xD6B550, 0.9);
        const crestRune = this.add.text(0, -height / 2 + 6, '✦', {
            fontSize: '18px', color: '#FFE48A', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({ targets: crestGlow, alpha: 0.4, scale: 1.2, duration: 850, yoyo: true, repeat: -1 });
        
        // Title
        const title = this.add.text(0, -height/2 + 46, 'MATCH TOWER', {
            fontSize: '16px',
            color: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Progress bar background
        const barBg = this.add.rectangle(0, 0, width - 48, height - 100, 0x10141B, 0.94);
        barBg.setStrokeStyle(2, 0xC9A84C, 0.45);
        
        // Progress bar fill (initially empty)
        this.maxWinProgressBar = this.add.graphics();
        
        // Counter text
        this.maxWinText = this.add.text(0, height/2 - 40, '0/15 Matches', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.maxWinMeter.add([ruinFrame, crestGlow, crestStone, crestRune, title, barBg, this.maxWinProgressBar, this.maxWinText]);
        
        this.updateMaxWinMeter();
    }
    
    private updateMaxWinMeter(): void {
        if (!this.maxWinProgressBar || !this.maxWinText) return;
        
        const config = MAX_WIN_CONFIG;
        const maxLords = config.levels[config.levels.length - 1].lordsRequired;
        // Find current level
        let currentLevel = config.levels[config.levels.length - 1];
        for (const level of config.levels) {
            if (this.lordsCaptured < level.lordsRequired) {
                currentLevel = level;
                break;
            }
        }
        
        // Update progress bar
        const { width, height } = config.meterSize;
        const barHeight = height - 100;
        const blockCount = maxLords;
        const blockGap = 4;
        const blockHeight = (barHeight - blockGap * (blockCount - 1)) / blockCount;
        const blockWidth = width - 56;
        const litBlocks = Math.min(this.lordsCaptured, blockCount);

        this.maxWinProgressBar.clear();
        for (let index = 0; index < blockCount; index++) {
            const blockNumber = index + 1;
            const blockLevel = config.levels.find(level => blockNumber <= level.lordsRequired)
                ?? config.levels[config.levels.length - 1];
            const y = barHeight / 2 - blockHeight * (index + 1) - blockGap * index;
            const isLit = index < litBlocks;

            this.maxWinProgressBar.fillStyle(isLit ? blockLevel.color : 0x151821, isLit ? 1 : 0.88);
            this.maxWinProgressBar.fillRoundedRect(-blockWidth / 2, y, blockWidth, blockHeight, 3);
            this.maxWinProgressBar.lineStyle(1.5, isLit ? 0xFFFFFF : 0x555B68, isLit ? 0.72 : 0.5);
            this.maxWinProgressBar.strokeRoundedRect(-blockWidth / 2, y, blockWidth, blockHeight, 3);
        }
        
        // Update text
        this.maxWinText?.setText(`${this.lordsCaptured}/${maxLords} Matches\n${currentLevel.emoji} ${currentLevel.name}`);
        
        // Animate if just updated
        if (this.maxWinMeter) {
            this.tweens.add({
                targets: this.maxWinMeter,
                scale: { from: 1, to: 1.05 },
                duration: 300,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    private checkWildLanding(gem: Phaser.GameObjects.Container, row: number, col: number): void {
        const lordType = gem.getData('lordType');
        if (!lordType) return;
        
        const isBase = (row === GAME_CONFIG.maxRows - 1);
        
        if (isBase) {
            // Base landing: Check for merge opportunity
            this.checkLordMerge(gem, row, col, lordType);
        } else {
            // Mid-air landing: Convert to coins and feed MAX WIN meter
            this.convertLordToCoins(gem, row, col, lordType);
        }
    }
    
    private checkLordMerge(
        lordGem: Phaser.GameObjects.Container, 
        row: number, 
        col: number, 
        lordType: string
    ): void {
        // Simple 4-neighbor check (up, down, left, right)
        const neighbors = [
            { col: col - 1, row: row },
            { col: col + 1, row: row },
            { col: col, row: row - 1 },
            { col: col, row: row + 1 }
        ].filter(n => 
            n.col >= 0 && n.col < GAME_CONFIG.columns &&
            n.row >= 0 && n.row < GAME_CONFIG.maxRows
        );
        
        const lordConfig = LORD_CONFIG[lordType as keyof typeof LORD_CONFIG];
        const matchColor = lordConfig.matchColor;
        
        // Find adjacent gems of matching color
        const matchingNeighbors: { col: number; row: number; gem: Phaser.GameObjects.Container }[] = [];
        
        for (const neighbor of neighbors) {
            const gem = this.grid[neighbor.row]?.[neighbor.col];
            if (!gem) continue;
            
            const gemColor = gem.getData('color');
            if (gemColor === matchColor) {
                matchingNeighbors.push({ col: neighbor.col, row: neighbor.row, gem });
            }
        }
        
        // Need at least 2 matching neighbors for merge
        if (matchingNeighbors.length >= 2) {
            this.triggerLordMerge(lordGem, matchingNeighbors, lordType);
        } else {
            // Not enough neighbors - treat as mid-air
            this.convertLordToCoins(lordGem, row, col, lordType);
        }
    }
    
    private triggerLordMerge(
        lordGem: Phaser.GameObjects.Container,
        matchingNeighbors: { col: number; row: number; gem: Phaser.GameObjects.Container }[],
        lordType: string
    ): void {
        const lordConfig = LORD_CONFIG[lordType as keyof typeof LORD_CONFIG];
        
        // Calculate mega reward
        const baseValue = GAME_CONFIG.gemValues[`lord_${lordType}` as keyof typeof GAME_CONFIG.gemValues] || 50;
        const neighborValue = matchingNeighbors.length * 10;
        const megaMultiplier = 5; // 5x for merge
        const totalReward = (baseValue + neighborValue) * megaMultiplier * this.currentBet;
        
        // Visual: Mega explosion
        createLordPowerEffect(this, lordGem.x, lordGem.y, lordConfig.baseColor);
        shakeScreen(this, 2);
        
        // Destroy lord and neighbors
        lordGem.destroy();
        matchingNeighbors.forEach(n => {
            createExplosion(this, n.gem.x, n.gem.y, lordConfig.baseColor, 2);
            n.gem.destroy();
            this.grid[n.row][n.col] = null;
        });
        
        // Destroy from grid
        const lordRow = lordGem.getData('row');
        const lordCol = lordGem.getData('col');
        this.grid[lordRow][lordCol] = null;
        
        // Award mega win
        this.addWin(totalReward, true);
        
        // Show special text
        const megaText = this.add.text(
            lordGem.x, lordGem.y,
            `MEGA MERGE!\n+£${totalReward.toFixed(2)}`,
            {
                fontSize: '32px',
                color: '#FFD700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(500);
        
        this.tweens.add({
            targets: megaText,
            y: megaText.y - 100,
            alpha: { from: 1, to: 0 },
            duration: 2000,
            onComplete: () => megaText.destroy()
        });
        
        // Also feed MAX WIN meter
        this.feedMaxWinMeter();
    }
    
    private convertLordToCoins(
        lordGem: Phaser.GameObjects.Container,
        row: number,
        col: number,
        lordType: string
    ): void {
        const baseValue = GAME_CONFIG.gemValues[`lord_${lordType}` as keyof typeof GAME_CONFIG.gemValues] || 50;
        const coinReward = baseValue * 2 * this.currentBet; // 2x for mid-air
        
        // Visual effect
        createExplosion(this, lordGem.x, lordGem.y, 0xFFD700, 1.5);
        
        // Show coins animation
        const coinText = this.add.text(
            lordGem.x, lordGem.y,
            `💰 +£${coinReward.toFixed(2)}`,
            {
                fontSize: '24px',
                color: '#FFD700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(500);
        
        this.tweens.add({
            targets: coinText,
            y: coinText.y - 80,
            alpha: { from: 1, to: 0 },
            duration: 1500,
            onComplete: () => coinText.destroy()
        });
        
        // Destroy gem
        lordGem.destroy();
        this.grid[row][col] = null;
        
        // Award coins
        this.addWin(coinReward, false);
        
        // Feed MAX WIN meter (CRITICAL)
        this.feedMaxWinMeter();
    }
    
    private feedMaxWinMeter(amount: number = 1): void {
        const previousTotal = this.lordsCaptured;
        this.lordsCaptured += amount;
        this.updateMaxWinMeter();

        const matchText = this.add.text(100, 365, `+${amount} MATCH${amount === 1 ? '' : 'ES'}`, {
            fontSize: '18px',
            color: '#66CCFF',
            fontStyle: 'bold',
            stroke: '#00152A',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
            targets: matchText,
            y: matchText.y - 45,
            alpha: 0,
            duration: 900,
            ease: 'Cubic.easeOut',
            onComplete: () => matchText.destroy()
        });
        
        const config = MAX_WIN_CONFIG;
        
        // Trigger every milestone crossed, including when several matches
        // explode together in the same cascade.
        for (const level of config.levels) {
            if (previousTotal < level.lordsRequired && this.lordsCaptured >= level.lordsRequired) {
                this.triggerMaxWinLevel(level);
            }
        }

        if (this.lordsCaptured > 6 && !this.bonusTriggered) {
            this.activateBonusMode();
        }
    }

    private activateBonusMode(): void {
        this.bonusTriggered = true;
        this.bonusActive = true;
        this.bonusSpinsRemaining = 10;

        const { width, height } = this.cameras.main;
        this.background?.setTint(0x34426f);

        this.bonusNightOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x07122f, 0)
            .setDepth(0).setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.tweens.add({ targets: this.bonusNightOverlay, alpha: 0.52, duration: 1400 });

        const goldenLight = this.add.rectangle(width / 2, height / 2, width, height, 0xffb300, 0)
            .setDepth(1).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
            targets: goldenLight,
            alpha: { from: 0.05, to: 0.2 },
            duration: 900,
            yoyo: true,
            repeat: 3,
            onComplete: () => goldenLight.destroy()
        });

        createConfetti(this);
        shakeScreen(this, 2);
        const entrance = this.add.text(width / 2, height / 2, 'BONUS UNLOCKED!\n10 FREE SPINS', {
            fontSize: '58px', color: '#FFD86B', fontStyle: 'bold', align: 'center',
            stroke: '#3A1600', strokeThickness: 10
        }).setOrigin(0.5).setDepth(1200).setScale(0.2);
        this.tweens.add({
            targets: entrance, scale: 1, duration: 650, ease: 'Back.easeOut',
            yoyo: true, hold: 1400,
            onComplete: () => entrance.destroy()
        });

        this.bonusLabel = this.add.text(width - 105, 42, 'BONUS 10/10', {
            fontSize: '24px', color: '#FFD86B', fontStyle: 'bold',
            stroke: '#07122F', strokeThickness: 6
        }).setOrigin(0.5).setDepth(1100);
        this.tweens.add({ targets: this.bonusLabel, alpha: 0.55, duration: 600, yoyo: true, repeat: -1 });
        this.createBonusLordDice();
    }

    private createBonusLordDice(): void {
        this.selectedBonusLord = undefined;
        this.bonusRollInProgress = false;
        this.bonusDice?.destroy();

        this.bonusDice = this.add.container(225, 495).setDepth(1150).setAlpha(0.58);
        const stone = this.add.graphics();
        stone.fillStyle(0x30343A, 0.98);
        stone.fillRoundedRect(-43, -43, 86, 86, 13);
        stone.lineStyle(4, 0xD2AE48, 0.92);
        stone.strokeRoundedRect(-43, -43, 86, 86, 13);
        stone.lineStyle(2, 0x15171B, 0.75);
        stone.lineBetween(-31, -24, -12, -34);
        stone.lineBetween(18, 29, 35, 18);

        this.bonusDiceSymbol = this.add.text(0, -4, '⚄', {
            fontSize: '52px', color: '#FFE073',
            stroke: '#281600', strokeThickness: 5
        }).setOrigin(0.5);
        const label = this.add.text(0, 61, 'ROLL LORD', {
            fontSize: '14px', color: '#FFF1B8', fontStyle: 'bold',
            backgroundColor: '#080B10CC', padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        this.bonusDice.add([stone, this.bonusDiceSymbol, label]);
        this.bonusDice.setSize(92, 118);
    }

    private enableBonusLordRoll(): void {
        if (!this.bonusDice) return;
        this.bonusDice.setAlpha(1).setInteractive({ useHandCursor: true });
        this.bonusDice.once('pointerdown', () => this.rollBonusLord());
        this.tweens.add({ targets: this.bonusDice, scale: 1.08, duration: 520, yoyo: true, repeat: -1 });
        this.updateUI('Roll the Lord die!');
    }

    private rollBonusLord(): void {
        if (this.bonusRollInProgress || !this.bonusDice || !this.bonusDiceSymbol) return;
        this.bonusRollInProgress = true;
        this.bonusDice.disableInteractive();
        this.tweens.killTweensOf(this.bonusDice);
        this.tweens.add({
            targets: this.bonusDice,
            angle: 720,
            scale: { from: 1, to: 1.25 },
            duration: 1150,
            ease: 'Cubic.easeInOut',
            onUpdate: (_tween, target) => {
                const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
                const index = Math.floor(Math.abs(target.angle) / 45) % faces.length;
                this.bonusDiceSymbol?.setText(faces[index]);
            },
            onComplete: () => {
                const lordKeys = Object.keys(LORD_CONFIG) as LordKey[];
                this.selectedBonusLord = Phaser.Utils.Array.GetRandom(lordKeys);
                this.showSelectedBonusLord(this.selectedBonusLord);
                this.bonusDice?.destroy();
                this.bonusDice = undefined;
                this.time.delayedCall(1400, () => {
                    this.roundInProgress = false;
                    void this.startRound(true);
                });
            }
        });
    }

    private showSelectedBonusLord(lordKey: LordKey): void {
        const lord = LORD_CONFIG[lordKey];
        this.bonusLordCard?.destroy();
        this.bonusLordCard = this.add.container(225, 495).setDepth(1150).setScale(0.2);
        const glow = this.add.circle(0, 0, 50, lord.glowColor, 0.25).setBlendMode(Phaser.BlendModes.ADD);
        const ring = this.add.circle(0, 0, 43, 0x070A10, 0.94).setStrokeStyle(5, lord.baseColor, 1);
        const portrait = this.add.image(0, 0, lord.assetKey).setDisplaySize(76, 76);
        const name = this.add.text(0, 61, lord.name, {
            fontSize: '13px', color: `#${lord.baseColor.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold', backgroundColor: '#070A10DD', padding: { x: 7, y: 4 }
        }).setOrigin(0.5);
        const power = this.add.text(0, 86, `${lord.matchColor.toUpperCase()} ×2`, {
            fontSize: '13px', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.bonusLordCard.add([glow, ring, portrait, name, power]);
        this.tweens.add({ targets: this.bonusLordCard, scale: 1, duration: 520, ease: 'Back.easeOut' });
        this.tweens.add({ targets: glow, alpha: 0.5, scale: 1.18, duration: 700, yoyo: true, repeat: -1 });
    }

    private finishBonusMode(): void {
        this.bonusActive = false;
        this.bonusTriggered = false;
        this.bonusSpinsRemaining = 0;
        this.background?.clearTint();
        this.bonusNightOverlay?.destroy();
        this.bonusNightOverlay = undefined;
        this.bonusLabel?.destroy();
        this.bonusLabel = undefined;
        this.bonusDice?.destroy();
        this.bonusDice = undefined;
        this.bonusLordCard?.destroy();
        this.bonusLordCard = undefined;
        this.selectedBonusLord = undefined;
        this.lordsCaptured = 0;
        this.updateMaxWinMeter();
    }
    
    private triggerMaxWinLevel(level: MaxWinLevel): void {
        const reward = level.reward * this.currentBet;
        
        // Visual effect
        createSuperBonusEffect(this);
        shakeScreen(this, 3);
        
        // Show level achievement
        const levelText = this.add.text(
            this.frameCenterX,
            this.frameCenterY,
            `${level.emoji} ${level.name} ACHIEVED!\n+£${reward.toFixed(2)}`,
            {
                fontSize: '48px',
                color: `#${level.color.toString(16).padStart(6, '0')}`,
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 8
            }
        ).setOrigin(0.5).setDepth(600);
        
        this.tweens.add({
            targets: levelText,
            scale: { from: 0, to: 1.5 },
            duration: 1000,
            yoyo: true,
            hold: 1500,
            onComplete: () => levelText.destroy()
        });
        
        // Award reward
        this.addWin(reward, true);
        
        // Reset if MAX WIN
        if (level.name === 'MAX WIN' && MAX_WIN_CONFIG.resetOnMaxWin) {
            this.time.delayedCall(3000, () => {
                this.lordsCaptured = 0;
                this.updateMaxWinMeter();
            });
        }
    }

    // ========================================
    // BET MODAL
    // ========================================
    
    private showBetModal(): void {
        if (this.roundInProgress) return;
        
        const { width, height } = this.cameras.main;
        
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0, 0);
        overlay.setDepth(100);
        overlay.setInteractive();
        
        const modal = this.add.rectangle(width/2, height/2, 400, 500, 0x1a1f3a, 1);
        modal.setStrokeStyle(4, GAME_CONFIG.colors.gold);
        modal.setDepth(101);
        
        const title = this.add.text(width/2, height/2 - 200, 'SELECT YOUR BET', {
            fontSize: '24px',
            color: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);
        
        const betValues = [0.20, 0.40, 1.00, 2.00, 3.00, 4.00, 5.00, 10.00];
        const elementsToDestroy: Phaser.GameObjects.GameObject[] = [overlay, modal, title];
        
        betValues.forEach((value, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = width/2 - 80 + col * 160;
            const y = height/2 - 120 + row * 70;
            
            const btn = this.createButton(
                x, y, 140, 50,
                `£${value.toFixed(2)}`,
                0x8B5CF6,
                () => {
                    this.currentBet = value;
                    if (this.betText) {
                        this.betText.setText(`Bet: £${value.toFixed(2)}`);
                    }
                    elementsToDestroy.forEach(el => el.destroy());
                }
            );
            btn.setDepth(102);
            elementsToDestroy.push(btn);
        });
        
        const closeBtn = this.createButton(
            width/2, height/2 + 200, 180, 45,
            'CLOSE',
            0xFF4500,
            () => elementsToDestroy.forEach(el => el.destroy())
        );
        closeBtn.setDepth(102);
        elementsToDestroy.push(closeBtn);
    }

    // ========================================
    // ROUND MANAGEMENT
    // ========================================
    
    private async startRound(isBonusSpin: boolean = false): Promise<void> {
        if (this.roundInProgress) return;
        if (!isBonusSpin && this.balance < this.currentBet) {
            if (this.balanceText) {
                this.tweens.add({
                    targets: this.balanceText,
                    alpha: 0.3,
                    duration: 150,
                    yoyo: true,
                    repeat: 2
                });
            }
            return;
        }
        
        // 1. Clear previous result display
        if (this.resultDisplay) {
            this.tweens.killTweensOf(this.resultDisplay);
            this.resultDisplay.destroy();
            this.resultDisplay = null;
        }
        
        // 2. Deduct bet and update RTP tracker
        if (!isBonusSpin) {
            this.balance -= this.currentBet;
            this.rtpTracker.totalBets += this.currentBet;
            this.bonusPrizeTotal = 0;
            this.updateBonusPrizeDisplay();
        }
        
        this.roundInProgress = true;
        await this.clearBoard();
        this.cascadeLevel = 0;
        this.roundWinnings = 0;  // Reset round winnings
        // The bonus target belongs to this spin only; matches from previous
        // spins never accumulate toward the six-match trigger.
        this.lordsCaptured = 0;
        this.updateMaxWinMeter();
        this.waveNumber = 0;
        this.lordsActivatedThisRound.clear();
        this.activeRows = GAME_CONFIG.startRows;  // Reset to 4 rows
        
        // Clear win displays
        this.winDisplays.forEach(text => text.destroy());
        this.winDisplays = [];
        
        // Update UI
        this.updateUI(isBonusSpin ? `BONUS SPIN ${11 - this.bonusSpinsRemaining}/10` : 'Spawning gems...');
        
        // Start the new async spin sequence
        void this.startSpin(isBonusSpin);
    }
    
    private determineRoundLords(): void {
        this.lordsThisRound = [];
        
        for (const [lordType, config] of Object.entries(LORD_CONFIG)) {
            if (Math.random() < config.spawnChance) {
                this.lordsThisRound.push(lordType);
            }
        }
    }
    
    // ========================================
    // GRID-BASED SPAWNING SYSTEM
    // ========================================
    
    /**
     * Main spin sequence - async
     */
    private async startSpin(isBonusSpin: boolean = false): Promise<void> {
        // Step 1: Spawn 4 rows (24 gems total)
        await this.spawnInitialGrid();
        
        // Step 2: Resolve all cascades (silent)
        await this.resolveAllCascades();
        
        // Step 3: Show final win amount (large text)
        if (this.roundWinnings > 0) {
            this.showFinalWinAmount(this.roundWinnings);
        }

        if (this.bonusActive && this.bonusSpinsRemaining > 0) {
            if (!this.selectedBonusLord) {
                this.roundInProgress = false;
                this.enableBonusLordRoll();
                return;
            }
            if (isBonusSpin) this.bonusSpinsRemaining--;
            this.bonusLabel?.setText(`BONUS ${this.bonusSpinsRemaining}/10`);
            if (this.bonusSpinsRemaining > 0) {
                this.updateUI(`Next bonus spin: ${this.bonusSpinsRemaining} left`);
                await this.wait(1200);
                this.roundInProgress = false;
                void this.startRound(true);
                return;
            }
            this.finishBonusMode();
        }
        
        // End round
        this.roundInProgress = false;
        this.updateUI('Round Complete');
    }
    
    /**
     * Spawn initial 4 rows, one at a time
     */
    private async spawnInitialGrid(): Promise<void> {
        // Create 4 rows, one at a time
        for (let row = 0; row < GAME_CONFIG.startRows; row++) {
            await this.spawnRow(row);
            await this.wait(GAME_CONFIG.rowSpawnDelay);
        }
    }
    
    /**
     * Spawn 6 gems in this row
     */
    private async spawnRow(rowIndex: number): Promise<void> {
        // Create 6 gems in this row
        const spawnPromises: Promise<void>[] = [];
        for (let col = 0; col < GAME_CONFIG.columns; col++) {
            spawnPromises.push(this.spawnGemAt(col, rowIndex));
            await this.wait(GAME_CONFIG.gemSpawnDelay);
        }
        // Wait for all gems in this row to finish animating
        await Promise.all(spawnPromises);
    }
    
    /**
     * Spawn a gem at a specific grid position with tween animation
     */
    private async spawnGemAt(col: number, row: number): Promise<void> {
        return new Promise((resolve) => {
            const gemType = getRandomGemType(this.lordsThisRound);
            
            // Calculate exact grid position
            const targetX = this.getGridX(col);
            const targetY = this.getGridY(row);
            
            // Create the gem at start position (above screen)
            let gem: Phaser.GameObjects.Container;
            const startX = targetX;
            const startY = targetY - 300;
            
            if (gemType.startsWith('mascot_')) {
                const color = gemType.split('_')[1] as 'red' | 'green' | 'blue' | 'yellow';
                gem = createMascotGem(this, startX, startY, color, true); // Skip animations during spawn
            } else if (gemType.startsWith('lord_')) {
                const lordType = gemType.split('_')[1] as 'ignis' | 'ventus' | 'aqua' | 'terra';
                gem = createLordGem(this, startX, startY, lordType, true);
            } else if (gemType === 'black_gem') {
                gem = createBlackGem(this, startX, startY, true);
            } else if (gemType.startsWith('bomb_')) {
                const bombType = gemType.split('_')[1] as 'small' | 'medium' | 'large' | 'line' | 'color';
                gem = createBombGem(this, startX, startY, bombType, true);
            } else {
                gem = createMascotGem(this, startX, startY, 'red', true);
            }

            // Compact size for eleven rows: each jewel remains separate and
            // centered inside its channel.
            gem.setScale(0.74);
            gem.setAlpha(0);
            // Reserve the cell immediately. Without this, parallel cascade
            // refills can select the same empty cell before a tween completes.
            if (!this.grid[row]) this.grid[row] = [];
            this.grid[row][col] = gem;
            gem.setData('col', col);
            gem.setData('row', row);
            
            // Animate with TWEEN (not physics)
            this.tweens.add({
                targets: gem,
                y: targetY,
                alpha: 1,
                duration: GAME_CONFIG.gemFallDuration,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    // Re-enable idle animations after landing
                    this.reEnableGemAnimations(gem, targetY);
                    
                    resolve();
                }
            });
        });
    }
    
    // ========================================
    // CASCADE RESOLUTION SYSTEM
    // ========================================
    
    /**
     * Resolve all cascades silently, accumulating winnings
     */
    private async resolveAllCascades(): Promise<void> {
        let cascadeCount = 0;
        
        while (true) {
            const clusters = detectAllMatches(this.grid);
            if (clusters.length === 0) break;
            
            cascadeCount++;
            this.feedMaxWinMeter(clusters.length);
            
            // Calculate winnings (DON'T SHOW)
            const winAmount = this.calculateWinnings(clusters, cascadeCount);
            this.roundWinnings += winAmount;  // Accumulate silently
            
            // Animate victory (blink)
            await this.animateVictory(clusters);
            
            // Remove gems from grid
            await this.removeGems(clusters);
            
            // Apply grid gravity (gems fall to fill gaps)
            await this.applyGridGravity();
            
            // Refill empty spaces. Once the gems reach the top of the
            // channels, the round ends and the player can start a new spin.
            const reachedTop = await this.refillGrid();
            
            await this.wait(GAME_CONFIG.cascadeDelay);
            if (reachedTop) break;
        }
    }
    
    /**
     * Calculate winnings for a set of matches
     */
    private calculateWinnings(clusters: Cluster[], cascadeLevel: number): number {
        let totalWinnings = 0;
        
        clusters.forEach(cluster => {
            const clusterSize = cluster.gems.length;
            const multiplier = getMatchMultiplier(clusterSize);
            const comboMultiplier = getComboMultiplier(cascadeLevel);
            const selectedLord = this.selectedBonusLord ? LORD_CONFIG[this.selectedBonusLord] : undefined;
            const lordColorMultiplier = this.bonusActive && selectedLord?.matchColor === cluster.color ? 2 : 1;
            
            cluster.gems.forEach(gemData => {
                const gemType = gemData.container.getData('gemType');
                const value = GAME_CONFIG.gemValues[gemType as keyof typeof GAME_CONFIG.gemValues] || 0;
                totalWinnings += value * multiplier * comboMultiplier * lordColorMultiplier;
            });
        });
        
        return totalWinnings;
    }
    
    /**
     * Remove gems from grid with explosion animations
     */
    private async removeGems(clusters: Cluster[]): Promise<void> {
        // A gem at the crossing of a horizontal and vertical match may appear
        // in two clusters. Explode and destroy that physical gem only once.
        const uniqueGems = new Map<string, Cluster['gems'][number]>();
        clusters.flatMap(c => c.gems).forEach(gemData => {
            uniqueGems.set(`${gemData.col},${gemData.row}`, gemData);
        });
        const allGems = [...uniqueGems.values()];
        
        allGems.forEach(gemData => {
            const { container, col, row } = gemData;
            
            // Remove from grid
            this.grid[row][col] = null;
            
            // Explosion animation
            this.tweens.add({
                targets: container,
                scale: 0,
                alpha: 0,
                duration: 300,
                onComplete: () => container.destroy()
            });
            
            // Particles
            const color = container.getData('color');
            const gemColor = GAME_CONFIG.colors[color as keyof typeof GAME_CONFIG.colors] || 0xFFFFFF;
            createExplosion(this, container.x, container.y, gemColor, 1);
        });
        
        await this.wait(400);
    }
    
    /**
     * Apply grid gravity - move gems down to fill gaps
     */
    private async applyGridGravity(): Promise<void> {
        const movements: Promise<void>[] = [];

        for (let col = 0; col < GAME_CONFIG.columns; col++) {
            // Rows start at the bottom, so keeping this order compacts every
            // surviving gem into the lowest available space in the channel.
            const survivors: Phaser.GameObjects.Container[] = [];
            for (let row = 0; row < this.activeRows; row++) {
                const gem = this.grid[row][col];
                if (gem) survivors.push(gem);
                this.grid[row][col] = null;
            }

            survivors.forEach((gem, targetRow) => {
                this.grid[targetRow][col] = gem;
                gem.setData('col', col);
                gem.setData('row', targetRow);

                const targetX = this.getGridX(col);
                const targetY = this.getGridY(targetRow);
                this.tweens.killTweensOf(gem);

                if (Math.abs(gem.y - targetY) > 0.5 || Math.abs(gem.x - targetX) > 0.5) {
                    movements.push(new Promise<void>(resolve => {
                        this.tweens.add({
                            targets: gem,
                            x: targetX,
                            y: targetY,
                            duration: 280,
                            ease: 'Cubic.easeIn',
                            onComplete: () => {
                                gem.setPosition(targetX, targetY);
                                this.reEnableGemAnimations(gem, targetY);
                                resolve();
                            }
                        });
                    }));
                } else {
                    gem.setPosition(targetX, targetY);
                }
            });
        }

        // Do not refill or scan for another match until every falling gem has
        // actually reached the centre of its destination cell.
        await Promise.all(movements);
    }
    
    /**
     * Refill empty spaces in the grid
     */
    private async refillGrid(): Promise<boolean> {
        // A cascade grows the complete board by one row, never once per
        // column. This keeps every channel aligned and prevents overlap.
        if (this.activeRows < GAME_CONFIG.maxRows) {
            this.activeRows++;
        }

        const spawnPromises: Promise<void>[] = [];
        for (let col = 0; col < GAME_CONFIG.columns; col++) {
            for (let row = 0; row < this.activeRows; row++) {
                if (this.grid[row][col] === null) {
                    spawnPromises.push(this.spawnGemAt(col, row));
                }
            }
        }

        await Promise.all(spawnPromises);
        this.snapAllGemsToGrid();
        await this.wait(500);
        return this.activeRows >= GAME_CONFIG.maxRows;
    }

    private snapAllGemsToGrid(): void {
        for (let row = 0; row < this.activeRows; row++) {
            for (let col = 0; col < GAME_CONFIG.columns; col++) {
                const gem = this.grid[row]?.[col];
                if (!gem) continue;
                gem.setPosition(this.getGridX(col), this.getGridY(row));
                gem.setData('col', col);
                gem.setData('row', row);
            }
        }
    }
    
    /**
     * Show final win amount with large text
     */
    private showFinalWinAmount(amount: number): void {
        // Update balance
        this.balance += amount;
        this.updateUI('');
        
        // Large text at the end
        const text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            `+£${amount.toFixed(2)}`,
            {
                fontSize: '72px',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 8,
                fontStyle: 'bold'
            }
        );
        text.setOrigin(0.5);
        text.setDepth(1000);
        
        // Dramatic animation
        this.tweens.add({
            targets: text,
            scale: { from: 0, to: 1.5 },
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Fade out after 3 seconds
        this.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 50,
            scale: 2,
            duration: 800,
            delay: 2500,
            onComplete: () => text.destroy()
        });
    }
    
    // ========================================
    // MATCH DETECTION AND EXPLOSIONS
    // ========================================
    
    private checkMatches(): void {
        this.cascadeLevel++;
        
        // Check for Lord powers first
        let lordPowerTriggered = false;
        
        for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
            for (let col = 0; col < GAME_CONFIG.columns; col++) {
                const gem = this.grid[row][col];
                if (!gem) continue;
                
                const lordType = gem.getData('lordType');
                if (lordType && !this.lordsActivatedThisRound.has(lordType)) {
                    const powerCheck = checkLordPower(this.grid, col, row);
                    if (powerCheck.triggered && powerCheck.matchingColor) {
                        this.activateLordPower(col, row, lordType, powerCheck.matchingColor);
                        lordPowerTriggered = true;
                        this.lordsActivatedThisRound.add(lordType);
                    }
                }
            }
        }
        
        if (lordPowerTriggered) {
            this.time.delayedCall(1500, () => this.checkMatches());
            return;
        }
        
        // Check for bomb explosions
        let bombTriggered = false;
        
        for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
            for (let col = 0; col < GAME_CONFIG.columns; col++) {
                const gem = this.grid[row][col];
                if (!gem) continue;
                
                const bombType = gem.getData('bombType');
                if (bombType) {
                    this.explodeBomb(col, row, bombType);
                    bombTriggered = true;
                    break;
                }
            }
            if (bombTriggered) break;
        }
        
        if (bombTriggered) {
            this.time.delayedCall(1000, () => this.checkMatches());
            return;
        }
        
        // Find normal clusters (using new horizontal/vertical match detection)
        const clusters = detectAllMatches(this.grid);
        
        if (clusters.length > 0) {
            // Animate victory before exploding
            this.animateVictory(clusters).then(() => {
                this.explodeClusters(clusters);
            });
        } else {
            // Check if board is empty for wave bonus
            if (this.isBoardEmpty()) {
                this.waveNumber++;
                this.showWaveBonus(this.waveNumber);
                this.time.delayedCall(2000, async () => {
                    await this.dropNewWave();
                    await this.wait(500);
                    this.checkMatches();
                });
            } else {
                // No more matches, check for end of round
                this.endRound();
            }
        }
    }
    
    private activateLordPower(col: number, row: number, lordType: string, matchColor: string): void {
        const lordGem = this.grid[row][col];
        if (!lordGem) return;
        
        const config = LORD_CONFIG[lordType as keyof typeof LORD_CONFIG];
        
        // Visual effect
        createLordPowerEffect(this, lordGem.x, lordGem.y, config.baseColor);
        shakeScreen(this, 2);
        
        // Find all gems of matching color
        const matchingGems = findAllGemsOfColor(this.grid, matchColor);
        
        // Calculate reward with Lord multiplier
        let totalReward = 0;
        matchingGems.forEach(gemData => {
            const gemType = gemData.container.getData('gemType');
            const value = GAME_CONFIG.gemValues[gemType as keyof typeof GAME_CONFIG.gemValues] || 0;
            totalReward += value;
        });
        
        totalReward *= GAME_CONFIG.lordPowerMultiplier;
        totalReward *= getComboMultiplier(this.cascadeLevel);
        
        // Explode all matching gems
        matchingGems.forEach(gemData => {
            const color = GAME_CONFIG.colors[matchColor as keyof typeof GAME_CONFIG.colors] || 0xFFFFFF;
            createExplosion(this, gemData.container.x, gemData.container.y, color, 1.5);
            gemData.container.destroy();
            this.grid[gemData.row][gemData.col] = null;
        });
        
        // Show win
        this.addWin(totalReward, true);
        
        // Apply cascades
        this.time.delayedCall(800, () => this.applyCascade());
    }
    
    private explodeBomb(col: number, row: number, bombType: 'small' | 'medium' | 'large' | 'line' | 'color'): void {
        const bombGem = this.grid[row][col];
        if (!bombGem) return;
        
        const explosionGems = getBombExplosionGems(this.grid, col, row, bombType);
        
        // Calculate reward
        let totalReward = 0;
        explosionGems.forEach(gemData => {
            const gemType = gemData.container.getData('gemType');
            const value = GAME_CONFIG.gemValues[gemType as keyof typeof GAME_CONFIG.gemValues] || 0;
            totalReward += value;
        });
        
        totalReward *= getComboMultiplier(this.cascadeLevel);
        
        // Visual effects
        createExplosion(this, bombGem.x, bombGem.y, 0xFF6B00, 2);
        shakeScreen(this, 1.5);
        
        // Destroy gems
        explosionGems.forEach(gemData => {
            this.time.delayedCall(Phaser.Math.Between(0, 200), () => {
                const color = gemData.container.getData('color');
                const gemColor = GAME_CONFIG.colors[color as keyof typeof GAME_CONFIG.colors] || 0xFFFFFF;
                createExplosion(this, gemData.container.x, gemData.container.y, gemColor, 1);
                gemData.container.destroy();
                this.grid[gemData.row][gemData.col] = null;
            });
        });
        
        // Show win
        this.addWin(totalReward, false);
        
        // Apply cascades
        this.time.delayedCall(800, () => this.applyCascade());
    }
    
    private explodeClusters(clusters: Cluster[]): void {
        let totalReward = 0;
        
        clusters.forEach(cluster => {
            const multiplier = getMatchMultiplier(cluster.size);
            const comboMultiplier = getComboMultiplier(this.cascadeLevel);
            
            cluster.gems.forEach(gemData => {
                const gemType = gemData.container.getData('gemType');
                const value = GAME_CONFIG.gemValues[gemType as keyof typeof GAME_CONFIG.gemValues] || 0;
                totalReward += value * multiplier * comboMultiplier;
                
                // Visual effect
                const color = GAME_CONFIG.colors[cluster.color as keyof typeof GAME_CONFIG.colors] || 0xFFFFFF;
                createExplosion(this, gemData.container.x, gemData.container.y, color, 1);
                
                // Remove from grid
                gemData.container.destroy();
                this.grid[gemData.row][gemData.col] = null;
            });
        });
        
        shakeScreen(this, 0.5);
        
        // Show win
        this.addWin(totalReward, false);
        
        // Apply cascades
        this.time.delayedCall(600, () => this.applyCascade());
    }
    
    private applyCascade(): void {
        // Apply gravity to all columns
        this.applyGravityToAllColumns();
        
        // Wait for gravity animations to complete, then refill
        this.time.delayedCall(300, () => {
            this.refillEmptySpaces();
        });
    }
    
    private applyGravityToAllColumns(): void {
        // Process each column independently
        for (let col = 0; col < GAME_CONFIG.columns; col++) {
            this.applyGravityToColumn(col);
        }
    }
    
    private applyGravityToColumn(col: number): void {
        // Compact all non-null gems to the bottom of the column
        // Row 0 is at the BOTTOM in our new system
        const gems: Phaser.GameObjects.Container[] = [];
        
        // Collect all non-null gems in this column from bottom to top
        for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
            const gem = this.grid[row][col];
            if (gem !== null) {
                gems.push(gem);
            }
        }
        
        // Clear the entire column
        for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
            this.grid[row][col] = null;
        }
        
        // Place gems back starting from the bottom (row 0)
        for (let i = 0; i < gems.length; i++) {
            const targetRow = i; // Stack from bottom up
            const gem = gems[i];
            
            this.grid[targetRow][col] = gem;
            gem.setData('row', targetRow);
            gem.setData('col', col);
            
            // Animate gem falling to new position
            const targetY = this.getGridY(targetRow);
            
            this.tweens.add({
                targets: gem,
                y: targetY,
                duration: 300,
                ease: 'Cubic.easeIn'
            });
        }
    }
    
    private refillEmptySpaces(): void {
        const refillPromises: Promise<void>[] = [];
        
        // Find all empty spaces and generate new gems
        for (let col = 0; col < GAME_CONFIG.columns; col++) {
            for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
                if (this.grid[row][col] === null) {
                    refillPromises.push(this.createAndDropNewGem(col, row));
                }
            }
        }
        
        // Wait for all gems to be created and settled
        if (refillPromises.length > 0) {
            Promise.all(refillPromises).then(() => {
                // Wait a bit for visual settle, then check for new matches
                this.time.delayedCall(400, () => this.checkMatches());
            });
        } else {
            // No refill needed, check for matches or end round
            this.time.delayedCall(200, () => this.checkMatches());
        }
    }
    
    private createAndDropNewGem(col: number, row: number): Promise<void> {
        return new Promise((resolve) => {
            // Check if position is already occupied
            if (this.grid[row][col] !== null) {
                console.warn(`[CASCADE] Skipping occupied cell: col=${col} row=${row}`);
                resolve();
                return;
            }
            
            const gemType = getRandomGemType(this.lordsThisRound);
            
            // Calculate target position using new grid methods
            const targetX = this.getGridX(col);
            const targetY = this.getGridY(row);
            
            // Start position: directly above the target column
            const startY = GAME_CONFIG.playArea.top - 300;
            
            // Create the gem at TARGET X position (no horizontal movement needed)
            let gem: Phaser.GameObjects.Container;
            
            if (gemType.startsWith('mascot_')) {
                const color = gemType.split('_')[1] as 'red' | 'green' | 'blue' | 'yellow';
                gem = createMascotGem(this, targetX, startY, color, true);
            } else if (gemType.startsWith('lord_')) {
                const lordType = gemType.split('_')[1] as 'ignis' | 'ventus' | 'aqua' | 'terra';
                gem = createLordGem(this, targetX, startY, lordType, true);
            } else if (gemType === 'black_gem') {
                gem = createBlackGem(this, targetX, startY, true);
            } else if (gemType.startsWith('bomb_')) {
                const bombType = gemType.split('_')[1] as 'small' | 'medium' | 'large' | 'line' | 'color';
                gem = createBombGem(this, targetX, startY, bombType, true);
            } else {
                // Fallback to red mascot
                gem = createMascotGem(this, targetX, startY, 'red', true);
            }
            
            // Set data
            gem.setData('col', col);
            gem.setData('row', row);
            this.grid[row][col] = gem;
            
            // 🔥 CRITICAL: Kill ALL existing tweens (float, sparkle, rotate, glow)
            this.tweens.killTweensOf(gem);
            
            // Also kill tweens of child elements (sparkle, glow, etc.)
            gem.each((child: Phaser.GameObjects.GameObject) => {
                this.tweens.killTweensOf(child);
            });
            
            // 🐛 CRITICAL: Ensure tween manager is not paused
            if (this.tweens.paused) {
                console.warn('[CASCADE] Tweens were paused, resuming...');
                this.tweens.paused = false;
            }
            
            // Track whether promise has been resolved
            let resolved = false;
            
            // 🎯 Pure vertical fall animation - NO physics, NO horizontal movement
            this.tweens.add({
                targets: gem,
                y: targetY,
                duration: 500,  // Slightly longer for smooth fall
                ease: 'Cubic.easeIn',  // Natural gravity feel
                onStart: () => {
                    console.log(`[CASCADE] Tween started for gem at col=${col} row=${row}`);
                },
                onComplete: () => {
                    console.log(`[CASCADE] Tween complete for gem at col=${col} row=${row}, final y=${gem.y}`);
                    
                    // Re-enable idle animations after landing
                    this.reEnableGemAnimations(gem, targetY);
                    
                    // Check if this lord landed in mid-air or base
                    this.checkWildLanding(gem, row, col);
                    
                    if (!resolved) {
                        resolved = true;
                        resolve();
                    }
                }
            });
            
            // 🐛 SAFETY: If tween doesn't complete within 2 seconds, force resolve
            this.time.delayedCall(2000, () => {
                // Use epsilon for floating-point comparison
                if (!resolved && Math.abs(gem.y - targetY) > 0.5) {
                    console.error(`[CASCADE] Tween timeout! Gem stuck at y=${gem.y}, expected y=${targetY}`);
                    gem.y = targetY;  // Force position
                    this.reEnableGemAnimations(gem, targetY);
                    resolved = true;
                    resolve();
                }
            });
        });
    }
    
    private reEnableGemAnimations(gem: Phaser.GameObjects.Container, baseY: number): void {
        const gemType = gem.getData('gemType');

        // Keep the complete jewel locked to the centre of its grid cell.
        gem.y = baseY;

        if (gemType?.startsWith('mascot_')) {
            // Re-enable sparkle animation
            const sparkle = gem.getData('sparkle');
            if (sparkle) {
                this.tweens.add({
                    targets: sparkle,
                    alpha: { from: 0, to: 1 },
                    duration: GAME_CONFIG.animations.sparkle.duration,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        } else if (gemType?.startsWith('lord_')) {
            // A tiny rotation gives life without moving the Lord out of cell.
            this.tweens.add({
                targets: gem,
                angle: GAME_CONFIG.animations.lordRotate.angle,
                duration: GAME_CONFIG.animations.lordRotate.duration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    private addWin(amount: number, isSpecial: boolean = false): void {
        this.balance += amount;
        this.updateUI();

        if (isSpecial && amount > 0) {
            this.bonusPrizeTotal += amount;
            this.updateBonusPrizeDisplay();
        }
        
        // Create persistent win text
        const winText = createWinText(
            this,
            this.frameCenterX,
            this.frameCenterY - 150 - (this.winDisplays.length * 40),
            amount,
            isSpecial
        );
        
        this.winDisplays.push(winText);

        // Individual gold/pink awards are celebrations, not permanent UI.
        // Float them upward and remove them before the next award can overlap.
        this.tweens.add({
            targets: winText,
            y: winText.y - 65,
            alpha: 0,
            delay: 950,
            duration: 650,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.winDisplays = this.winDisplays.filter(item => item !== winText);
                winText.destroy();
            }
        });
    }

    private updateBonusPrizeDisplay(): void {
        if (!this.bonusPrizeText) return;
        if (this.bonusPrizeTotal <= 0) {
            this.bonusPrizeText.setVisible(false);
            return;
        }
        this.bonusPrizeText.setText(`BONUS WIN  £${this.bonusPrizeTotal.toFixed(2)}`).setVisible(true);
        this.tweens.add({
            targets: this.bonusPrizeText,
            scale: { from: 1.12, to: 1 },
            duration: 260,
            ease: 'Back.easeOut'
        });
    }
    
    // ========================================
    // VICTORY ANIMATION AND WAVE SYSTEM
    // ========================================
    
    private async animateVictory(matches: Cluster[]): Promise<void> {
        // Calculate total gems
        const totalGems = matches.reduce((sum, cluster) => sum + cluster.size, 0);
        
        // Select config based on match size
        let config;
        if (totalGems >= 10) {
            config = GAME_CONFIG.victoryAnimation.megaVictory;
        } else if (totalGems >= 6) {
            config = GAME_CONFIG.victoryAnimation.bigVictory;
        } else {
            config = GAME_CONFIG.victoryAnimation.normalVictory;
        }
        
        // Apply screen shake if configured
        if (config.shake > 0) {
            shakeScreen(this, config.shake * 10);
        }
        
        // Collect all gem containers from matches
        const allGems: Phaser.GameObjects.Container[] = [];
        matches.forEach(cluster => {
            cluster.gems.forEach(gemData => {
                allGems.push(gemData.container);
            });
        });
        
        // Create confetti for mega victories
        if (config.confetti) {
            createConfetti(this);
        }
        
        // Calculate total win amount
        let totalWin = 0;
        matches.forEach(cluster => {
            const multiplier = getMatchMultiplier(cluster.size);
            const comboMultiplier = getComboMultiplier(this.cascadeLevel);
            
            cluster.gems.forEach(gemData => {
                const gemType = gemData.container.getData('gemType');
                const value = GAME_CONFIG.gemValues[gemType as keyof typeof GAME_CONFIG.gemValues] || 0;
                totalWin += value * multiplier * comboMultiplier;
            });
        });
        
        // Blinking animation loop
        for (let i = 0; i < config.blinks; i++) {
            // Blink ON - scale up with glow
            allGems.forEach(gem => {
                if (!gem || !gem.active) return;
                
                createVictoryGlow(this, gem, config.glowColor, config.blinkOnTime);
                
                this.tweens.add({
                    targets: gem,
                    scale: config.scale,
                    duration: config.blinkOnTime,
                    ease: 'Sine.easeInOut'
                });
            });
            
            await this.wait(config.blinkOnTime);
            
            // Blink OFF - scale back to normal
            allGems.forEach(gem => {
                if (!gem || !gem.active) return;
                
                this.tweens.add({
                    targets: gem,
                    scale: 1.0,
                    duration: config.blinkOffTime,
                    ease: 'Sine.easeInOut'
                });
            });
            
            await this.wait(config.blinkOffTime);
        }
        
        // The round total is shown once by showFinalWinAmount(). Showing and
        // crediting each cascade here duplicated both the label and the prize.
    }
    
    private isBoardEmpty(): boolean {
        for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
            for (let col = 0; col < GAME_CONFIG.columns; col++) {
                if (this.grid[row][col] !== null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    private showWaveBonus(waveNum: number): void {
        const bonus = waveNum * GAME_CONFIG.waveBonus;
        this.balance += bonus;
        this.updateUI();
        
        // Show animated bonus text
        const bonusText = this.add.text(
            this.frameCenterX,
            this.frameCenterY,
            `WAVE ${waveNum} BONUS!\n+£${bonus}`,
            {
                fontSize: '56px',
                color: '#FFD700',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        bonusText.setOrigin(0.5);
        bonusText.setDepth(600);
        
        // Animate bonus text
        this.tweens.add({
            targets: bonusText,
            scale: { from: 0, to: 1.5 },
            alpha: { from: 1, to: 0 },
            y: this.frameCenterY - 100,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => bonusText.destroy()
        });
    }
    
    private async dropNewWave(): Promise<void> {
        // Drop new gems in random columns - simplified for grid system
        const numGems = 12;  // Fixed number for wave bonus
        const promises: Promise<void>[] = [];
        
        for (let i = 0; i < numGems; i++) {
            const col = Phaser.Math.Between(0, GAME_CONFIG.columns - 1);
            
            // Find available row (first empty spot from bottom)
            let targetRow = -1;
            for (let row = 0; row < this.activeRows; row++) {
                if (this.grid[row][col] === null) {
                    targetRow = row;
                    break;
                }
            }
            
            // Skip if column is full
            if (targetRow === -1) continue;
            
            promises.push(this.createAndDropNewGem(col, targetRow));
            
            // Stagger gem drops slightly
            await this.wait(50);
        }
        
        // Wait for all gems to settle
        await Promise.all(promises);
        await this.wait(400);
    }
    
    private endRound(): void {
        // Check for black gems penalty
        let blackGemPenalty = 0;
        
        for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
            for (let col = 0; col < GAME_CONFIG.columns; col++) {
                const gem = this.grid[row][col];
                if (gem && gem.getData('gemType') === 'black_gem') {
                    blackGemPenalty += Math.abs(GAME_CONFIG.gemValues.black_gem);
                    
                    // Visual effect
                    createExplosion(this, gem.x, gem.y, GAME_CONFIG.colors.black, 1);
                }
            }
        }
        
        if (blackGemPenalty > 0) {
            this.balance -= blackGemPenalty;
            this.addWin(-blackGemPenalty, false);
        }
        
        // Check for super bonus (all 4 Lords activated)
        if (this.lordsActivatedThisRound.size === 4) {
            this.triggerSuperBonus();
        }
        
        this.roundInProgress = false;
        this.updateUI('Ready to Spin');
    }
    
    private triggerSuperBonus(): void {
        createSuperBonusEffect(this);
        this.addWin(GAME_CONFIG.superBonusReward, true);
        
        // Show special message
        const bonusText = this.add.text(
            this.frameCenterX,
            this.frameCenterY,
            'SUPER BONUS!\nALL LORDS UNITED!',
            {
                fontSize: '48px',
                color: '#FF00FF',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        bonusText.setOrigin(0.5);
        bonusText.setDepth(600);
        
        this.tweens.add({
            targets: bonusText,
            scale: { from: 0, to: 1.5 },
            duration: 500,
            yoyo: true,
            hold: 1000,
            onComplete: () => bonusText.destroy()
        });
    }
    
    private updateUI(roundInfo?: string): void {
        if (this.balanceText) {
            this.balanceText.setText(`Balance: £${this.balance.toFixed(2)}`);
        }
        if (this.betText) {
            this.betText.setText(`Bet: £${this.currentBet.toFixed(2)}`);
        }
        if (this.roundInfoText && roundInfo) {
            this.roundInfoText.setText(roundInfo);
        }
    }
    
    // ========================================
    // RTP SYSTEM METHODS
    // ========================================
    
    /**
     * Determine target outcome based on RTP tracking
     */
    private determineTargetOutcome(): 'loss' | 'small' | 'medium' | 'big' | 'mega' {
        const currentRTP = this.rtpTracker.totalBets > 0 
            ? (this.rtpTracker.totalWins / this.rtpTracker.totalBets) * 100 
            : 100;
        const targetRTP = RTP_CONFIG.targetRTP;
        
        // Force adjustments if RTP drifts too far
        if (currentRTP > targetRTP + 5) {
            return 'loss';  // Force loss to bring RTP down
        }
        
        if (currentRTP < targetRTP - 5) {
            // Force win to bring RTP up
            return Math.random() < RTP_CONFIG.mediumVsBigWinSplit ? 'medium' : 'big';
        }
        
        // Control consecutive streaks
        if (this.rtpTracker.consecutiveWins >= RTP_CONFIG.maxConsecutiveWins) {
            this.rtpTracker.consecutiveWins = 0;
            return 'loss';
        }
        
        if (this.rtpTracker.consecutiveLosses >= RTP_CONFIG.minConsecutiveLosses) {
            this.rtpTracker.consecutiveLosses = 0;
            return Math.random() < RTP_CONFIG.mediumVsBigAfterLosses ? 'medium' : 'big';
        }
        
        // Normal distribution
        const roll = Math.random() * 100;
        
        if (roll < 45) return 'loss';
        if (roll < 80) return 'small';
        if (roll < 95) return 'medium';
        if (roll < 99) return 'big';
        return 'mega';
    }
    
    /**
     * Get weighted random gem type based on RTP_CONFIG
     */
    private getWeightedRandomGemType(): string {
        const weights = RTP_CONFIG.gemWeights;
        let random = Math.random() * this.gemWeightTotal;
        
        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) return type;
        }
        
        return 'mascot_red';
    }
    
    /**
     * Get gem type avoiding matches (for loss scenarios)
     */
    private getGemTypeAvoidingMatch(col: number, row: number): string {
        const neighbors = this.getNeighborTypes(col, row);
        const avoidTypes = new Set(neighbors.map(t => this.getBaseType(t)));
        
        let attempts = 0;
        let gemType: string;
        
        do {
            gemType = this.getWeightedRandomGemType();
            attempts++;
        } while (avoidTypes.has(this.getBaseType(gemType)) && attempts < RTP_CONFIG.avoidMatchMaxAttempts);
        
        return gemType;
    }
    
    /**
     * Get gem type favoring matches (for win scenarios)
     */
    private getGemTypeFavoringMatch(col: number, row: number): string {
        const neighbors = this.getNeighborTypes(col, row);
        
        // Use configured probability to match neighbor
        if (neighbors.length > 0 && Math.random() < RTP_CONFIG.matchNeighborProbability) {
            return neighbors[0];
        }
        
        // Otherwise use weighted random
        return this.getWeightedRandomGemType();
    }
    
    /**
     * Get neighbor gem types for matching logic
     */
    private getNeighborTypes(col: number, row: number): string[] {
        const types: string[] = [];
        
        if (col > 0 && this.grid[row][col - 1]) {
            const leftType = this.grid[row][col - 1]!.getData('gemType');
            if (leftType) types.push(leftType);
        }
        
        if (row > 0 && this.grid[row - 1][col]) {
            const bottomType = this.grid[row - 1][col]!.getData('gemType');
            if (bottomType) types.push(bottomType);
        }
        
        return types;
    }
    
    /**
     * Get base type for comparison (removes mascot_/lord_ prefix)
     */
    private getBaseType(type: string): string {
        if (type.includes('mascot_')) return type.split('_')[1];
        if (type.includes('lord_')) return type.split('_')[1];
        return type;
    }
    
    /**
     * Show persistent result with intermittent fade
     */
    private showPersistentResult(): void {
        const isWin = this.roundWinnings > 0;
        const betMultiple = (isWin && this.currentBet > 0) ? this.roundWinnings / this.currentBet : 0;
        
        let message: string;
        let color: string;
        let size: string;
        
        if (!isWin) {
            message = 'NO WIN';
            color = '#888888';
            size = '48px';
            this.rtpTracker.consecutiveLosses++;
            this.rtpTracker.consecutiveWins = 0;
        } else if (betMultiple >= 10) {
            message = `MEGA WIN!\n£${this.roundWinnings.toFixed(2)}`;
            color = '#FF00FF';
            size = '96px';
            this.rtpTracker.consecutiveWins++;
            this.rtpTracker.consecutiveLosses = 0;
        } else if (betMultiple >= 5) {
            message = `BIG WIN!\n£${this.roundWinnings.toFixed(2)}`;
            color = '#FF6B00';
            size = '72px';
            this.rtpTracker.consecutiveWins++;
            this.rtpTracker.consecutiveLosses = 0;
        } else {
            message = `WIN £${this.roundWinnings.toFixed(2)}`;
            color = '#FFD700';
            size = '56px';
            this.rtpTracker.consecutiveWins++;
            this.rtpTracker.consecutiveLosses = 0;
        }
        
        // Create persistent result with intermittent fade
        this.resultDisplay = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            message,
            {
                fontSize: size,
                color: color,
                stroke: '#000000',
                strokeThickness: 8,
                fontStyle: 'bold',
                align: 'center'
            }
        );
        this.resultDisplay.setOrigin(0.5);
        this.resultDisplay.setDepth(1000);
        
        // Pop-in animation
        this.resultDisplay.setAlpha(0);
        this.resultDisplay.setScale(0);
        this.tweens.add({
            targets: this.resultDisplay,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Intermittent fade (infinite until next spin)
        this.tweens.add({
            targets: this.resultDisplay,
            alpha: { from: 1, to: 0.3 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 500
        });
    }
    
    /**
     * Update RTP statistics
     */
    private updateRTPStats(): void {
        this.rtpTracker.sessionRTP = this.rtpTracker.totalBets > 0
            ? (this.rtpTracker.totalWins / this.rtpTracker.totalBets) * 100
            : 100;
        
        console.log(`[RTP] Session: ${this.rtpTracker.sessionRTP.toFixed(2)}% | Target: ${RTP_CONFIG.targetRTP}%`);
        console.log(`[Streaks] Wins: ${this.rtpTracker.consecutiveWins} | Losses: ${this.rtpTracker.consecutiveLosses}`);
    }
    
    update(): void {
        // Update falling gems physics
    }
}
