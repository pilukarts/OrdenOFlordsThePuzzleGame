import Phaser from 'phaser';

export class BonusScene extends Phaser.Scene {
    private bonusDrops: number = 0;
    
    constructor() {
        super({ key: 'BonusScene' });
    }
    
    init(data: { bonusDrops: number }) {
        this.bonusDrops = data.bonusDrops || 5;
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Fondo oscuro con overlay
        this.add.rectangle(0, 0, width, height, 0x000020, 0.95).setOrigin(0);
        
        // Ignis - Derecha (protagonista)
        this.createIgnisDisplay(width - 220, height / 2 - 50);
        
        // Otros 3 Lords - Izquierda
        this.createOtherLords(220, 250);
        
        // Texto "BONUS"
        const bonusText = this.add.text(width / 2, height / 2 - 80, 'BONUS', {
            fontSize: '120px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#FFD700',
            strokeThickness: 12
        });
        bonusText.setOrigin(0.5);
        bonusText.setScale(0);
        
        this.tweens.add({
            targets: bonusText,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 200
        });
        
        this.tweens.add({
            targets: bonusText,
            alpha: { from: 1, to: 0.8 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // "X Bonus Drops"
        const dropsText = this.add.text(width / 2, height / 2 + 50, `${this.bonusDrops} Bonus Drops`, {
            fontSize: '42px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#4169E1',
            strokeThickness: 6
        });
        dropsText.setOrigin(0.5);
        dropsText.setAlpha(0);
        
        this.tweens.add({
            targets: dropsText,
            alpha: 1,
            duration: 400,
            delay: 800
        });
        
        // Botón START
        const startButton = this.createStartButton();
        startButton.setPosition(width / 2, height / 2 + 150);
        startButton.setAlpha(0);
        
        this.tweens.add({
            targets: startButton,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 400,
            delay: 1200,
            ease: 'Back.easeOut'
        });
    }
    
    createIgnisDisplay(x: number, y: number) {
        const container = this.add.container(x, y);
        
        // Frame grande dorado
        const frame = this.add.circle(0, 0, 120, 0x000000, 0.9);
        frame.setStrokeStyle(10, 0xFFD700);
        container.add(frame);
        
        // Anillo exterior rotante
        const outerRing = this.add.circle(0, 0, 140, 0x000000, 0);
        outerRing.setStrokeStyle(6, 0xFF4500);
        container.add(outerRing);
        
        // Portrait
        const portrait = this.add.circle(0, 0, 100, 0xFF4500);
        container.add(portrait);
        
        // Aura de fuego
        const aura = this.add.circle(0, 0, 150, 0xFF4500, 0.4);
        aura.setBlendMode(Phaser.BlendModes.ADD);
        container.add(aura);
        
        // Badge "CURRENT SEASON"
        const badge = this.add.container(0, -170);
        const badgeBg = this.add.rectangle(0, 0, 140, 36, 0xFF4500);
        badgeBg.setStrokeStyle(3, 0xFFD700);
        const badgeText = this.add.text(0, 0, 'CURRENT\nSEASON', {
            fontSize: '14px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center'
        });
        badgeText.setOrigin(0.5);
        badge.add([badgeBg, badgeText]);
        container.add(badge);
        
        // Nombre
        const name = this.add.text(0, 160, 'IGNIS\nTHE BRAVE', {
            fontSize: '24px',
            color: '#FF4500',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        });
        name.setOrigin(0.5);
        container.add(name);
        
        // Animaciones
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scale: 1,
            alpha: 1,
            duration: 800,
            delay: 500,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: aura,
            scale: { from: 1, to: 1.4 },
            alpha: { from: 0.4, to: 0.1 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
        
        this.tweens.add({
            targets: outerRing,
            angle: 360,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });
    }
    
    createOtherLords(leftX: number, startY: number) {
        const otherLords = [
            { name: 'VENTUS', color: 0x00CED1, icon: '💨' },
            { name: 'AQUA', color: 0x4169E1, icon: '💧' },
            { name: 'TERRA', color: 0x8B4513, icon: '🌍' }
        ];
        
        const spacing = 150;
        
        otherLords.forEach((lord, index) => {
            const container = this.add.container(leftX, startY + (index * spacing));
            
            // Frame pequeño gris
            const frame = this.add.circle(0, 0, 50, 0x000000, 0.7);
            frame.setStrokeStyle(3, 0x888888);
            container.add(frame);
            
            // Portrait
            const portrait = this.add.circle(0, 0, 45, lord.color);
            container.add(portrait);
            
            // Aura sutil
            const aura = this.add.circle(0, 0, 60, lord.color, 0.15);
            aura.setBlendMode(Phaser.BlendModes.ADD);
            container.add(aura);
            
            // Icon
            const icon = this.add.text(-20, -20, lord.icon, {
                fontSize: '20px'
            });
            container.add(icon);
            
            // Nombre a la derecha
            const nameText = this.add.text(65, 0, lord.name, {
                fontSize: '16px',
                color: '#CCCCCC',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            });
            nameText.setOrigin(0, 0.5);
            container.add(nameText);
            
            // "Coming Soon"
            const comingSoon = this.add.text(65, 18, 'Coming Soon', {
                fontSize: '10px',
                color: '#888888',
                fontStyle: 'italic'
            });
            comingSoon.setOrigin(0, 0.5);
            container.add(comingSoon);
            
            // Animación de entrada
            container.setAlpha(0);
            container.setX(leftX - 50);
            
            this.tweens.add({
                targets: container,
                alpha: 0.7,
                x: leftX,
                duration: 500,
                delay: 1000 + (index * 150),
                ease: 'Back.easeOut'
            });
            
            this.tweens.add({
                targets: aura,
                scale: { from: 1, to: 1.2 },
                alpha: { from: 0.15, to: 0.05 },
                duration: 2500,
                yoyo: true,
                repeat: -1
            });
        });
    }
    
    createStartButton() {
        const button = this.add.container(0, 0);
        
        const bg = this.add.rectangle(0, 0, 240, 80, 0x1E3A5F);
        bg.setStrokeStyle(4, 0xFFD700);
        
        const text = this.add.text(0, 0, 'START', {
            fontSize: '56px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        text.setOrigin(0.5);
        
        button.add([bg, text]);
        
        button.setSize(240, 80);
        button.setInteractive(
            new Phaser.Geom.Rectangle(-120, -40, 240, 80),
            Phaser.Geom.Rectangle.Contains
        );
        
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 1.1,
                duration: 150
            });
        });
        
        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 150
            });
        });
        
        button.on('pointerdown', () => {
            this.startBonusGame();
        });
        
        this.tweens.add({
            targets: button,
            scale: { from: 1, to: 1.05 },
            duration: 600,
            yoyo: true,
            repeat: -1
        });
        
        return button;
    }
    
    startBonusGame() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene', { bonusDrops: this.bonusDrops });
        });
    }
}