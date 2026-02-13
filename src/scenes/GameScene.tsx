import Phaser from 'phaser';

const GAME_CONFIG = {
    // Grid de gemas (estrecho y vertical)
    cols: 6,              // 6 columnas en la base
    rows: 9,              // 9 filas (más alto que ancho)
    gemSize: 55,          // Tamaño de cada gema
    
    // Área del grid
    gridWidth: 330,       // 6 * 55 = 330px (estrecho)
    gridHeight: 495,      // 9 * 55 = 495px (alto)
    
    // Frame
    frameScale: 1,        // Escala del frame
    framePaddingX: 20,    // Padding interno horizontal
    framePaddingY: 20,    // Padding interno vertical
    
    // Cygnus Pattern
    cygnusFillReduction: 0.6,  // Factor de reducción para patrón Cygnus
    
    // Win calculation
    winMultiplierMin: 0,
    winMultiplierMax: 5
};

// Theme colors are defined for reference and future use
// @ts-ignore - unused but kept for reference
const THEME_COLORS = {
    // Backgrounds
    bgMain: 0x0a0e27,
    bgSecondary: 0x1a1f3a,
    
    // Lords
    lordIgnis: 0xFF4500,    // Rojo/Naranja
    lordVentus: 0x32CD32,   // Verde
    lordAqua: 0x1E90FF,     // Azul
    lordTerra: 0xFFD700,    // Dorado/Amarillo
    
    // UI
    gold: 0xFFD700,
    purple: 0x8B5CF6,
    darkBg: 0x000000,
    
    // Bonus
    bonusWild: 0xFFD700,
    bonusMega: 0xFF4500,
    bonusFree: 0x8B5CF6
};

export class GameScene extends Phaser.Scene {
    private grid: (Phaser.GameObjects.Container | null)[][] = [];
    private gridStartX: number = 0;
    private gridStartY: number = 0;
    private gemTypes: string[] = [];
    private gemSprites: Phaser.GameObjects.Container[] = [];
    
    // Economy
    private balance = 100;
    private currentBet = 1.0;
    private freeSpins = 0;
    private cascadeMultiplier = 1;
    
    // Bonus progress (dynamic state)
    private bonusProgress = {
        wildStorm: 0,
        megaWin: 5,
        freeSpins: 8
    };

    // UI elements
    private balanceText?: Phaser.GameObjects.Text;
    private betText?: Phaser.GameObjects.Text;
    private freeSpinsText?: Phaser.GameObjects.Text;
    private multiplierText?: Phaser.GameObjects.Text;
    
    // Game state
    private isAnimating = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Fondo
        this.load.image('background', '/OrdenOFlordsThePuzzleGame/assets/fantasy landscape co.png');
        
        // Frame (arco de columnas)
        this.load.image('frame', '/OrdenOFlordsThePuzzleGame/assets/ruin_columns.png');
        
        // Mascotas - Note: mascot1 has different spelling than others (macota1 vs mascota2/3/4)
        this.load.image('mascot1', '/OrdenOFlordsThePuzzleGame/assets/macota1.png');        // Note: 'macota' without 's'
        this.load.image('mascot2', '/OrdenOFlordsThePuzzleGame/assets/mascota2.png');
        this.load.image('mascot3', '/OrdenOFlordsThePuzzleGame/assets/mascota3.png');
        this.load.image('mascot4', '/OrdenOFlordsThePuzzleGame/assets/mascota4.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // ========================================
        // 1. FONDO COMPLETO
        // ========================================
        const bg = this.add.image(0, 0, 'background');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(width, height);
        bg.setDepth(0);
        
        // ========================================
        // 2. FRAME CENTRADO (arco de columnas)
        // ========================================
        const frameCenterX = width / 2;
        const frameCenterY = height / 2 + 20; // Ligeramente más abajo
        
        const frame = this.add.image(frameCenterX, frameCenterY, 'frame');
        frame.setOrigin(0.5, 0.5);
        frame.setScale(1);
        frame.setDepth(1);
        
        // ========================================
        // 3. POSICIONAR GRID DENTRO DEL FRAME
        // ========================================
        const gridStartX = frameCenterX - (GAME_CONFIG.gridWidth / 2);
        const gridStartY = frameCenterY - (GAME_CONFIG.gridHeight / 2);
        
        this.gridStartX = gridStartX;
        this.gridStartY = gridStartY;
        
        // ========================================
        // 4. CREAR SÍMBOLOS (círculos dorados)
        // ========================================
        this.gemTypes = ['mascot1', 'mascot2', 'mascot3', 'mascot4'];
        this.grid = [];
        this.gemSprites = [];
        
        // ========================================
        // 5. UI PANEL IZQUIERDA
        // ========================================
        this.createUIPanel();
        
        // ========================================
        // 6. SUPER BONUS PANEL DERECHA
        // ========================================
        this.createSuperBonusPanel();
        
        // ========================================
        // 7. INICIALIZAR GRID CON PATRÓN CYGNUS
        // ========================================
        this.initializeCygnusGrid();
    }

    createGemSymbol(x: number, y: number, type: string): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        container.setDepth(2);
        
        // Círculo dorado exterior
        const outerCircle = this.add.graphics();
        outerCircle.lineStyle(4, 0xFFD700, 1);
        outerCircle.strokeCircle(0, 0, 25);
        
        // Glow effect
        outerCircle.lineStyle(8, 0xFFD700, 0.3);
        outerCircle.strokeCircle(0, 0, 28);
        
        // Fondo semi-transparente
        outerCircle.fillStyle(0x000000, 0.3);
        outerCircle.fillCircle(0, 0, 25);
        
        // Mascota dentro del círculo
        const mascot = this.add.image(0, 0, type);
        mascot.setDisplaySize(40, 40); // 80% del círculo
        
        container.add([outerCircle, mascot]);
        container.setSize(50, 50);
        container.setData('type', type);
        
        return container;
    }

    createUIPanel() {
        const panelX = 120;
        const panelY = 150;
        const panelWidth = 200;
        const panelHeight = 400;
        
        // Fondo semi-transparente oscuro
        const bg = this.add.rectangle(
            panelX, panelY, 
            panelWidth, panelHeight, 
            0x000000, 0.75  // 75% opacidad
        );
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setDepth(10);
        
        // Estilo de texto (MUY LEGIBLE)
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Cinzel',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        };
        
        // Textos
        this.balanceText = this.add.text(
            panelX, panelY - 150, 
            'Balance: £100.00', 
            textStyle
        ).setOrigin(0.5).setDepth(11);
        
        this.betText = this.add.text(
            panelX, panelY - 110, 
            'Bet: £1.00', 
            textStyle
        ).setOrigin(0.5).setDepth(11);
        
        this.freeSpinsText = this.add.text(
            panelX, panelY - 70, 
            'Free Spins: 0', 
            textStyle
        ).setOrigin(0.5).setDepth(11);
        
        this.multiplierText = this.add.text(
            panelX, panelY - 30, 
            'Multiplier: x1', 
            textStyle
        ).setOrigin(0.5).setDepth(11);
        
        // Botón CHANGE BET
        this.createRoundedButton(
            panelX, panelY + 50, 
            180, 50, 
            'CHANGE BET', 
            0x8B5CF6,  // Púrpura
            () => this.showBetModal()
        );
        
        // Botón SPIN (MUY REDONDEADO)
        this.createRoundedButton(
            panelX, panelY + 120, 
            180, 60, 
            'SPIN', 
            0xFFD700,  // Dorado
            () => this.spin(),
            30  // Radio de 30px (muy redondeado)
        );
    }

    createRoundedButton(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        text: string, 
        color: number, 
        callback: Function,
        radius: number = 15  // Radio por defecto
    ): Phaser.GameObjects.Container {
        const button = this.add.graphics();
        
        // Dibujar rectángulo redondeado
        button.fillStyle(color, 1);
        button.fillRoundedRect(-width/2, -height/2, width, height, radius);
        
        // Borde
        button.lineStyle(3, 0xFFFFFF, 0.8);
        button.strokeRoundedRect(-width/2, -height/2, width, height, radius);
        
        // Texto
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '22px',
            color: '#000000',
            fontFamily: 'Cinzel',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Contenedor
        const container = this.add.container(x, y, [button, buttonText]);
        container.setSize(width, height);
        container.setDepth(11);
        container.setInteractive();
        
        // Hover effect
        container.on('pointerover', () => {
            button.clear();
            button.fillStyle(color, 0.8);
            button.fillRoundedRect(-width/2, -height/2, width, height, radius);
            button.lineStyle(3, 0xFFFFFF, 1);
            button.strokeRoundedRect(-width/2, -height/2, width, height, radius);
            container.setScale(1.05);
        });
        
        container.on('pointerout', () => {
            button.clear();
            button.fillStyle(color, 1);
            button.fillRoundedRect(-width/2, -height/2, width, height, radius);
            button.lineStyle(3, 0xFFFFFF, 0.8);
            button.strokeRoundedRect(-width/2, -height/2, width, height, radius);
            container.setScale(1);
        });
        
        container.on('pointerdown', callback);
        
        return container;
    }

    private colorToHex(color: number): string {
        return '#' + color.toString(16).padStart(6, '0');
    }

    createSuperBonusPanel() {
        const panelX = this.cameras.main.width - 140;
        const panelY = 250;
        
        const bonuses = [
            { name: 'WILD\nSTORM', icon: '🌟', progress: this.bonusProgress.wildStorm, max: 10, color: 0xFFD700 },
            { name: 'MEGA\nWIN', icon: '⚡', progress: this.bonusProgress.megaWin, max: 10, color: 0xFF4500 },
            { name: 'FREE\nSPINS+', icon: '💫', progress: this.bonusProgress.freeSpins, max: 10, color: 0x8B5CF6 }
        ];
        
        bonuses.forEach((bonus, index) => {
            const yPos = panelY + (index * 140);
            
            // Fondo del slot
            const slotBg = this.add.rectangle(
                panelX, yPos, 
                130, 110, 
                0x1a1f3a, 0.8
            );
            slotBg.setStrokeStyle(2, bonus.color);
            slotBg.setDepth(10);
            
            // Icono grande
            const icon = this.add.text(panelX, yPos - 25, bonus.icon, {
                fontSize: '40px'
            }).setOrigin(0.5).setDepth(11);
            
            // Nombre
            this.add.text(panelX, yPos + 15, bonus.name, {
                fontSize: '11px',
                color: this.colorToHex(bonus.color),
                fontFamily: 'Cinzel',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5).setDepth(11);
            
            // Progreso texto
            this.add.text(
                panelX, yPos + 38, 
                `${bonus.progress}/${bonus.max}`, 
                {
                    fontSize: '14px',
                    color: '#FFFFFF',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5).setDepth(11);
            
            // Barra de progreso
            const barWidth = 100;
            const barHeight = 6;
            
            // Fondo de la barra
            this.add.rectangle(
                panelX, yPos + 50,
                barWidth, barHeight,
                0x333333, 1
            ).setDepth(11);
            
            // Barra de progreso llena
            const percentage = bonus.progress / bonus.max;
            this.add.rectangle(
                panelX - (barWidth/2) + (barWidth * percentage / 2),
                yPos + 50,
                barWidth * percentage, barHeight,
                bonus.color, 1
            ).setDepth(12);
            
            // Glow si está casi completo
            if (percentage >= 0.7) {
                slotBg.setStrokeStyle(3, bonus.color);
                icon.setScale(1.1);
                
                // Partículas
                this.tweens.add({
                    targets: icon,
                    scale: { from: 1.1, to: 1.2 },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            }
        });
        
        // Título del panel
        this.add.text(panelX, panelY - 100, 'SUPER\nBONUS', {
            fontSize: '18px',
            color: '#FFD700',
            fontFamily: 'Cinzel',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11);
    }

    initializeCygnusGrid() {
        // Inicializar array vacío
        for (let row = 0; row < GAME_CONFIG.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GAME_CONFIG.cols; col++) {
                this.grid[row][col] = null;
            }
        }
        
        // Llenar con patrón Cygnus (desde abajo, parcialmente)
        for (let row = 0; row < GAME_CONFIG.rows; row++) {
            for (let col = 0; col < GAME_CONFIG.cols; col++) {
                // Probabilidad decrece hacia arriba
                const fillChance = Math.max(0, 1 - (row / GAME_CONFIG.rows) * GAME_CONFIG.cygnusFillReduction);
                
                if (Math.random() < fillChance) {
                    const randomType = Phaser.Math.RND.pick(this.gemTypes);
                    const x = this.gridStartX + (col * GAME_CONFIG.gemSize) + (GAME_CONFIG.gemSize / 2);
                    const y = this.gridStartY + (row * GAME_CONFIG.gemSize) + (GAME_CONFIG.gemSize / 2);
                    
                    const gem = this.createGemSymbol(x, y, randomType);
                    this.grid[row][col] = gem;
                    this.gemSprites.push(gem);
                }
            }
        }
    }

    showBetModal() {
        if (this.isAnimating) return;
        
        const { width, height } = this.cameras.main;
        
        // Overlay oscuro
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0, 0);
        overlay.setDepth(100);
        overlay.setInteractive();
        
        // Panel del modal
        const modalWidth = 400;
        const modalHeight = 500;
        const modal = this.add.rectangle(
            width/2, height/2,
            modalWidth, modalHeight,
            0x1a1f3a, 1
        );
        modal.setStrokeStyle(4, 0xFFD700);
        modal.setDepth(101);
        
        // Título
        const title = this.add.text(width/2, height/2 - 200, 'SELECT YOUR BET', {
            fontSize: '28px',
            color: '#FFD700',
            fontFamily: 'Cinzel',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);
        
        // Valores de apuesta
        const betValues = [0.20, 0.40, 1.00, 2.00, 3.00, 4.00, 5.00, 10.00];
        const cols = 2;
        const startY = height/2 - 130;
        const buttonWidth = 150;
        const buttonHeight = 60;
        const gap = 20;
        
        const elementsToDestroy: Phaser.GameObjects.GameObject[] = [overlay, modal, title];
        
        betValues.forEach((value, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = width/2 - buttonWidth/2 - gap/2 + col * (buttonWidth + gap);
            const y = startY + row * (buttonHeight + gap);
            
            const btn = this.createRoundedButton(
                x, y,
                buttonWidth, buttonHeight,
                `£${value.toFixed(2)}`,
                0x8B5CF6,
                () => {
                    this.currentBet = value;
                    if (this.betText) {
                        this.betText.setText(`Bet: £${value.toFixed(2)}`);
                    }
                    elementsToDestroy.forEach(el => el.destroy());
                },
                20
            );
            btn.setDepth(102);
            elementsToDestroy.push(btn);
        });
        
        // Botón CLOSE
        const closeBtn = this.createRoundedButton(
            width/2, height/2 + 200,
            200, 50,
            'CLOSE',
            0xFF4500,
            () => {
                elementsToDestroy.forEach(el => el.destroy());
            },
            15
        );
        closeBtn.setDepth(102);
        elementsToDestroy.push(closeBtn);
    }

    spin() {
        if (this.isAnimating) return;
        
        // Check balance
        if (this.freeSpins > 0) {
            this.freeSpins--;
        } else {
            if (this.balance < this.currentBet) {
                // Flash balance text
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
        }
        
        this.cascadeMultiplier = 1;
        this.updateUI();
        
        this.isAnimating = true;
        
        // Clear and reinitialize grid
        this.gemSprites.forEach(gem => gem.destroy());
        this.gemSprites = [];
        this.initializeCygnusGrid();
        
        // Simulate win
        this.time.delayedCall(1000, () => {
            const win = this.currentBet * Phaser.Math.Between(GAME_CONFIG.winMultiplierMin, GAME_CONFIG.winMultiplierMax);
            if (win > 0) {
                this.balance += win;
                this.showWinText(win);
            }
            this.isAnimating = false;
            this.updateUI();
        });
    }

    showWinText(amount: number) {
        const winText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `WIN: £${amount.toFixed(2)}`,
            {
                fontSize: '48px',
                color: '#FFD700',
                fontFamily: 'Cinzel',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6,
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: '#000000',
                    blur: 5,
                    fill: true
                }
            }
        );
        winText.setOrigin(0.5);
        winText.setDepth(200);
        
        this.tweens.add({
            targets: winText,
            scale: { from: 0.5, to: 1.5 },
            alpha: { from: 1, to: 0 },
            duration: 2000,
            ease: 'Power2',
            onComplete: () => winText.destroy()
        });
    }

    updateUI() {
        if (this.balanceText) {
            this.balanceText.setText(`Balance: £${this.balance.toFixed(2)}`);
        }
        if (this.betText) {
            this.betText.setText(`Bet: £${this.currentBet.toFixed(2)}`);
        }
        if (this.freeSpinsText) {
            this.freeSpinsText.setText(`Free Spins: ${this.freeSpins}`);
        }
        if (this.multiplierText) {
            this.multiplierText.setText(`Multiplier: x${this.cascadeMultiplier}`);
        }
    }

    update() {
        // Game loop updates
    }
}
