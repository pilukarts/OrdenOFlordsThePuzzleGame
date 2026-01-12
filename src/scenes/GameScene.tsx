
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Carga recursos aquí (imágenes, sonidos, etc.)
        this.load.image('logo', 'https://raw.githubusercontent.com/phaserjs/phaser-coding-tips/master/issue-001/public/assets/logo.png');
    }

    create() {
        // Añade objetos a la escena aquí
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'logo');
    }

    update() {
        // Lógica del juego que se ejecuta en cada frame
    }
}
