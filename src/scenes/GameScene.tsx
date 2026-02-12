
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    private cols = 6;
    private rows = 4;
    private cellSize = 64;
    private boardX = 420;
    private boardY = 120;
    private grid: string[][] = [];
    private tileGroup?: Phaser.GameObjects.Group;
    private boardContainer?: Phaser.GameObjects.Container;
    
    // Economy
    private balance = 1000;
    private bet = 10;
    private freeSpins = 0;
    private cascadeMultiplier = 1;
    
    // Symbols
    private baseSymbols = ['red', 'green', 'blue', 'purple'];
    private symbolKeys: string[] = [];

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // No external assets needed - we'll create textures programmatically
    }

    create() {
        // Initialize symbol keys
        this.symbolKeys = [...this.baseSymbols];
        this.symbolKeys.push('W'); // wild
        this.symbolKeys.push('S'); // scatter
        
        // 1. Add background
        this.createBackground();
        
        // 2. Create symbol textures (colored circles)
        this.createSymbolTextures();
        
        // 3. Create UI (left side)
        this.createUI();
        
        // 4. Create board container
        this.createGridVisual();
        
        // 5. Initialize grid with random symbols
        this.resetGrid();
    }

    private createBackground() {
        // Create a gradient-like background effect
        this.add.rectangle(0, 0, 900, 650, 0x081018).setOrigin(0);
        
        // Add some atmospheric circles for depth
        this.add.circle(100, 100, 80, 0x1a2332, 0.3);
        this.add.circle(800, 500, 100, 0x1a2332, 0.2);
        this.add.circle(450, 325, 150, 0x0f1720, 0.4);
    }

    private createSymbolTextures() {
        const size = this.cellSize;
        const graphics = this.make.graphics({ x: 0, y: 0 }, false);
        
        const mapping: { [key: string]: string } = {
            red: '#E94B3C',
            green: '#3EC47A',
            blue: '#3C7BE9',
            purple: '#A04CE9',
            W: '#FFD166',    // wild - gold
            S: '#50E3C2'     // scatter - teal
        };
        
        for (const key of Object.keys(mapping)) {
            graphics.clear();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, size, size);
            graphics.fillStyle(Phaser.Display.Color.HexStringToColor(mapping[key]).color, 1);
            graphics.fillCircle(size / 2, size / 2, size * 0.36);
            graphics.lineStyle(4, 0x000000, 0.25);
            graphics.strokeCircle(size / 2, size / 2, size * 0.36);
            graphics.generateTexture('sym_' + key, size, size);
        }
    }

    private createUI() {
        // UI on the left side
        this.add.text(20, 18, `Balance: $${this.balance}`, {
            fontSize: '18px',
            color: '#ffffff'
        });
        
        this.add.text(20, 44, `Free Spins: ${this.freeSpins}`, {
            fontSize: '16px',
            color: '#7fe0ff'
        });
        
        this.add.text(20, 70, `Bet: $${this.bet}`, {
            fontSize: '16px',
            color: '#ffffff'
        });
        
        this.add.text(20, 96, `Multiplier: x${this.cascadeMultiplier}`, {
            fontSize: '14px',
            color: '#ffef7a'
        });
        
        // Spin button
        this.add.text(20, 140, 'SPIN', {
            fontSize: '24px',
            color: '#000000',
            backgroundColor: '#FFD166',
            padding: { x: 20, y: 10 }
        }).setInteractive().on('pointerdown', () => {
            // Placeholder for spin logic
            console.log('Spin clicked!');
        });
    }

    private createGridVisual() {
        if (this.boardContainer) {
            this.boardContainer.destroy();
        }
        
        this.boardContainer = this.add.container(this.boardX, this.boardY);
        
        // Background plate for the board
        const plateWidth = this.cols * this.cellSize + 20;
        const plateHeight = this.rows * this.cellSize + 20;
        const plate = this.add.rectangle(0, 0, plateWidth, plateHeight, 0x0f1720, 0.8)
            .setOrigin(0)
            .setStrokeStyle(2, 0x222538);
        
        this.boardContainer.add(plate);
    }

    private resetGrid() {
        // Initialize grid array
        this.grid = [];
        for (let c = 0; c < this.cols; c++) {
            this.grid[c] = [];
            for (let r = 0; r < this.rows; r++) {
                this.grid[c][r] = this.randomSymbol();
            }
        }
        
        // Render visual sprites
        this.renderGrid();
    }

    private randomSymbol(): string {
        return Phaser.Utils.Array.GetRandom(this.symbolKeys);
    }

    private renderGrid() {
        // Remove previous tile group
        if (this.tileGroup) {
            this.tileGroup.clear(true, true);
        }
        this.tileGroup = this.add.group();
        
        // Create sprites for each cell
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                const key = this.grid[c][r];
                const x = this.boardX + c * this.cellSize + 10 + this.cellSize / 2;
                const y = this.boardY + r * this.cellSize + 10 + this.cellSize / 2;
                const img = this.add.image(x, y, 'sym_' + key)
                    .setDisplaySize(this.cellSize - 6, this.cellSize - 6);
                img.setData('col', c);
                img.setData('row', r);
                img.setData('key', key);
                this.tileGroup.add(img);
            }
        }
    }

    update() {
        // Game logic that runs each frame
    }
}
