/**
 * GameScene.tsx
 * Complete hexagonal puzzle game implementation with all systems
 */

import Phaser from 'phaser';
import { GAME_CONFIG, LORD_CONFIG, MASCOT_CONFIG, getMatchMultiplier, getComboMultiplier } from '../config/GameConfig';
import { hexToPixel } from '../utils/HexGrid';
import { createMascotGem, createLordGem, createBlackGem, createBombGem, getRandomGemType } from '../utils/GemFactory';
import { findClusters, checkLordPower, findAllGemsOfColor, getBombExplosionGems } from '../utils/ClusterDetector';
import type { Cluster } from '../utils/ClusterDetector';
import { 
    createExplosion, 
    shakeScreen, 
    createLordPowerEffect, 
    createSuperBonusEffect, 
    createWinText 
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
    
    // UI elements
    private balanceText?: Phaser.GameObjects.Text;
    private betText?: Phaser.GameObjects.Text;
    private roundInfoText?: Phaser.GameObjects.Text;
    private lordsIndicator?: Phaser.GameObjects.Container;
    private winDisplays: Phaser.GameObjects.Text[] = [];
    
    // Frame bounds
    private frameCenterX = 0;
    private frameCenterY = 0;
    
    // Pins for pinball physics
    private pins: Phaser.GameObjects.Arc[] = [];

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
        this.physics.world.gravity.y = GAME_CONFIG.gravity;
        
        // Background
        const bg = this.add.image(0, 0, 'background');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(width, height);
        bg.setDepth(0);
        
        // Frame centered
        this.frameCenterX = width / 2;
        this.frameCenterY = height / 2;
        
        const frame = this.add.image(this.frameCenterX, this.frameCenterY, 'frame');
        frame.setOrigin(0.5, 0.5);
        frame.setScale(1);
        frame.setDepth(1);
        
        // Calculate grid position within frame
        const gridWidth = GAME_CONFIG.hexCols * GAME_CONFIG.hexWidth;
        const gridHeight = GAME_CONFIG.hexRows * GAME_CONFIG.hexHeight * 0.75;
        
        this.gridStartX = this.frameCenterX - gridWidth / 2;
        this.gridStartY = this.frameCenterY - gridHeight / 2 + 50;
        
        // Initialize empty grid
        this.initializeGrid();
        
        // Create pins for pinball physics
        this.createPins();
        
        // Create UI
        this.createUI();
        
        // Create Lords indicator
        this.createLordsIndicator();
    }

    // ========================================
    // INITIALIZATION METHODS
    // ========================================
    
    private initializeGrid(): void {
        this.grid = [];
        for (let row = 0; row < GAME_CONFIG.hexRows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GAME_CONFIG.hexCols; col++) {
                this.grid[row][col] = null;
            }
        }
    }
    
    private createPins(): void {
        const pinConfig = GAME_CONFIG.pins;
        let yPos = this.gridStartY - 50;
        
        for (let row = 0; row < pinConfig.rows; row++) {
            const pinsInRow = pinConfig.pattern[row];
            const offset = row % 2 === 0 ? 0 : pinConfig.horizontalSpacing / 2;
            
            for (let i = 0; i < pinsInRow; i++) {
                const xPos = this.gridStartX + offset + i * pinConfig.horizontalSpacing + 100;
                
                const pin = this.add.circle(xPos, yPos, pinConfig.radius, 0x8B4513);
                this.physics.add.existing(pin, true);
                this.pins.push(pin);
            }
            
            yPos += pinConfig.verticalSpacing;
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
    
    private startRound(): void {
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
        
        this.balance -= this.currentBet;
        this.roundInProgress = true;
        this.cascadeLevel = 0;
        this.lordsActivatedThisRound.clear();
        
        // Clear win displays
        this.winDisplays.forEach(text => text.destroy());
        this.winDisplays = [];
        
        // Determine which Lords spawn this round
        this.determineRoundLords();
        this.updateLordsIndicator();
        
        // Update UI
        this.updateUI('Dropping gems...');
        
        // Drop gems
        this.dropGems();
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
        
        const startX = this.gridStartX + Math.random() * (GAME_CONFIG.hexCols * GAME_CONFIG.hexWidth);
        const startY = this.gridStartY - 100;
        
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
        
        // Add physics
        this.physics.add.existing(gem);
        const body = gem.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
            Phaser.Math.Between(GAME_CONFIG.initialVelocityX.min, GAME_CONFIG.initialVelocityX.max),
            GAME_CONFIG.initialVelocityY
        );
        body.setBounce(GAME_CONFIG.bounce);
        body.setDrag(GAME_CONFIG.drag);
        body.setCollideWorldBounds(true);
        
        // Collide with pins
        this.physics.add.collider(gem, this.pins);
        
        this.fallingGems.push(gem);
    }
    
    private onAllGemsSettled(): void {
        // Snap gems to grid positions
        this.fallingGems.forEach(gem => {
            const pixelPos = { x: gem.x - this.gridStartX, y: gem.y - this.gridStartY };
            const hexPos = this.findNearestEmptyHex(pixelPos.x, pixelPos.y);
            
            if (hexPos !== null) {
                const targetPixel = hexToPixel(hexPos.col, hexPos.row);
                const targetX = this.gridStartX + targetPixel.x;
                const targetY = this.gridStartY + targetPixel.y;
                
                // Snap to position
                this.tweens.add({
                    targets: gem,
                    x: targetX,
                    y: targetY,
                    duration: 200,
                    ease: 'Power2'
                });
                
                gem.setData('col', hexPos.col);
                gem.setData('row', hexPos.row);
                this.grid[hexPos.row][hexPos.col] = gem;
                
                // Disable physics
                const body = gem.body as Phaser.Physics.Arcade.Body;
                body.setVelocity(0, 0);
                this.physics.world.disable(gem);
            } else {
                // No space, destroy gem
                gem.destroy();
            }
        });
        
        this.fallingGems = [];
        
        // Check for matches
        this.time.delayedCall(300, () => this.checkMatches());
    }
    
    private findNearestEmptyHex(x: number, y: number): { col: number; row: number } | null {
        let nearestDist = Infinity;
        let nearest: { col: number; row: number } | null = null;
        
        for (let row = 0; row < GAME_CONFIG.hexRows; row++) {
            for (let col = 0; col < GAME_CONFIG.hexCols; col++) {
                if (this.grid[row][col] === null) {
                    const hexPixel = hexToPixel(col, row);
                    const dist = Phaser.Math.Distance.Between(x, y, hexPixel.x, hexPixel.y);
                    
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearest = { col, row };
                    }
                }
            }
        }
        
        return nearest;
    }

    // ========================================
    // MATCH DETECTION AND EXPLOSIONS
    // ========================================
    
    private checkMatches(): void {
        this.cascadeLevel++;
        
        // Check for Lord powers first
        let lordPowerTriggered = false;
        
        for (let row = 0; row < GAME_CONFIG.hexRows; row++) {
            for (let col = 0; col < GAME_CONFIG.hexCols; col++) {
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
        
        for (let row = 0; row < GAME_CONFIG.hexRows; row++) {
            for (let col = 0; col < GAME_CONFIG.hexCols; col++) {
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
        
        // Find normal clusters
        const clusters = findClusters(this.grid);
        
        if (clusters.length > 0) {
            this.explodeClusters(clusters);
        } else {
            // No more matches, check for end of round
            this.endRound();
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
        let gemsMoved = false;
        
        // Move gems down to fill gaps
        for (let row = GAME_CONFIG.hexRows - 1; row >= 0; row--) {
            for (let col = 0; col < GAME_CONFIG.hexCols; col++) {
                if (this.grid[row][col] !== null) continue;
                
                // Find gem above
                for (let searchRow = row - 1; searchRow >= 0; searchRow--) {
                    if (this.grid[searchRow][col] !== null) {
                        const gem = this.grid[searchRow][col];
                        if (!gem) continue;
                        
                        // Move gem down
                        this.grid[row][col] = gem;
                        this.grid[searchRow][col] = null;
                        
                        gem.setData('row', row);
                        
                        const targetPixel = hexToPixel(col, row);
                        const targetY = this.gridStartY + targetPixel.y;
                        
                        this.tweens.add({
                            targets: gem,
                            y: targetY,
                            duration: 300,
                            ease: 'Bounce.easeOut'
                        });
                        
                        gemsMoved = true;
                        break;
                    }
                }
            }
        }
        
        if (gemsMoved) {
            // Check for matches again after cascade
            this.time.delayedCall(400, () => this.checkMatches());
        } else {
            // No more cascades, end round
            this.endRound();
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
    
    private endRound(): void {
        // Check for black gems penalty
        let blackGemPenalty = 0;
        
        for (let row = 0; row < GAME_CONFIG.hexRows; row++) {
            for (let col = 0; col < GAME_CONFIG.hexCols; col++) {
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
    
    update(): void {
        // Update falling gems physics
    }
}
