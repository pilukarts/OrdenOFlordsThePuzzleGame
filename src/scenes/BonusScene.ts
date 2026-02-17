import { Scene } from 'phaser';
import { GAME_VERSIONS } from '../config';

export default class BonusScene extends Scene {
    constructor() {
        super({ key: 'BonusScene' });
    }

    preload() {
        // Load assets for Lords, buttons, and animations
        this.load.image('lordIgnis', 'path/to/lordIgnis.png');
        this.load.image('lordVentus', 'path/to/lordVentus.png');
        this.load.image('lordAqua', 'path/to/lordAqua.png');
        this.load.image('lordTerra', 'path/to/lordTerra.png');
        this.load.image('bonusBackground', 'path/to/bonusBackground.png');
        this.load.image('startButton', 'path/to/startButton.png');
        this.load.image('startButtonHover', 'path/to/startButtonHover.png');
    }

    create() {
        this.add.image(400, 300, 'bonusBackground'); // Background Image

        const lords = [
            { name: 'Ignis', image: 'lordIgnis', x: 600, y: 300, isLarge: true, badge: true, label: '' },
            { name: 'Ventus', image: 'lordVentus', x: 150, y: 200, isLarge: false, badge: false, label: 'Coming Soon' },
            { name: 'Aqua', image: 'lordAqua', x: 150, y: 300, isLarge: false, badge: false, label: 'Coming Soon' },
            { name: 'Terra', image: 'lordTerra', x: 150, y: 400, isLarge: false, badge: false, label: 'Coming Soon' }
        ];

        lords.forEach(lord => {
            const lordImage = this.add.image(lord.x, lord.y, lord.image).setOrigin(0.5);
            if (lord.isLarge) {
                lordImage.setScale(1.5);
                this.add.image(lord.x, lord.y - 75, 'goldFrame').setOrigin(0.5); // Golden Frame
                this.add.image(lord.x, lord.y - 150, 'currentSeasonBadge').setOrigin(0.5); // Current Season Badge
            } else {
                this.add.text(lord.x, lord.y + 50, lord.label, { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
            }
            // Add aura animation
            this.addAuras(lordImage);
        });

        this.add.text(400, 300, 'BONUS', { fontSize: '48px', color: '#FFD700'}).setOrigin(0.5);

        // Bonus drops counter
        this.bonusCounter = this.add.text(400, 400, 'Bonus Drops: 0', { fontSize: '24px', color: '#ffffff'}).setOrigin(0.5);

        // Start button
        const startButton = this.add.sprite(400, 500, 'startButton').setInteractive();
        startButton.on('pointerover', () => startButton.setTexture('startButtonHover'));
        startButton.on('pointerout', () => startButton.setTexture('startButton'));
        startButton.on('pointerdown', () => this.startGame());

        // Add aura animations
        this.addAuras(startButton);
    }

    addAuras(sprite) {
        // Add aura animation logic
        this.tweens.add({
            targets: sprite,
            alpha: { from: 0.8, to: 1 },
            ease: 'Power1',
            duration: 500,
            repeat: -1,
            yoyo: true
        });
    }

    startGame() {
        // Logic to start the game and transition to game scene
        this.scene.start('GameScene', { gameVersion: GAME_VERSIONS.CURRENT });
    }
}