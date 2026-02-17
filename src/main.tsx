import Phaser from 'phaser';
import IntroScene from './scenes/IntroScene';
import BonusScene from './scenes/BonusScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    parent: 'game',
    backgroundColor: 'transparent',
    scene: [IntroScene, BonusScene, GameScene],
};

new Phaser.Game(config);