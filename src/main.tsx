import Phaser from 'phaser';
import IntroScene from './scenes/IntroScene';
import BonusScene from './scenes/BonusScene';
import { GameScene } from './scenes/GameScene';

// A stable logical stage keeps the tower and all six channels inside the
// camera. Phaser scales this complete 16:9 world to each physical screen.
const width = 1280;
const height = 720;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: 'game',
    backgroundColor: 'transparent',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width,
        height,
        expandParent: true
    },
    scene: [IntroScene, BonusScene, GameScene],
};

const game = new Phaser.Game(config);

// iOS changes the usable height while Safari's bars appear and disappear.
// Refreshing the scale preserves the logical coordinates without rebuilding
// the scene or moving gems into invalid cells.
window.addEventListener('resize', () => game.scale.refresh());
window.addEventListener('orientationchange', () => window.setTimeout(() => game.scale.refresh(), 180));
