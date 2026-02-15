/**
 * GameScene.tsx
 * Vertical slot puzzle game with gravity physics
 */

import Phaser from 'phaser';
import { GAME_CONFIG, LORD_CONFIG, MASCOT_CONFIG, getMatchMultiplier, getComboMultiplier, RTP_CONFIG, GRID_CONFIG } from '../config/GameConfig';
import { MAX_WIN_CONFIG } from '../config/MaxWinConfig';
import { 
    gridToPixel, 
    getRectNeighbors, 
    getAvailableRowInColumn,
    getColumnFromX,
    getColumnCenterX,
    getRowCenterY,
    findLowestEmptyRow,
    canSlideLeft,
    canSlideRight,
    findNearestAvailableColumn
} from '../utils/RectGrid';
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

export class GameScene extends Phaser.Scene {
    // Grid and gems
    private grid: (Phaser.GameObjects.Container | null)[][] = [];
    private gridStartX: number = 0;
    private gridStartY: number = 0;
    private fallingGems: Phaser.GameObjects.Container[] = [];
    
    // Game state
    private balance = 1000;
    private currentBet = 1.0;
    private roundInProgress = false;
    private cascadeLevel = 0;
    private lordsThisRound: string[] = [];
    private lordsActivatedThisRound = new Set<string>();
    private waveNumber = 0;
    
    // RTP tracking system
    private rtpTracker = {
        totalBets: 0,
        totalWins: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        sessionRTP: 100
    };
    private resultDisplay: Phaser.GameObjects.Text | null = null;
    private activeRows = 4;  // Initialize with default value
    private roundWinnings = 0;
    
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
        
        // Enable physics with gravity
        if (this.physics && this.physics.world) {
            this.physics.world.gravity.y = GAME_CONFIG.gravity;
        }
        
        // Background
        const bg = this.add.image(0, 0, 'background');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(width, height);
        bg.setDepth(0);
        
        // Frame centered (HIDDEN - only decorative columns visible)
        this.frameCenterX = width / 2;
        this.frameCenterY = height / 2;
        
        const frame = this.add.image(this.frameCenterX, this.frameCenterY, 'frame');
        frame.setOrigin(0.5, 0.5);
        frame.setScale(1);
        frame.setDepth(1);
        frame.setAlpha(0); // Hide the arch, keep only background columns
        
        // Calculate grid position within frame (using new cell-based config)
        const gridWidth = GAME_CONFIG.columns * (GAME_CONFIG.cellWidth + GAME_CONFIG.spacing);
        const gridHeight = GAME_CONFIG.maxRows * (GAME_CONFIG.cellHeight + GAME_CONFIG.spacing);
        
        // Use configured startX and startY, or calculate centered if not set
        this.gridStartX = GAME_CONFIG.startX || (this.frameCenterX - gridWidth / 2);
        this.gridStartY = GAME_CONFIG.startY || (this.frameCenterY - gridHeight / 2 + 50);
        
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
        
        // Background
        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        bg.setStrokeStyle(3, 0xFFD700);
        
        // Title
        const title = this.add.text(0, -height/2 + 20, 'MAX WIN', {
            fontSize: '20px',
            color: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Progress bar background
        const barBg = this.add.rectangle(0, 0, width - 20, height - 100, 0x333333, 1);
        
        // Progress bar fill (initially empty)
        this.maxWinProgressBar = this.add.graphics();
        
        // Counter text
        this.maxWinText = this.add.text(0, height/2 - 40, '0/15 Lords', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.maxWinMeter.add([bg, title, barBg, this.maxWinProgressBar, this.maxWinText]);
        
        this.updateMaxWinMeter();
    }
    
    private updateMaxWinMeter(): void {
        if (!this.maxWinProgressBar || !this.maxWinText) return;
        
        const config = MAX_WIN_CONFIG;
        const maxLords = config.levels[config.levels.length - 1].lordsRequired;
        const percentage = this.lordsCaptured / maxLords;
        
        // Find current level
        let currentLevel = config.levels[0];
        for (const level of config.levels) {
            if (this.lordsCaptured < level.lordsRequired) {
                currentLevel = level;
                break;
            }
        }
        
        // Update progress bar
        const { width, height } = config.meterSize;
        const barHeight = height - 100;
        const fillHeight = barHeight * percentage;
        
        this.maxWinProgressBar.clear();
        this.maxWinProgressBar.fillStyle(currentLevel.color, 1);
        this.maxWinProgressBar.fillRect(
            -(width - 20) / 2,
            (barHeight / 2) - fillHeight,
            width - 20,
            fillHeight
        );
        
        // Update text
        this.maxWinText?.setText(`${this.lordsCaptured}/${maxLords} Lords\n${currentLevel.emoji} ${currentLevel.name}`);
        
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
        const neighbors = getRectNeighbors(col, row);
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
    
    private feedMaxWinMeter(): void {
        this.lordsCaptured++;
        this.updateMaxWinMeter();
        
        const config = MAX_WIN_CONFIG;
        
        // Check if we reached a level
        for (const level of config.levels) {
            if (this.lordsCaptured === level.lordsRequired) {
                this.triggerMaxWinLevel(level);
                break;
            }
        }
    }
    
    private triggerMaxWinLevel(level: any): void {
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
    
    private async startRound(): Promise<void> {
        if (this.roundInProgress) return;
        if (this.balance < this.currentBet) {
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
        this.balance -= this.currentBet;
        this.rtpTracker.totalBets += this.currentBet;
        
        this.roundInProgress = true;
        this.cascadeLevel = 0;
        this.waveNumber = 0;
        this.lordsActivatedThisRound.clear();
        
        // Clear win displays
        this.winDisplays.forEach(text => text.destroy());
        this.winDisplays = [];
        
        // Update UI
        this.updateUI('Spinning...');
        
        // 3. Determine target outcome FIRST (RTP Algorithm)
        const targetOutcome = this.determineTargetOutcome();
        console.log(`[RTP] Target outcome: ${targetOutcome}`);
        
        // 4. Spawn controlled grid based on outcome (3-4 rows)
        this.activeRows = Phaser.Math.Between(GRID_CONFIG.startRows.min, GRID_CONFIG.startRows.max);
        await this.spawnControlledGrid(targetOutcome);
        
        // 5. Resolve cascades silently
        this.roundWinnings = 0;
        await this.resolveAllCascades();
        
        // 6. Update RTP and balance
        this.rtpTracker.totalWins += this.roundWinnings;
        this.balance += this.roundWinnings;
        this.updateRTPStats();
        
        // 7. Show persistent result
        this.showPersistentResult();
        
        // 8. End round
        this.roundInProgress = false;
        this.updateUI('Ready to Spin');
    }
    
    /**
     * Spawn controlled grid based on target outcome
     */
    private async spawnControlledGrid(outcome: string): Promise<void> {
        // Clear existing grid
        for (let row = 0; row < GAME_CONFIG.maxRows; row++) {
            for (let col = 0; col < GAME_CONFIG.columns; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col]!.destroy();
                    this.grid[row][col] = null;
                }
            }
        }
        
        // Spawn gems row by row (bottom to top)
        for (let row = 0; row < this.activeRows; row++) {
            for (let col = 0; col < GAME_CONFIG.columns; col++) {
                let gemType: string;
                
                if (outcome === 'loss') {
                    gemType = this.getGemTypeAvoidingMatch(col, row);
                } else if (outcome === 'big' || outcome === 'mega') {
                    gemType = this.getGemTypeFavoringMatch(col, row);
                } else {
                    gemType = this.getWeightedRandomGemType();
                }
                
                await this.spawnGemAt(col, row, gemType);
                await this.wait(30);
            }
        }
    }
    
    /**
     * Spawn a gem at specific grid position with tween animation
     */
    private async spawnGemAt(col: number, row: number, gemType: string): Promise<void> {
        const targetX = this.getGridX(col);
        const targetY = this.getGridY(row);
        
        let gem: Phaser.GameObjects.Container;
        
        // Create gem based on type
        if (gemType.startsWith('mascot_')) {
            const color = gemType.split('_')[1] as 'red' | 'green' | 'blue' | 'yellow';
            gem = createMascotGem(this, targetX, targetY - 300, color, true); // Skip animations initially
        } else if (gemType.startsWith('lord_')) {
            const lordType = gemType.split('_')[1] as 'ignis' | 'ventus' | 'aqua' | 'terra';
            gem = createLordGem(this, targetX, targetY - 300, lordType, true);
        } else if (gemType === 'black_gem') {
            gem = createBlackGem(this, targetX, targetY - 300, true);
        } else if (gemType.startsWith('bomb_')) {
            const bombType = gemType.split('_')[1] as 'small' | 'medium' | 'large' | 'line' | 'color';
            gem = createBombGem(this, targetX, targetY - 300, bombType, true);
        } else {
            gem = createMascotGem(this, targetX, targetY - 300, 'red', true);
        }
        
        gem.setAlpha(0);
        
        // TWEEN animation (no physics)
        await new Promise<void>((resolve) => {
            this.tweens.add({
                targets: gem,
                y: targetY,
                alpha: 1,
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => resolve()
            });
        });
        
        // Store in grid
        this.grid[row][col] = gem;
        gem.setData('col', col);
        gem.setData('row', row);
        gem.setData('settled', true);
    }
    
    /**
     * Get grid X position for column
     */
    private getGridX(col: number): number {
        const totalWidth = GRID_CONFIG.columns * GRID_CONFIG.cellWidth;
        const playAreaWidth = GRID_CONFIG.playArea.right - GRID_CONFIG.playArea.left;
        const startX = GRID_CONFIG.playArea.left + (playAreaWidth - totalWidth) / 2;
        return startX + (col * GRID_CONFIG.cellWidth) + (GRID_CONFIG.cellWidth / 2);
    }
    
    /**
     * Get grid Y position for row (bottom-up indexing)
     */
    private getGridY(row: number): number {
        const totalHeight = this.activeRows * GRID_CONFIG.cellHeight;
        const startY = GRID_CONFIG.playArea.bottom - totalHeight;
        return startY + ((this.activeRows - 1 - row) * GRID_CONFIG.cellHeight) + (GRID_CONFIG.cellHeight / 2);
    }
    
    /**
     * Resolve all cascades silently (no score shown during)
     */
    private async resolveAllCascades(): Promise<void> {
        let cascadeCount = 0;
        
        while (cascadeCount < RTP_CONFIG.maxCascades) {
            const clusters = detectAllMatches(this.grid);
            if (clusters.length === 0) break;
            
            cascadeCount++;
            console.log(`[CASCADE] Level ${cascadeCount}: ${clusters.length} matches found`);
            
            // Calculate winnings (don't show yet)
            const winAmount = this.calculateCascadeWinnings(clusters, cascadeCount);
            this.roundWinnings += winAmount;
            
            // Animate victory (blink)
            await this.animateVictorySilent(clusters);
            
            // Remove gems
            await this.removeMatchedGems(clusters);
            
            // Apply gravity
            await this.applyGridGravityTween();
            
            // Refill (max rows per cascade from config)
            if (this.activeRows < GRID_CONFIG.maxRows) {
                this.activeRows = Math.min(this.activeRows + RTP_CONFIG.refillRowsPerCascade, GRID_CONFIG.maxRows);
            }
            await this.refillGridFromTop();
            
            await this.wait(300);
        }
    }
    
    /**
     * Calculate winnings for a cascade
     */
    private calculateCascadeWinnings(clusters: Cluster[], cascadeLevel: number): number {
        let totalReward = 0;
        
        clusters.forEach(cluster => {
            const multiplier = getMatchMultiplier(cluster.size);
            const comboMultiplier = getComboMultiplier(cascadeLevel);
            
            cluster.gems.forEach(gemData => {
                const gemType = gemData.container.getData('gemType');
                const value = GAME_CONFIG.gemValues[gemType as keyof typeof GAME_CONFIG.gemValues] || 0;
                totalReward += value;
            });
            
            totalReward = totalReward * multiplier * comboMultiplier;
        });
        
        return totalReward;
    }
    
    /**
     * Animate victory silently (no big effects)
     */
    private async animateVictorySilent(clusters: Cluster[]): Promise<void> {
        const allGems = clusters.flatMap(c => c.gems);
        
        // Simple blink animation
        for (let i = 0; i < 3; i++) {
            allGems.forEach(gemData => {
                if (gemData.container.scene) {
                    gemData.container.setAlpha(i % 2 === 0 ? 0.3 : 1.0);
                }
            });
            await this.wait(200);
        }
    }
    
    /**
     * Remove matched gems
     */
    private async removeMatchedGems(clusters: Cluster[]): Promise<void> {
        clusters.forEach(cluster => {
            cluster.gems.forEach(gemData => {
                if (gemData.container.scene) {
                    gemData.container.destroy();
                    this.grid[gemData.row][gemData.col] = null;
                }
            });
        });
        
        await this.wait(200);
    }
    
    /**
     * Apply gravity using tweens (not physics)
     */
    private async applyGridGravityTween(): Promise<void> {
        const promises: Promise<void>[] = [];
        
        for (let col = 0; col < GAME_CONFIG.columns; col++) {
            let writeRow = 0;
            
            for (let readRow = 0; readRow < GAME_CONFIG.maxRows; readRow++) {
                const gem = this.grid[readRow][col];
                if (gem) {
                    if (readRow !== writeRow) {
                        // Move gem down
                        this.grid[readRow][col] = null;
                        this.grid[writeRow][col] = gem;
                        gem.setData('row', writeRow);
                        
                        const targetY = this.getGridY(writeRow);
                        promises.push(new Promise<void>((resolve) => {
                            this.tweens.add({
                                targets: gem,
                                y: targetY,
                                duration: 300,
                                ease: 'Cubic.easeOut',
                                onComplete: () => resolve()
                            });
                        }));
                    }
                    writeRow++;
                }
            }
        }
        
        await Promise.all(promises);
        await this.wait(100);
    }
    
    /**
     * Refill grid from top
     */
    private async refillGridFromTop(): Promise<void> {
        for (let col = 0; col < GAME_CONFIG.columns; col++) {
            for (let row = 0; row < this.activeRows; row++) {
                if (!this.grid[row][col]) {
                    const gemType = this.getWeightedRandomGemType();
                    await this.spawnGemAt(col, row, gemType);
                    await this.wait(30);
                }
            }
        }
    }
    
    private determineRoundLords(): void {
        this.lordsThisRound = [];
        
        for (const [lordType, config] of Object.entries(LORD_CONFIG)) {
            if (Math.random() < config.spawnChance) {
                this.lordsThisRound.push(lordType);
            }
        }
    }
    
    private dropGems(): void {
        const numGems = Phaser.Math.Between(
            GAME_CONFIG.roundConfiguration.gemsPerRound.min,
            GAME_CONFIG.roundConfiguration.gemsPerRound.max
        );
        
        let gemsDropped = 0;
        
        const dropInterval = this.time.addEvent({
            delay: GAME_CONFIG.roundConfiguration.gemDropDelay,
            callback: () => {
                this.dropSingleGem();
                gemsDropped++;
                
                if (gemsDropped >= numGems) {
                    dropInterval.remove();
                    this.time.delayedCall(GAME_CONFIG.roundConfiguration.settlementDelay, () => this.onAllGemsSettled());
                }
            },
            repeat: numGems - 1
        });
    }
    
    private dropSingleGem(): void {
        const gemType = getRandomGemType(this.lordsThisRound);
        
        // Random X position above grid
        const gridWidth = GAME_CONFIG.columns * (GAME_CONFIG.cellWidth + GAME_CONFIG.spacing);
        const startX = this.gridStartX + Math.random() * gridWidth;
        const startY = this.gridStartY - 200; // Start well above grid
        
        let gem: Phaser.GameObjects.Container;
        
        if (gemType.startsWith('mascot_')) {
            const color = gemType.split('_')[1] as 'red' | 'green' | 'blue' | 'yellow';
            gem = createMascotGem(this, startX, startY, color);
        } else if (gemType.startsWith('lord_')) {
            const lordType = gemType.split('_')[1] as 'ignis' | 'ventus' | 'aqua' | 'terra';
            gem = createLordGem(this, startX, startY, lordType);
        } else if (gemType === 'black_gem') {
            gem = createBlackGem(this, startX, startY);
        } else if (gemType.startsWith('bomb_')) {
            const bombType = gemType.split('_')[1] as 'small' | 'medium' | 'large' | 'line' | 'color';
            gem = createBombGem(this, startX, startY, bombType);
        } else {
            gem = createMascotGem(this, startX, startY, 'red');
        }
        
        // Mark as falling
        gem.setData('falling', true);
        gem.setData('settled', false);
        
        // Start gravity-based dropping with collision detection
        this.dropGemWithGravity(gem);
        
        this.fallingGems.push(gem);
    }
    
    /**
     * Drop gem with gravity and sliding physics
     */
    private dropGemWithGravity(gem: Phaser.GameObjects.Container): void {
        // Create falling tween
        const gridBottomY = this.gridStartY + GAME_CONFIG.maxRows * (GAME_CONFIG.cellHeight + GAME_CONFIG.spacing) + 100;
        
        // Add rotation while falling (NEW - as per requirements)
        const rotationDirection = Phaser.Math.Between(-200, 200);
        this.tweens.add({
            targets: gem,
            angle: rotationDirection > 0 ? 360 : -360,
            duration: 2500,
            ease: 'Linear',
            repeat: 0
        });
        
        const fallTween = this.tweens.add({
            targets: gem,
            y: gridBottomY,
            duration: 2500,
            ease: 'Cubic.easeIn',
            onUpdate: () => {
                // Check collision every frame
                if (!gem.getData('settled')) {
                    this.checkGemCollision(gem);
                }
            },
            onComplete: () => {
                // Safety: if gem hasn't settled by now, force settlement
                if (!gem.getData('settled')) {
                    const column = getColumnFromX(gem.x, this.gridStartX);
                    const targetRow = findLowestEmptyRow(this.grid, column);
                    if (targetRow !== -1) {
                        this.snapGemToGrid(gem, column, targetRow);
                    } else {
                        // No space, destroy gem
                        gem.destroy();
                        const index = this.fallingGems.indexOf(gem);
                        if (index > -1) {
                            this.fallingGems.splice(index, 1);
                        }
                    }
                }
            }
        });
        
        gem.setData('fallTween', fallTween);
    }
    
    /**
     * Check gem collision and handle sliding
     */
    private checkGemCollision(gem: Phaser.GameObjects.Container): void {
        // Calculate which column gem is over
        const column = getColumnFromX(gem.x, this.gridStartX);
        
        // Find lowest empty row in this column
        const targetRow = findLowestEmptyRow(this.grid, column);
        
        if (targetRow === -1) {
            // Column full, try sliding
            const slideAmount = GAME_CONFIG.slideSpeed * GAME_CONFIG.frameTime60FPS;
            
            if (canSlideLeft(this.grid, column)) {
                gem.x -= slideAmount;
                return;
            }
            
            if (canSlideRight(this.grid, column)) {
                gem.x += slideAmount;
                return;
            }
            
            // Can't slide, find nearest available column
            const nearestColumn = findNearestAvailableColumn(this.grid, column);
            if (nearestColumn !== -1) {
                // Move towards that column
                const targetX = getColumnCenterX(nearestColumn, this.gridStartX);
                if (gem.x < targetX) {
                    gem.x += slideAmount;
                } else {
                    gem.x -= slideAmount;
                }
            }
        } else {
            // Found empty space, check if gem reached it
            const targetY = getRowCenterY(targetRow, this.gridStartY);
            
            if (gem.y >= targetY - GAME_CONFIG.collisionTolerance) {
                // Snap to grid position
                this.snapGemToGrid(gem, column, targetRow);
            }
        }
    }
    
    /**
     * Snap gem to final grid position
     */
    private snapGemToGrid(gem: Phaser.GameObjects.Container, col: number, row: number): void {
        // Stop all physics
        const fallTween = gem.getData('fallTween');
        if (fallTween) {
            fallTween.stop();
        }
        this.tweens.killTweensOf(gem);
        
        // Mark as settling
        gem.setData('falling', false);
        
        // Snap to exact grid position
        const targetX = getColumnCenterX(col, this.gridStartX);
        const targetY = getRowCenterY(row, this.gridStartY);
        
        this.tweens.add({
            targets: gem,
            x: targetX,
            y: targetY,
            angle: 0,  // Straighten out the gem (reset rotation)
            duration: 100,
            ease: 'Power2',
            onComplete: () => {
                // Add to grid
                this.grid[row][col] = gem;
                gem.setData('col', col);
                gem.setData('row', row);
                gem.setData('settled', true);
                
                // Check if it's a lord/wild
                this.checkWildLanding(gem, row, col);
            }
        });
    }
    
    private onAllGemsSettled(): void {
        // With new gravity system, gems settle themselves via snapGemToGrid
        // Just wait for all to finish settling and check for matches
        this.fallingGems = this.fallingGems.filter(gem => {
            const settled = gem.getData('settled');
            if (!settled && gem.scene) {
                // Still falling, keep in array
                return true;
            }
            // Settled or destroyed, remove from array
            return false;
        });
        
        // If gems still falling, check again in a moment
        if (this.fallingGems.length > 0) {
            this.time.delayedCall(100, () => this.onAllGemsSettled());
            return;
        }
        
        // All gems settled, check for matches
        this.time.delayedCall(300, () => this.checkMatches());
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
            const targetY = getRowCenterY(targetRow, this.gridStartY);
            
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
            // 🐛 DEBUG: Check if position is already occupied
            if (this.grid[row][col] !== null) {
                console.warn(`[CASCADE] Skipping occupied cell: col=${col} row=${row}`);
                resolve();
                return;
            }
            
            const gemType = getRandomGemType(this.lordsThisRound);
            
            // Calculate target position
            const targetPixel = gridToPixel(col, row, this.gridStartX, this.gridStartY);
            const targetX = targetPixel.x;
            const targetY = targetPixel.y;
            
            // Start position: directly above the target column
            const startY = this.gridStartY - 300;
            
            // 🐛 DEBUG: Log positions
            console.log(`[CASCADE] Gem ${gemType} col=${col} row=${row} startY=${startY} targetY=${targetY} distance=${targetY - startY}`);
            
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
        
        // Re-enable float animation
        if (gemType?.startsWith('mascot_')) {
            this.tweens.add({
                targets: gem,
                y: baseY + GAME_CONFIG.animations.gemFloat.yOffset,
                duration: GAME_CONFIG.animations.gemFloat.duration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Re-enable sparkle animation
            const sparkle = gem.getData('sparkle');
            if (sparkle) {
                this.tweens.add({
                    targets: sparkle,
                    alpha: { from: 0, to: 1 },
                    angle: 180,
                    duration: GAME_CONFIG.animations.sparkle.duration,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        } else if (gemType?.startsWith('lord_')) {
            // Lord float animation
            this.tweens.add({
                targets: gem,
                y: baseY + GAME_CONFIG.animations.lordFloat.yOffset,
                duration: GAME_CONFIG.animations.lordFloat.duration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Lord rotation
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
        
        // Create persistent win text
        const winText = createWinText(
            this,
            this.frameCenterX,
            this.frameCenterY - 150 - (this.winDisplays.length * 40),
            amount,
            isSpecial
        );
        
        this.winDisplays.push(winText);
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
        
        // Show win amount
        if (totalWin > 0) {
            this.addWin(totalWin, totalGems >= 10);
        }
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
        // Drop new gems in random columns using configured range
        const numGems = Phaser.Math.Between(
            GAME_CONFIG.roundConfiguration.gemsPerRound.min,
            GAME_CONFIG.roundConfiguration.gemsPerRound.max
        );
        const promises: Promise<void>[] = [];
        
        for (let i = 0; i < numGems; i++) {
            const col = Phaser.Math.Between(0, GAME_CONFIG.columns - 1);
            
            // Find available row using utility function
            const targetRow = getAvailableRowInColumn(this.grid, col);
            
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
    
    private wait(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.time.delayedCall(ms, () => resolve());
        });
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
            return Math.random() < 0.5 ? 'medium' : 'big';
        }
        
        // Control consecutive streaks
        if (this.rtpTracker.consecutiveWins >= RTP_CONFIG.maxConsecutiveWins) {
            this.rtpTracker.consecutiveWins = 0;
            return 'loss';
        }
        
        if (this.rtpTracker.consecutiveLosses >= RTP_CONFIG.minConsecutiveLosses) {
            this.rtpTracker.consecutiveLosses = 0;
            return Math.random() < 0.7 ? 'medium' : 'big';
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
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        
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
        } while (avoidTypes.has(this.getBaseType(gemType)) && attempts < 10);
        
        return gemType;
    }
    
    /**
     * Get gem type favoring matches (for win scenarios)
     */
    private getGemTypeFavoringMatch(col: number, row: number): string {
        const neighbors = this.getNeighborTypes(col, row);
        
        // 60% chance to match neighbor
        if (neighbors.length > 0 && Math.random() < 0.6) {
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
        if (type.includes('wild')) return 'wild';
        return type;
    }
    
    /**
     * Show persistent result with intermittent fade
     */
    private showPersistentResult(): void {
        const isWin = this.roundWinnings > 0;
        const betMultiple = isWin ? this.roundWinnings / this.currentBet : 0;
        
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
