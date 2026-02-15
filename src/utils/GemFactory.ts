/**
 * GemFactory.ts
 * Factory for creating different types of gems with visual effects
 * Now featuring hexagonal gem shapes with alchemical medieval aesthetics
 */

import Phaser from 'phaser';
import { GAME_CONFIG, LORD_CONFIG, MASCOT_CONFIG } from '../config/GameConfig';

/**
 * Helper function to create hexagon points for a given radius
 */
function getHexagonPoints(radius: number): Phaser.Geom.Point[] {
    const points: Phaser.Geom.Point[] = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
        points.push(new Phaser.Geom.Point(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        ));
    }
    return points;
}

/**
 * Color configuration for 3D gems
 */
const GEM_COLORS_3D = {
    red: {
        base: 0xFF4444,
        light: 0xFF8888,
        dark: 0xCC0000
    },
    green: {
        base: 0x44FF44,
        light: 0x88FF88,
        dark: 0x00CC00
    },
    blue: {
        base: 0x4444FF,
        light: 0x8888FF,
        dark: 0x0000CC
    },
    yellow: {
        base: 0xFFFF44,
        light: 0xFFFF88,
        dark: 0xCCCC00
    }
};

/**
 * Bomb configuration
 */
const BOMB_CONFIG = {
    small: { size: 0.85, fuseCount: 1, label: '3×3', color: 0x444444 },
    medium: { size: 1.0, fuseCount: 2, label: '5×5', color: 0x333333 },
    large: { size: 1.15, fuseCount: 3, label: '7×7', color: 0x222222 }
};

/**
 * Common text style for bold labels
 */
const BOLD_TEXT_STYLE = {
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2
} as const;

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
 * Create a mascot gem with realistic 3D hexagonal effects and alchemical runes
 */
export function createMascotGem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: 'red' | 'green' | 'blue' | 'yellow',
    skipAnimations: boolean = false
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const config = MASCOT_CONFIG[color];
    const colors3D = GEM_COLORS_3D[color];
    const radius = GAME_CONFIG.gemRadius;
    
    // Get hexagon points
    const hexPoints = getHexagonPoints(radius);
    
    // Layer 1: Projected shadow (below)
    const shadowHex = getHexagonPoints(radius * 1.1);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.beginPath();
    shadow.moveTo(shadowHex[0].x, shadowHex[0].y + 5);
    shadowHex.forEach(point => shadow.lineTo(point.x, point.y + 5));
    shadow.closePath();
    shadow.fillPath();
    
    // Layer 2: Base hexagon
    const base = scene.add.graphics();
    base.fillStyle(colors3D.base);
    base.beginPath();
    base.moveTo(hexPoints[0].x, hexPoints[0].y);
    hexPoints.forEach(point => base.lineTo(point.x, point.y));
    base.closePath();
    base.fillPath();
    
    // Layer 3: Radial gradient (light top, dark bottom) - using circle for gradient effect
    const gradient = scene.add.graphics();
    gradient.fillGradientStyle(
        colors3D.light, colors3D.light,
        colors3D.dark, colors3D.dark,
        1
    );
    // Create mask with hexagon shape
    gradient.beginPath();
    gradient.moveTo(hexPoints[0].x, hexPoints[0].y);
    hexPoints.forEach(point => gradient.lineTo(point.x, point.y));
    gradient.closePath();
    gradient.fillPath();
    
    // Layer 4: Inner shadow (bottom arc) - darkening bottom half
    const innerShadow = scene.add.graphics();
    innerShadow.fillStyle(0x000000, 0.2);
    innerShadow.beginPath();
    innerShadow.moveTo(hexPoints[3].x, hexPoints[3].y);
    innerShadow.lineTo(hexPoints[4].x, hexPoints[4].y);
    innerShadow.lineTo(hexPoints[5].x, hexPoints[5].y);
    innerShadow.lineTo(0, 0);
    innerShadow.closePath();
    innerShadow.fillPath();
    
    // Layer 5: Specular highlight (top-left)
    const highlight = scene.add.ellipse(-radius * 0.27, -radius * 0.27, radius * 0.5, radius * 0.33, 0xFFFFFF, 0.6);
    highlight.setBlendMode(Phaser.BlendModes.ADD);
    
    // Layer 6: Hexagon border with stone/carved look
    const border = scene.add.graphics();
    border.lineStyle(3, 0xFFD700, 0.7); // Golden border for medieval look
    border.beginPath();
    border.moveTo(hexPoints[0].x, hexPoints[0].y);
    hexPoints.forEach(point => border.lineTo(point.x, point.y));
    border.closePath();
    border.strokePath();
    
    // Layer 7: Mascot image (centered)
    const mascot = scene.add.image(0, 0, config.assetKey);
    mascot.setDisplaySize(radius * 1.2, radius * 1.2);
    
    // Alchemical rune overlay (simple cross pattern for medieval aesthetic)
    const rune = scene.add.graphics();
    rune.lineStyle(1, 0xFFD700, 0.3);
    const runeSize = radius * 0.15;
    rune.lineBetween(-runeSize, 0, runeSize, 0);
    rune.lineBetween(0, -runeSize, 0, runeSize);
    rune.setAlpha(0);
    
    container.add([shadow, base, gradient, innerShadow, highlight, border, mascot, rune]);
    container.setSize(radius * 2, radius * 2);
    container.setData('gemType', `mascot_${color}`);
    container.setData('color', color);
    container.setData('rune', rune);
    container.setData('highlight', highlight);
    
    // Only start animations if NOT skipped
    if (!skipAnimations) {
        // Float animation
        scene.tweens.add({
            targets: container,
            y: y + GAME_CONFIG.animations.gemFloat.yOffset,
            duration: GAME_CONFIG.animations.gemFloat.duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Subtle rotation
        scene.tweens.add({
            targets: container,
            angle: GAME_CONFIG.animations.gemRotate.angle,
            duration: GAME_CONFIG.animations.gemRotate.duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Pulsing highlight
        scene.tweens.add({
            targets: highlight,
            alpha: { from: 0.4, to: 0.8 },
            duration: GAME_CONFIG.animations.highlight.duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Rune glow animation
        scene.tweens.add({
            targets: rune,
            alpha: { from: 0, to: 0.6 },
            duration: GAME_CONFIG.animations.sparkle.duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    return container;
}

/**
 * Create a Lord gem with face portrait and special hexagonal effects
 */
export function createLordGem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    lordType: 'ignis' | 'ventus' | 'aqua' | 'terra',
    skipAnimations: boolean = false
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const config = LORD_CONFIG[lordType];
    const radius = GAME_CONFIG.lordGemRadius;
    
    // Get hexagon points for Lord gem
    const hexPoints = getHexagonPoints(radius);
    const shadowHex = getHexagonPoints(radius * 1.15);
    
    // Shadow (hexagonal)
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.beginPath();
    shadow.moveTo(shadowHex[0].x + 3, shadowHex[0].y + 4);
    shadowHex.forEach(point => shadow.lineTo(point.x + 3, point.y + 4));
    shadow.closePath();
    shadow.fillPath();
    
    // Main gem hexagon with gradient
    const gemCircle = scene.add.graphics();
    gemCircle.fillGradientStyle(
        config.glowColor, config.glowColor,
        config.baseColor, config.baseColor,
        1
    );
    gemCircle.beginPath();
    gemCircle.moveTo(hexPoints[0].x, hexPoints[0].y);
    hexPoints.forEach(point => gemCircle.lineTo(point.x, point.y));
    gemCircle.closePath();
    gemCircle.fillPath();
    
    // Rim (golden border for Lord with medieval look)
    gemCircle.lineStyle(4, config.rimColor, 0.95);
    gemCircle.beginPath();
    gemCircle.moveTo(hexPoints[0].x, hexPoints[0].y);
    hexPoints.forEach(point => gemCircle.lineTo(point.x, point.y));
    gemCircle.closePath();
    gemCircle.strokePath();
    
    // Outer glow (hexagonal)
    const glowHex = getHexagonPoints(radius * 1.25);
    const outerGlow = scene.add.graphics();
    outerGlow.fillStyle(config.glowColor, 0.4);
    outerGlow.beginPath();
    outerGlow.moveTo(glowHex[0].x, glowHex[0].y);
    glowHex.forEach(point => outerGlow.lineTo(point.x, point.y));
    outerGlow.closePath();
    outerGlow.fillPath();
    outerGlow.setBlendMode(Phaser.BlendModes.ADD);
    
    // Lord face portrait
    const face = scene.add.image(0, 0, config.assetKey);
    face.setDisplaySize(radius * 1.5, radius * 1.5);
    
    // Create hexagonal mask for face
    const maskShape = scene.make.graphics({ x: 0, y: 0 });
    maskShape.fillStyle(0xffffff);
    maskShape.beginPath();
    maskShape.moveTo(hexPoints[0].x, hexPoints[0].y);
    hexPoints.forEach(point => maskShape.lineTo(point.x, point.y));
    maskShape.closePath();
    maskShape.fillPath();
    const mask = maskShape.createGeometryMask();
    face.setMask(mask);
    
    // Crown icon (small) - medieval aesthetic
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
    
    // Only start animations if NOT skipped
    if (!skipAnimations) {
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
    }
    
    return container;
}

/**
 * Create a black penalty gem
 */
export function createBlackGem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    skipAnimations: boolean = false
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
    
    // Only start animations if NOT skipped
    if (!skipAnimations) {
        // Ominous pulse
        scene.tweens.add({
            targets: aura,
            alpha: { from: 0.4, to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    return container;
}

/**
 * Create a bomb gem with animated fuse and sparks
 */
export function createBombGem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bombType: 'small' | 'medium' | 'large' | 'line' | 'color',
    skipAnimations: boolean = false
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const radius = GAME_CONFIG.gemRadius;
    
    if (bombType === 'line') {
        // Lightning bolt style for line bomb
        const shadow = scene.add.ellipse(0, 5, radius * 1.8, radius * 0.5, 0x000000, 0.3);
        
        // Electric yellow body
        const body = scene.add.graphics();
        body.fillGradientStyle(0xFFFF00, 0xFFFF00, 0xFFAA00, 0xFFAA00, 1);
        body.fillEllipse(0, 0, radius * 1.5, radius * 1.2);
        
        // Lightning bolt symbol
        const bolt = scene.add.text(0, 0, '⚡', {
            fontSize: `${radius * 1.8}px`
        }).setOrigin(0.5);
        
        // Electric sparks
        const sparks = scene.add.particles(0, 0, 'particle', {
            speed: { min: 20, max: 40 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 300,
            frequency: 100,
            quantity: 1,
            tint: 0xFFFF00
        });
        
        container.add([shadow, body, bolt, sparks]);
        
        if (!skipAnimations) {
            // Electric pulse
            scene.tweens.add({
                targets: body,
                alpha: { from: 0.8, to: 1 },
                duration: 200,
                yoyo: true,
                repeat: -1
            });
        }
    } else if (bombType === 'color') {
        // Rainbow sphere for color bomb
        const shadow = scene.add.ellipse(0, 5, radius * 1.9, radius * 0.5, 0x000000, 0.3);
        
        // Multicolor sphere
        const sphere = scene.add.graphics();
        sphere.fillGradientStyle(0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 1);
        sphere.fillCircle(0, 0, radius * 1.1);
        
        // Rainbow symbol
        const rainbow = scene.add.text(0, 0, '🌈', {
            fontSize: `${radius * 1.6}px`
        }).setOrigin(0.5);
        
        // Multi-color particles
        const particles = scene.add.particles(0, 0, 'particle', {
            speed: { min: 15, max: 35 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 800,
            frequency: 150,
            quantity: 2,
            tint: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF]
        });
        
        container.add([shadow, sphere, rainbow, particles]);
        
        if (!skipAnimations) {
            // Rotate colors
            scene.tweens.add({
                targets: sphere,
                angle: 360,
                duration: 3000,
                repeat: -1,
                ease: 'Linear'
            });
        }
    } else {
        // Standard bombs (small, medium, large)
        const config = BOMB_CONFIG[bombType];
        
        // Shadow
        const shadow = scene.add.ellipse(0, 5, radius * 1.7 * config.size, radius * 0.5, 0x000000, 0.4);
        
        // Metallic sphere
        const body = scene.add.graphics();
        body.fillGradientStyle(0x666666, 0x666666, config.color, config.color, 1);
        body.fillCircle(0, 0, radius * config.size);
        
        // Metallic highlight
        const highlight = scene.add.ellipse(-radius * 0.3 * config.size, -radius * 0.3 * config.size, 
            radius * 0.4 * config.size, radius * 0.3 * config.size, 0xAAAAAA, 0.7);
        highlight.setBlendMode(Phaser.BlendModes.ADD);
        
        // Label
        const label = scene.add.text(0, 0, config.label, {
            fontSize: `${radius * 0.6 * config.size}px`,
            color: '#FFFFFF',
            ...BOLD_TEXT_STYLE
        }).setOrigin(0.5);
        
        container.add([shadow, body, highlight, label]);
        
        // Add fuses
        for (let i = 0; i < config.fuseCount; i++) {
            const angle = (i / config.fuseCount) * Math.PI * 2 - Math.PI / 2;
            const fuseX = Math.cos(angle) * radius * 0.3 * config.size;
            const fuseY = -radius * config.size - 5;
            
            // Fuse line
            const fuse = scene.add.line(fuseX, fuseY, 0, 0, 0, -10, 0xFF0000, 1);
            fuse.setLineWidth(2);
            container.add(fuse);
            
            // Fuse sparks
            const fuseSparks = scene.add.particles(fuseX, fuseY - 10, 'particle', {
                speed: { min: 10, max: 30 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.3, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 300,
                frequency: 100,
                quantity: 1,
                tint: [0xFF6600, 0xFF0000, 0xFFFF00]
            });
            container.add(fuseSparks);
            
            if (!skipAnimations) {
                // Animate fuse flickering
                scene.tweens.add({
                    targets: fuse,
                    alpha: { from: 1, to: 0.3 },
                    scaleY: { from: 1, to: 0.7 },
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    delay: i * 100
                });
            }
        }
        
        if (!skipAnimations) {
            // Slight rotation
            scene.tweens.add({
                targets: container,
                angle: { from: -2, to: 2 },
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    container.setSize(radius * 2, radius * 2);
    container.setData('gemType', `bomb_${bombType}`);
    container.setData('bombType', bombType);
    
    return container;
}

/**
 * Create a Wild (W) gem with golden effects
 */
export function createWildGem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    skipAnimations: boolean = false
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const radius = GAME_CONFIG.gemRadius;
    
    // Shadow
    const shadow = scene.add.ellipse(0, 5, radius * 1.8, radius * 0.5, 0x000000, 0.4);
    
    // Golden gradient sphere
    const sphere = scene.add.graphics();
    sphere.fillGradientStyle(
        0xFFD700, 0xFFD700,  // Gold top
        0xFFA500, 0xFFA500,  // Orange bottom
        1
    );
    sphere.fillCircle(0, 0, radius * 1.1);
    
    // Golden rim
    sphere.lineStyle(3, 0xFFD700, 0.9);
    sphere.strokeCircle(0, 0, radius * 1.1);
    
    // Highlight
    const highlight = scene.add.ellipse(-radius * 0.3, -radius * 0.3, 
        radius * 0.5, radius * 0.35, 0xFFFFFF, 0.7);
    highlight.setBlendMode(Phaser.BlendModes.ADD);
    
    // Large "W" letter
    const wText = scene.add.text(0, 0, 'W', {
        fontSize: `${radius * 1.5}px`,
        color: '#FFFFFF',
        ...BOLD_TEXT_STYLE,
        strokeThickness: 4
    }).setOrigin(0.5);
    
    // Golden particles rotating around
    const particles = scene.add.particles(0, 0, 'particle', {
        speed: { min: 30, max: 50 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1000,
        frequency: 150,
        quantity: 2,
        tint: 0xFFD700
    });
    
    // Pulsing glow
    const glow = scene.add.circle(0, 0, radius * 1.3, 0xFFD700, 0.3);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    
    container.add([shadow, glow, sphere, highlight, wText, particles]);
    container.setSize(radius * 2, radius * 2);
    container.setData('gemType', 'wild');
    container.setData('color', 'wild');
    
    if (!skipAnimations) {
        // Float
        scene.tweens.add({
            targets: container,
            y: y + 4,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Pulsing glow
        scene.tweens.add({
            targets: glow,
            alpha: { from: 0.3, to: 0.6 },
            scale: { from: 1, to: 1.2 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Rotate particles emitter
        scene.tweens.add({
            targets: particles,
            angle: 360,
            duration: 4000,
            repeat: -1,
            ease: 'Linear'
        });
    }
    
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
