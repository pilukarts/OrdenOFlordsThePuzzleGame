// Import necessary modules and assets
import { Scene } from 'phaser';
import { GAME_VERSIONS } from '../config/gameConfig';

export default class IntroScene extends Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload() {
        // Load assets such as images and animations
        this.load.image('logo', 'path/to/logo.png');
        this.load.image('starfield', 'path/to/starfield.png');
        this.load.image('fireParticle', 'path/to/fireParticle.png');
    }

    create() {
        // Create starfield background
        this.add.image(400, 300, 'starfield');

        // Display logo
        const logo = this.add.image(400, 200, 'logo');
        logo.setOrigin(0.5, 0.5);

        // Add title text
        this.add.text(400, 50, 'ORDEN OF LORDS', { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5);

        // Add subtitle text
        this.add.text(400, 100, 'IGNIS THE BRAVE', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);

        // Create a fire particle effect
        const fireParticles = this.add.particles('fireParticle');
        fireParticles.createEmitter({
            x: 400,
            y: 300,
            speed: { min: -100, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 1000,
            gravityY: 0,
            quantity: 2,
            frequency: 100,
        });

        // Season badge (example, adjust as necessary)
        this.add.text(15, 15, 'SEASON 1', { fontSize: '20px', fill: '#FF0000' });

        // Input handling
        this.input.on('pointerdown', this.startGame, this);

        // Auto-start after 5 seconds
        this.time.delayedCall(5000, this.startGame, [], this);
    }

    startGame() {
        this.scene.start('GameScene');
    }
}


// Configuration options based on GAME_VERSIONS
const gameVersion = GAME_VERSIONS.current;
console.log(`Current Game Version: ${gameVersion}`);