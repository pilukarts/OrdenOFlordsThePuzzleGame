import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    // Grid configuration
    private cols = 6;
    private rows = 4;
    private cellSize = 64;
    private boardX = 420;
    private boardY = 120;
    private grid: (string | null)[][] = [];

    // Economy
    private balance = 100;
    private bet = 1.0;
    private betValues = [0.20, 0.40, 1.00, 2.00, 3.00, 4.00, 5.00, 10.00];
    private freeSpins = 0;
    private cascadeMultiplier = 1;

    // UI elements
    private balanceText?: Phaser.GameObjects.Text;
    private betText?: Phaser.GameObjects.Text;
    private freeSpinText?: Phaser.GameObjects.Text;
    private multText?: Phaser.GameObjects.Text;
    private betModal?: Phaser.GameObjects.Container;
    private spinBtn?: Phaser.GameObjects.Text;
    private changeBetBtn?: Phaser.GameObjects.Text;

    // Symbols
    private symbols = ['macota1', 'mascota2', 'mascota3', 'mascota4'];

    // Game state
    private isAnimating = false;
    private tileGroup?: Phaser.GameObjects.Group;
    private boardContainer?: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load background and frame
        this.load.image('background', '/assets/fantasy landscape co.png');
        this.load.image('frame', '/assets/ruin_columns.png');
        
        // Load mascot symbols
        this.load.image('macota1', '/assets/macota1.png');
        this.load.image('mascota2', '/assets/mascota2.png');
        this.load.image('mascota3', '/assets/mascota3.png');
        this.load.image('mascota4', '/assets/mascota4.png');
    }

    create() {
        // 1. Add full background
        const bg = this.add.image(0, 0, 'background');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // 2. Add frame (ruin columns)
        const frame = this.add.image(this.boardX, this.boardY, 'frame');
        frame.setOrigin(0.5, 0);
        frame.setDisplaySize(420, 400);

        // 3. Create golden circle textures for symbols
        this.createSymbolTextures();

        // 4. Create board container
        this.createGridVisual();

        // 5. Create UI
        this.createUI();
        this.createBetModal();

        // 6. Initialize grid
        this.resetGrid();
    }

    createSymbolTextures() {
        // Create golden circle textures for each mascot
        for (const symbolKey of this.symbols) {
            const rt = this.make.renderTexture({ width: 64, height: 64 }, false);
            
            // Draw golden circle with glow
            const graphics = this.make.graphics({}, false);
            
            // Outer glow
            graphics.fillStyle(0xFFA500, 0.3);
            graphics.fillCircle(32, 32, 34);
            
            // Main golden border
            graphics.lineStyle(4, 0xFFD700, 1);
            graphics.strokeCircle(32, 32, 30);
            
            // Inner circle background (semi-transparent dark)
            graphics.fillStyle(0x000000, 0.4);
            graphics.fillCircle(32, 32, 28);
            
            rt.draw(graphics);
            
            // Add mascot image
            const mascot = this.make.image({ key: symbolKey }, false);
            mascot.setDisplaySize(48, 48);
            rt.draw(mascot, 32, 32);
            
            // Save as texture
            rt.saveTexture(`symbol_${symbolKey}`);
            
            graphics.destroy();
        }
    }

    createGridVisual() {
        // Create container for board
        if (this.boardContainer) this.boardContainer.destroy();
        this.boardContainer = this.add.container(this.boardX, this.boardY);
    }

    createUI() {
        // Left panel UI
        const panelX = 30;
        
        this.balanceText = this.add.text(panelX, 60, `Balance: £${this.balance.toFixed(2)}`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        });

        this.betText = this.add.text(panelX, 95, `Bet: £${this.bet.toFixed(2)}`, {
            fontSize: '18px',
            color: '#FFFFFF'
        });

        this.freeSpinText = this.add.text(panelX, 130, `Free Spins: ${this.freeSpins}`, {
            fontSize: '18px',
            color: '#7fe0ff'
        });

        this.multText = this.add.text(panelX, 165, `Multiplier: x${this.cascadeMultiplier}`, {
            fontSize: '18px',
            color: '#ffef7a'
        });

        // Change Bet Button
        this.changeBetBtn = this.add.text(panelX, 210, '[⚙️ CHANGE BET]', {
            fontSize: '16px',
            color: '#FFD700',
            backgroundColor: '#2d2d44',
            padding: { x: 12, y: 8 }
        });
        this.changeBetBtn.setInteractive();
        this.changeBetBtn.on('pointerdown', () => this.showBetModal());
        this.changeBetBtn.on('pointerover', () => this.changeBetBtn?.setScale(1.05));
        this.changeBetBtn.on('pointerout', () => this.changeBetBtn?.setScale(1));

        // Spin Button
        this.spinBtn = this.add.text(panelX, 270, '   SPIN   ', {
            fontSize: '24px',
            color: '#000000',
            backgroundColor: '#FFD700',
            padding: { x: 20, y: 12 },
            fontStyle: 'bold'
        });
        this.spinBtn.setInteractive();
        this.spinBtn.on('pointerdown', () => this.onSpin());
        this.spinBtn.on('pointerover', () => this.spinBtn?.setScale(1.05));
        this.spinBtn.on('pointerout', () => this.spinBtn?.setScale(1));
    }

    createBetModal() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.betModal = this.add.container(centerX, centerY);
        this.betModal.setDepth(1000);
        this.betModal.setVisible(false);

        // Dark overlay
        const overlay = this.add.rectangle(0, 0, 900, 650, 0x000000, 0.8);
        overlay.setOrigin(0.5);

        // Modal panel
        const panel = this.add.rectangle(0, 0, 400, 550, 0x1a1a2e);
        panel.setStrokeStyle(3, 0xFFD700);

        // Title
        const title = this.add.text(0, -240, 'SELECT YOUR BET', {
            fontSize: '26px',
            color: '#FFD700',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        this.betModal.add([overlay, panel, title]);

        // Grid of bet buttons (2 columns x 4 rows)
        let y = -160;
        let col = 0;
        const selectedBet = { value: this.bet };

        for (const betValue of this.betValues) {
            const x = col === 0 ? -80 : 80;

            const btn = this.add.rectangle(x, y, 140, 60, 0x2d2d44);
            btn.setStrokeStyle(2, 0xFFD700);
            btn.setInteractive();

            const text = this.add.text(x, y, `£${betValue.toFixed(2)}`, {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            text.setOrigin(0.5);

            btn.on('pointerdown', () => {
                selectedBet.value = betValue;
                // Highlight selected button
                this.betModal?.list.forEach((item) => {
                    if (item instanceof Phaser.GameObjects.Rectangle && item !== panel && item !== overlay) {
                        item.setFillStyle(0x2d2d44);
                    }
                });
                btn.setFillStyle(0x4d4d64);
            });

            btn.on('pointerover', () => btn.setFillStyle(0x3d3d54));
            btn.on('pointerout', () => {
                if (selectedBet.value !== betValue) {
                    btn.setFillStyle(0x2d2d44);
                }
            });

            this.betModal.add([btn, text]);

            col++;
            if (col > 1) {
                col = 0;
                y += 80;
            }
        }

        // Confirm button
        const confirmBtn = this.add.rectangle(-80, 210, 130, 50, 0x4CAF50);
        confirmBtn.setStrokeStyle(2, 0xFFD700);
        confirmBtn.setInteractive();
        const confirmText = this.add.text(-80, 210, 'CONFIRM', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        confirmText.setOrigin(0.5);

        confirmBtn.on('pointerdown', () => {
            this.bet = selectedBet.value;
            this.betText?.setText(`Bet: £${this.bet.toFixed(2)}`);
            this.betModal?.setVisible(false);
        });
        confirmBtn.on('pointerover', () => confirmBtn.setFillStyle(0x5CBF60));
        confirmBtn.on('pointerout', () => confirmBtn.setFillStyle(0x4CAF50));

        // Cancel button
        const cancelBtn = this.add.rectangle(80, 210, 130, 50, 0xF44336);
        cancelBtn.setStrokeStyle(2, 0xFFD700);
        cancelBtn.setInteractive();
        const cancelText = this.add.text(80, 210, 'CANCEL', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        cancelText.setOrigin(0.5);

        cancelBtn.on('pointerdown', () => {
            this.betModal?.setVisible(false);
        });
        cancelBtn.on('pointerover', () => cancelBtn.setFillStyle(0xFF5346));
        cancelBtn.on('pointerout', () => cancelBtn.setFillStyle(0xF44336));

        this.betModal.add([confirmBtn, confirmText, cancelBtn, cancelText]);
    }

    showBetModal() {
        if (!this.isAnimating) {
            this.betModal?.setVisible(true);
        }
    }

    resetGrid() {
        // Initialize grid with random symbols
        this.grid = [];
        for (let c = 0; c < this.cols; c++) {
            this.grid[c] = [];
            for (let r = 0; r < this.rows; r++) {
                this.grid[c][r] = this.randomSymbolNoMatchAt(c, r);
            }
        }
        this.renderGrid();
        this.updateUI();
    }

    randomSymbolNoMatchAt(col: number, row: number): string {
        const pool = this.symbols;
        let attempts = 0;
        while (attempts < 20) {
            const key = Phaser.Utils.Array.GetRandom(pool);
            this.grid[col] = this.grid[col] || [];
            this.grid[col][row] = key;
            if (!this.createsInitialMatch(col, row)) return key;
            attempts++;
        }
        return Phaser.Utils.Array.GetRandom(pool);
    }

    createsInitialMatch(col: number, row: number): boolean {
        const key = this.grid[col][row];
        // Check horizontal left two
        if (col >= 2) {
            if (this.grid[col - 1] && this.grid[col - 2] &&
                this.grid[col - 1][row] === key && this.grid[col - 2][row] === key) {
                return true;
            }
        }
        // Check vertical up two
        if (row >= 2) {
            if (this.grid[col][row - 1] === key && this.grid[col][row - 2] === key) {
                return true;
            }
        }
        return false;
    }

    renderGrid() {
        // Remove previous visuals
        if (this.tileGroup) this.tileGroup.clear(true, true);
        this.tileGroup = this.add.group();

        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                const key = this.grid[c][r];
                if (key) {
                    const x = c * this.cellSize + this.cellSize / 2;
                    const y = r * this.cellSize + this.cellSize / 2;
                    const img = this.add.image(
                        this.boardX + x - (this.cols * this.cellSize) / 2 + 10,
                        this.boardY + y + 10,
                        `symbol_${key}`
                    );
                    img.setDisplaySize(this.cellSize - 4, this.cellSize - 4);
                    img.setData('col', c);
                    img.setData('row', r);
                    img.setData('key', key);
                    this.tileGroup.add(img);
                }
            }
        }
    }

    updateUI() {
        this.balanceText?.setText(`Balance: £${this.balance.toFixed(2)}`);
        this.betText?.setText(`Bet: £${this.bet.toFixed(2)}`);
        this.multText?.setText(`Multiplier: x${this.cascadeMultiplier}`);
        this.freeSpinText?.setText(`Free Spins: ${this.freeSpins}`);
    }

    onSpin() {
        if (this.isAnimating) return;

        // Check for free spins or balance
        if (this.freeSpins > 0) {
            this.freeSpins--;
        } else {
            if (this.balance < this.bet) {
                // Flash balance text
                this.tweens.add({
                    targets: this.balanceText,
                    alpha: 0.3,
                    duration: 150,
                    yoyo: true,
                    repeat: 2
                });
                return;
            }
            this.balance -= this.bet;
        }

        this.cascadeMultiplier = 1;
        this.updateUI();

        this.isAnimating = true;
        this.animateSpin()
            .then(() => this.resolveCascades())
            .then(() => {
                this.isAnimating = false;
                this.updateUI();
            });
    }

    animateSpin(): Promise<void> {
        return new Promise((resolve) => {
            // Fill grid with random symbols
            for (let c = 0; c < this.cols; c++) {
                for (let r = 0; r < this.rows; r++) {
                    this.grid[c][r] = Phaser.Utils.Array.GetRandom(this.symbols);
                }
            }

            // Clear existing tiles
            if (this.tileGroup) this.tileGroup.clear(true, true);
            this.tileGroup = this.add.group();

            const promises: Promise<void>[] = [];

            for (let c = 0; c < this.cols; c++) {
                for (let r = 0; r < this.rows; r++) {
                    const key = this.grid[c][r];
                    if (key) {
                        const x = c * this.cellSize + this.cellSize / 2;
                        const targetY = r * this.cellSize + this.cellSize / 2;
                        const startY = -100 - Phaser.Math.Between(0, 200) + (c * 10);
                        
                        const img = this.add.image(
                            this.boardX + x - (this.cols * this.cellSize) / 2 + 10,
                            this.boardY + startY,
                            `symbol_${key}`
                        );
                        img.setDisplaySize(this.cellSize - 4, this.cellSize - 4);
                        this.tileGroup.add(img);

                        const p = new Promise<void>((res) => {
                            this.tweens.add({
                                targets: img,
                                y: this.boardY + targetY + 10,
                                duration: 400 + r * 60 + Phaser.Math.Between(0, 120),
                                ease: 'Cubic.easeOut',
                                onComplete: () => {
                                    img.setData('col', c);
                                    img.setData('row', r);
                                    img.setData('key', key);
                                    res();
                                }
                            });
                        });
                        promises.push(p);
                    }
                }
            }

            Promise.all(promises).then(() => resolve());
        });
    }

    resolveCascades(): Promise<void> {
        return new Promise(async (resolve) => {
            let totalWin = 0;

            while (true) {
                const matches = this.findAllMatches();
                if (matches.length === 0) break;

                // Calculate payout
                for (const group of matches) {
                    const size = group.length;
                    const payoutBase = Math.max(1, size - 2) * this.bet;
                    totalWin += payoutBase * this.cascadeMultiplier;

                    // Remove matched symbols
                    for (const cell of group) {
                        this.grid[cell.col][cell.row] = null;
                    }
                }

                // Animate removal
                await this.animateRemovals(matches);

                // Apply gravity
                await this.applyGravity();

                // Refill
                await this.refillAndDrop();

                // Increase multiplier
                this.cascadeMultiplier++;
                this.multText?.setText(`Multiplier: x${this.cascadeMultiplier}`);
            }

            // Apply winnings
            if (totalWin > 0) {
                this.balance += totalWin;
                const winText = this.add.text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY,
                    `WIN: £${totalWin.toFixed(2)}`,
                    {
                        fontSize: '32px',
                        color: '#FFD700',
                        backgroundColor: '#000000',
                        padding: { x: 20, y: 10 },
                        fontStyle: 'bold'
                    }
                );
                winText.setOrigin(0.5);
                winText.setDepth(2000);

                this.tweens.add({
                    targets: winText,
                    scale: 1.2,
                    alpha: 0,
                    duration: 1500,
                    ease: 'Power2',
                    onComplete: () => winText.destroy()
                });
            }

            this.time.delayedCall(500, () => resolve());
        });
    }

    findAllMatches(): Array<Array<{ col: number; row: number; key: string }>> {
        const visited: { [key: string]: boolean } = {};
        const groups: Array<Array<{ col: number; row: number; key: string }>> = [];

        const keyAt = (c: number, r: number) => 
            this.grid[c] && this.grid[c][r] ? this.grid[c][r] : null;

        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                const key = keyAt(c, r);
                if (!key) continue;
                
                const id = `${c},${r}`;
                if (visited[id]) continue;

                // BFS flood fill
                const queue: Array<[number, number]> = [[c, r]];
                visited[id] = true;
                const group: Array<{ col: number; row: number; key: string }> = [];

                while (queue.length > 0) {
                    const [x, y] = queue.shift()!;
                    const k = keyAt(x, y);
                    if (k) group.push({ col: x, row: y, key: k });

                    const neighbors: Array<[number, number]> = [
                        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
                    ];

                    for (const [nx, ny] of neighbors) {
                        if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) continue;
                        const nid = `${nx},${ny}`;
                        if (visited[nid]) continue;
                        const nk = keyAt(nx, ny);
                        if (!nk || nk !== k) continue;

                        visited[nid] = true;
                        queue.push([nx, ny]);
                    }
                }

                if (group.length >= 3) {
                    groups.push(group);
                }
            }
        }

        return groups;
    }

    animateRemovals(matches: Array<Array<{ col: number; row: number; key: string }>>): Promise<void> {
        return new Promise((resolve) => {
            const toRemove: Array<{ col: number; row: number }> = [];
            for (const g of matches) {
                for (const cell of g) toRemove.push(cell);
            }

            const tweens: Promise<void>[] = [];
            for (const cell of toRemove) {
                const found = this.tileGroup?.getChildren().find(
                    (t: any) => t.getData('col') === cell.col && t.getData('row') === cell.row
                ) as Phaser.GameObjects.Image | undefined;

                if (found) {
                    tweens.push(new Promise<void>((res) => {
                        this.tweens.add({
                            targets: found,
                            alpha: 0,
                            scale: 0.2,
                            duration: 250,
                            ease: 'Back.easeIn',
                            onComplete: () => {
                                found.destroy();
                                res();
                            }
                        });
                    }));
                }
            }

            Promise.all(tweens).then(() => {
                this.time.delayedCall(80, () => resolve());
            });
        });
    }

    applyGravity(): Promise<void> {
        return new Promise((resolve) => {
            for (let c = 0; c < this.cols; c++) {
                let writeRow = this.rows - 1;
                for (let r = this.rows - 1; r >= 0; r--) {
                    if (this.grid[c][r] != null) {
                        if (writeRow !== r) {
                            this.grid[c][writeRow] = this.grid[c][r];
                            this.grid[c][r] = null;
                        }
                        writeRow--;
                    }
                }
                for (let r = writeRow; r >= 0; r--) {
                    this.grid[c][r] = null;
                }
            }
            resolve();
        });
    }

    refillAndDrop(): Promise<void> {
        return new Promise((resolve) => {
            const tweens: Promise<void>[] = [];

            for (let c = 0; c < this.cols; c++) {
                let emptyCount = 0;
                for (let r = 0; r < this.rows; r++) {
                    if (this.grid[c][r] === null) {
                        emptyCount++;
                        const key = Phaser.Utils.Array.GetRandom(this.symbols);
                        this.grid[c][r] = key;

                        const x = c * this.cellSize + this.cellSize / 2;
                        const targetY = r * this.cellSize + this.cellSize / 2;
                        const startY = -emptyCount * this.cellSize - 50;

                        const img = this.add.image(
                            this.boardX + x - (this.cols * this.cellSize) / 2 + 10,
                            this.boardY + startY,
                            `symbol_${key}`
                        );
                        img.setDisplaySize(this.cellSize - 4, this.cellSize - 4);
                        this.tileGroup?.add(img);

                        const p = new Promise<void>((res) => {
                            this.tweens.add({
                                targets: img,
                                y: this.boardY + targetY + 10,
                                duration: 300 + r * 40,
                                ease: 'Bounce.easeOut',
                                onComplete: () => {
                                    img.setData('col', c);
                                    img.setData('row', r);
                                    img.setData('key', key);
                                    res();
                                }
                            });
                        });
                        tweens.push(p);
                    }
                }
            }

            Promise.all(tweens).then(() => {
                this.time.delayedCall(100, () => resolve());
            });
        });
    }

    update() {
        // Game loop updates
    }
}
