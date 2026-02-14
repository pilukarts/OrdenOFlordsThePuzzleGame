/**
 * GemFactory.ts
 * Factory for creating different types of gems with visual effects
 */

import Phaser from 'phaser';
import { GAME_CONFIG, MASCOT_CONFIG, LORD_CONFIG } from '../config/GameConfig';

export type GemType = 'mascot_red' | 'mascot_green' | 'mascot_blue' | 'mascot_yellow' |
                      'lord_ignis' | 'lord_ventus' | 'lord_aqua' | 'lord_terra' |
                      'black_gem' | 'bomb_small' | 'bomb_medium' | 'bomb_large' | 
                      'bomb_line' | 'bomb_color';

export interface GemData {
    type: GemType;
    col: number;
    row: number;
    color?: string;
}

/**
 * Create a mascot gem with glass marble effects
 */
export function createMascotGem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: 'red' | 'green' | 'blue' | 'yellow'
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const config = MASCOT_CONFIG[color];
    const radius = GAME_CONFIG.gemRadius;
    
    // Shadow
    const shadow = scene.add.ellipse(2, 3, radius * 2, radius * 1.5, 0x000000, 0.4);
    
    // Main gem circle (glass effect)
    const gemCircle = scene.add.graphics();
    gemCircle.fillGradientStyle(
        config.color, config.color, 
        Phaser.Display.Color.IntegerToColor(config.color).darken(30).color,
        Phaser.Display.Color.IntegerToColor(config.color).darken(30).color,
        1
    );
    gemCircle.fillCircle(0, 0, radius);
    
    // Rim/border
    gemCircle.lineStyle(2, 0xFFFFFF, 0.3);
    gemCircle.strokeCircle(0, 0, radius);
    
    // Inner glow
    const glow = scene.add.graphics();
    glow.fillStyle(0xFFFFFF, 0.2);
    glow.fillCircle(0, 0, radius * 0.85);
    
    // Highlight (top-left)
    const highlight = scene.add.graphics();
    highlight.fillStyle(0xFFFFFF, 0.6);
    highlight.fillCircle(-radius * 0.3, -radius * 0.3, radius * 0.3);
    highlight.setBlendMode(Phaser.BlendModes.ADD);
    
    // Mascot image
    const mascot = scene.add.image(0, 0, config.assetKey);
    mascot.setDisplaySize(radius * 1.4, radius * 1.4);
    
    // Sparkle
    const sparkle = scene.add.graphics();
    sparkle.lineStyle(2, 0xFFFFFF, 0.8);
    sparkle.lineBetween(-radius * 0.5, 0, radius * 0.5, 0);
    sparkle.lineBetween(0, -radius * 0.5, 0, radius * 0.5);
    sparkle.setAlpha(0);
    
    container.add([shadow, gemCircle, glow, highlight, mascot, sparkle]);
    container.setSize(radius * 2, radius * 2);
    container.setData('gemType', `mascot_${color}`);
    container.setData('color', color);
    container.setData('sparkle', sparkle);
    
    // Float animation
    scene.tweens.add({
        targets: container,
        y: y + GAME_CONFIG.animations.gemFloat.yOffset,
        duration: GAME_CONFIG.animations.gemFloat.duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Sparkle animation
    scene.tweens.add({
        targets: sparkle,
        alpha: { from: 0, to: 1 },
        angle: 180,
        duration: GAME_CONFIG.animations.sparkle.duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    return container;
}

/**
 * Create a Lord gem with face portrait and special effects
 */
export function createLordGem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    lordType: 'ignis' | 'ventus' | 'aqua' | 'terra'
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const config = LORD_CONFIG[lordType];
    const radius = GAME_CONFIG.lordGemRadius;
    
    // Shadow
    const shadow = scene.add.ellipse(3, 4, radius * 2.2, radius * 1.8, 0x000000, 0.5);
    
    // Main gem circle with gradient
    const gemCircle = scene.add.graphics();
    gemCircle.fillGradientStyle(
        config.glowColor, config.glowColor,
        config.baseColor, config.baseColor,
        1
    );
    gemCircle.fillCircle(0, 0, radius);
    
    // Rim (golden border for Lord)
    gemCircle.lineStyle(3, config.rimColor, 0.9);
    gemCircle.strokeCircle(0, 0, radius);
    
    // Outer glow
    const outerGlow = scene.add.graphics();
    outerGlow.fillStyle(config.glowColor, 0.3);
    outerGlow.fillCircle(0, 0, radius * 1.2);
    outerGlow.setBlendMode(Phaser.BlendModes.ADD);
    
    // Lord face portrait
    const face = scene.add.image(0, 0, config.assetKey);
    face.setDisplaySize(radius * 1.6, radius * 1.6);
    face.setMask(new Phaser.Display.Masks.GeometryMask(scene, gemCircle));
    
    // Crown icon (small)
    const crown = scene.add.text(0, -radius * 0.7, '👑', {
        fontSize: `${radius * 0.6}px`
    }).setOrigin(0.5);
    
    // Magic sparkles
    const magicParticles = scene.add.particles(0, 0, 'particle', {
        speed: { min: 10, max: 30 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1000,
        frequency: 200,
        tint: config.glowColor
    });
    
    container.add([shadow, outerGlow, gemCircle, face, crown, magicParticles]);
    container.setSize(radius * 2, radius * 2);
    container.setData('gemType', `lord_${lordType}`);
    container.setData('lordType', lordType);
    container.setData('color', config.matchColor);
    
    // Float animation (more dramatic for Lords)
    scene.tweens.add({
        targets: container,
        y: y + GAME_CONFIG.animations.lordFloat.yOffset,
        duration: GAME_CONFIG.animations.lordFloat.duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Rotate animation
    scene.tweens.add({
        targets: container,
        angle: GAME_CONFIG.animations.lordRotate.angle,
        duration: GAME_CONFIG.animations.lordRotate.duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Glow pulse
    scene.tweens.add({
        targets: outerGlow,
        alpha: { from: 0.3, to: 0.6 },
        duration: GAME_CONFIG.animations.glowPulse.duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    return container;
}

/**
 * Create a black penalty gem
 */
export function createBlackGem(
    scene: Phaser.Scene,
    x: number,
    y: number
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const radius = GAME_CONFIG.gemRadius;
    
    // Shadow
    const shadow = scene.add.ellipse(2, 3, radius * 2, radius * 1.5, 0x000000, 0.6);
    
    // Main black circle
    const gemCircle = scene.add.graphics();
    gemCircle.fillStyle(GAME_CONFIG.colors.black, 1);
    gemCircle.fillCircle(0, 0, radius);
    
    // Purple aura
    const aura = scene.add.graphics();
    aura.fillStyle(GAME_CONFIG.colors.blackAura, 0.4);
    aura.fillCircle(0, 0, radius * 1.1);
    aura.setBlendMode(Phaser.BlendModes.ADD);
    
    // Skull or danger symbol
    const symbol = scene.add.text(0, 0, '💀', {
        fontSize: `${radius * 1.2}px`
    }).setOrigin(0.5);
    
    container.add([shadow, aura, gemCircle, symbol]);
    container.setSize(radius * 2, radius * 2);
    container.setData('gemType', 'black_gem');
    container.setData('color', 'black');
    
    // Ominous pulse
    scene.tweens.add({
        targets: aura,
        alpha: { from: 0.4, to: 0.7 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    return container;
}

/**
 * Create a bomb gem
 */
export function createBombGem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bombType: 'small' | 'medium' | 'large' | 'line' | 'color'
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const radius = GAME_CONFIG.gemRadius;
    
    const bombConfig = {
        small: { color: 0xFF6B6B, emoji: '💣', size: 0.8 },
        medium: { color: 0xFF4444, emoji: '💥', size: 1.0 },
        large: { color: 0xFF0000, emoji: '🧨', size: 1.2 },
        line: { color: 0xFFAA00, emoji: '⚡', size: 1.1 },
        color: { color: 0xFF00FF, emoji: '🌈', size: 1.3 }
    };
    
    const config = bombConfig[bombType];
    
    // Shadow
    const shadow = scene.add.ellipse(2, 3, radius * 2, radius * 1.5, 0x000000, 0.5);
    
    // Main bomb circle
    const gemCircle = scene.add.graphics();
    gemCircle.fillStyle(config.color, 1);
    gemCircle.fillCircle(0, 0, radius * config.size);
    
    // Danger stripes
    gemCircle.lineStyle(2, 0xFFFF00, 0.8);
    gemCircle.strokeCircle(0, 0, radius * config.size);
    
    // Emoji
    const emoji = scene.add.text(0, 0, config.emoji, {
        fontSize: `${radius * config.size * 1.2}px`
    }).setOrigin(0.5);
    
    container.add([shadow, gemCircle, emoji]);
    container.setSize(radius * 2, radius * 2);
    container.setData('gemType', `bomb_${bombType}`);
    container.setData('bombType', bombType);
    
    // Ticking animation
    scene.tweens.add({
        targets: container,
        scale: { from: 1, to: 1.1 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    return container;
}

/**
 * Randomly select a gem type to spawn based on rates
 */
export function getRandomGemType(lordsEnabled: string[]): GemType {
    const rand = Math.random();
    let cumulative = 0;
    
    // Check black gem first
    if (rand < GAME_CONFIG.blackGemRate) {
        return 'black_gem';
    }
    cumulative += GAME_CONFIG.blackGemRate;
    
    // Check bombs
    for (const [bombType, rate] of Object.entries(GAME_CONFIG.bombRates)) {
        cumulative += rate;
        if (rand < cumulative) {
            return `bomb_${bombType}` as GemType;
        }
    }
    
    // Check lords (if enabled for this round)
    for (const lordType of lordsEnabled) {
        if (rand < cumulative + GAME_CONFIG.lordSpawnChanceIfEnabled) {
            return `lord_${lordType}` as GemType;
        }
        cumulative += GAME_CONFIG.lordSpawnChanceIfEnabled;
    }
    
    // Default to mascots
    const mascotRand = Math.random();
    cumulative = 0;
    for (const [color, rate] of Object.entries(GAME_CONFIG.mascotRates)) {
        cumulative += rate;
        if (mascotRand < cumulative) {
            return `mascot_${color}` as GemType;
        }
    }
    
    return 'mascot_red'; // Fallback
}
