import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    parent: 'game',
    backgroundColor: 'transparent',
    scene: [GameScene],
};

new Phaser.Game(config);
