import Phaser from 'phaser';

export class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Fondo oscuro
        this.add.rectangle(0, 0, width, height, 0x0A0A1A).setOrigin(0);
        
        // Estrellas animadas
        this.createStarfield();
        
        // Logo ⚔️
        const logo = this.add.text(width / 2, height / 2 - 200, '⚔️', {
            fontSize: '120px'
        });
        logo.setOrigin(0.5);
        logo.setScale(0);
        logo.setAlpha(0);
        
        this.tweens.add({
            targets: logo,
            scale: 1.2,
            alpha: 1,
            duration: 1500,
            ease: 'Back.easeOut'
        });
        
        // "ORDEN OF LORDS"
        const title = this.add.text(width / 2, height / 2 - 50, 'ORDEN OF LORDS', {
            fontSize: '72px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 10
        });
        title.setOrigin(0.5);
        title.setAlpha(0);
        
        this.tweens.add({
            targets: title,
            alpha: 1,
            y: height / 2 - 80,
            duration: 800,
            delay: 1000,
            ease: 'Power2'
        });
        
        // "IGNIS THE BRAVE"
        const subtitle = this.add.text(width / 2, height / 2 + 20, 'IGNIS THE BRAVE', {
            fontSize: '48px',
            color: '#FF4500',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        });
        subtitle.setOrigin(0.5);
        subtitle.setAlpha(0);
        
        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            duration: 800,
            delay: 1500,
            ease: 'Power2'
        });
        
        // Badge "SEASON 1"
        const seasonBadge = this.add.text(width / 2, 100, 'SEASON 1', {
            fontSize: '24px',
            color: '#FFD700',
            fontStyle: 'bold',
            backgroundColor: '#FF4500',
            padding: { x: 20, y: 10 }
        });
        seasonBadge.setOrigin(0.5);
        seasonBadge.setAlpha(0);
        
        this.tweens.add({
            targets: seasonBadge,
            alpha: 1,
            duration: 500,
            delay: 2000
        });
        
        // "CLICK TO START"
        const startText = this.add.text(width / 2, height - 100, 'CLICK TO START', {
            fontSize: '36px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        startText.setOrigin(0.5);
        startText.setAlpha(0);
        
        this.tweens.add({
            targets: startText,
            alpha: { from: 0, to: 1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            delay: 3000
        });
        
        // Click para saltar
        this.input.on('pointerdown', () => this.skipToGame());
        
        // Auto-skip después de 5 segundos
        this.time.delayedCall(5000, () => this.skipToGame());
    }
    
    createStarfield() {
        const { width, height } = this.cameras.main;
        
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3;
            
            const star = this.add.circle(x, y, size, 0xFFFFFF, Math.random());
            
            this.tweens.add({
                targets: star,
                alpha: { from: 0.3, to: 1 },
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    skipToGame() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
}