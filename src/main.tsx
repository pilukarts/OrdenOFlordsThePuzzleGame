import Phaser from 'phaser';
import IntroScene from './scenes/IntroScene';
import BonusScene from './scenes/BonusScene';
import { GameScene } from './scenes/GameScene';

// Responsive configuration
const getGameSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Aspect ratio 16:9 is ideal
    const targetRatio = 16 / 9;
    const currentRatio = width / height;
    
    let gameWidth = width;
    let gameHeight = height;
    
    // Adjust to maintain aspect ratio
    if (currentRatio > targetRatio) {
        gameWidth = height * targetRatio;
    } else {
        gameHeight = width / targetRatio;
    }
    
    // Clamp to reasonable sizes
    gameWidth = Math.min(1920, Math.max(375, gameWidth));
    gameHeight = Math.min(1080, Math.max(667, gameHeight));
    
    return { width: gameWidth, height: gameHeight };
};

const { width, height } = getGameSize();

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: 'game',
    backgroundColor: 'transparent',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: width,
        height: height,
        min: {
            width: 375,
            height: 667
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    scene: [IntroScene, BonusScene, GameScene],
};

const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
    const { width, height } = getGameSize();
    game.scale.resize(width, height);
});
