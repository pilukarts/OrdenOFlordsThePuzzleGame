import { Scene } from 'phaser';
import { GAME_VERSIONS } from '../config/GameVersions';

export default class IntroScene extends Scene {
    private hasStarted = false;

    constructor() { super({ key: 'IntroScene' }); }

    preload() {
        this.load.image('logo', '/OrdenOFlordsThePuzzleGame/logo.png');
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#080d26');
        const logo = this.add.image(width / 2, height * 0.42, 'logo');
        logo.setOrigin(0.5).setScale(Math.min(0.7, width / logo.width * 0.72));
        this.add.text(width / 2, height * 0.13, 'ORDEN OF LORDS', { fontSize: '32px', color: '#ffffff', fontFamily: 'Georgia, serif' }).setOrigin(0.5);
        this.add.text(width / 2, height * 0.2, 'IGNIS THE BRAVE', { fontSize: '20px', color: '#ff6b35', fontFamily: 'Georgia, serif' }).setOrigin(0.5);
        this.add.text(18, 18, 'SEASON 1', { fontSize: '18px', color: '#ff3b30' });
        const startText = this.add.text(width / 2, height * 0.84, 'CLICK TO START', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
        this.tweens.add({ targets: startText, alpha: 0.35, duration: 800, yoyo: true, repeat: -1 });
        this.input.once('pointerdown', () => this.startGame());
        this.time.delayedCall(5000, () => this.startGame());
    }

    private startGame() {
        if (this.hasStarted) return;
        this.hasStarted = true;
        this.scene.start('GameScene', { gameVersion: GAME_VERSIONS.current });
    }
}
