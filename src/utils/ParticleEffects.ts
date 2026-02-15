/**
 * ParticleEffects.ts
 * Visual effects for explosions, cascades, and special events
 */

import Phaser from 'phaser';

/**
 * Create explosion particle effect
 */
export function createExplosion(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    intensity: number = 1
): void {
    // Particles
    const particles = scene.add.particles(x, y, 'particle', {
        speed: { min: 50 * intensity, max: 150 * intensity },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6 * intensity, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 600,
        quantity: 15 * intensity,
        tint: color,
        blendMode: Phaser.BlendModes.ADD
    });
    
    scene.time.delayedCall(700, () => particles.destroy());
    
    // Flash circle
    const flash = scene.add.circle(x, y, 30 * intensity, color, 0.8);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    
    scene.tweens.add({
        targets: flash,
        scale: { from: 0.5, to: 2 },
        alpha: { from: 0.8, to: 0 },
        duration: 400,
        onComplete: () => flash.destroy()
    });
}

/**
 * Create cascade trail effect when gems fall
 */
export function createCascadeTrail(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number
): void {
    const trail = scene.add.particles(x, y, 'particle', {
        speed: { min: 10, max: 30 },
        angle: { min: 60, max: 120 },
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 300,
        frequency: 50,
        tint: color
    });
    
    scene.time.delayedCall(500, () => trail.destroy());
}

/**
 * Create sparkle burst for special events
 */
export function createSparkleBurst(
    scene: Phaser.Scene,
    x: number,
    y: number,
    count: number = 20
): void {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 50;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;
        
        const star = scene.add.star(x, y, 5, 3, 6, 0xFFFFFF);
        star.setBlendMode(Phaser.BlendModes.ADD);
        
        scene.tweens.add({
            targets: star,
            x: targetX,
            y: targetY,
            alpha: { from: 1, to: 0 },
            scale: { from: 0.5, to: 0 },
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => star.destroy()
        });
    }
}

/**
 * Create screen shake effect
 */
export function shakeScreen(scene: Phaser.Scene, intensity: number = 1): void {
    scene.cameras.main.shake(200 * intensity, 0.005 * intensity);
}

/**
 * Create glow pulse around object
 */
export function createGlowPulse(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    color: number,
    duration: number = 1000
): void {
    if (!(target instanceof Phaser.GameObjects.Container)) return;
    
    const glow = scene.add.circle(0, 0, 40, color, 0.5);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    target.add(glow);
    
    scene.tweens.add({
        targets: glow,
        scale: { from: 0.8, to: 1.5 },
        alpha: { from: 0.5, to: 0 },
        duration,
        onComplete: () => glow.destroy()
    });
}

/**
 * Create coin rain effect for big wins
 */
export function createCoinRain(
    scene: Phaser.Scene,
    centerX: number,
    centerY: number
): void {
    for (let i = 0; i < 30; i++) {
        const x = centerX + (Math.random() - 0.5) * 200;
        const startY = centerY - 100;
        const endY = centerY + 200;
        
        const coin = scene.add.text(x, startY, '£', {
            fontSize: '32px',
            color: '#FFD700',
            fontStyle: 'bold'
        });
        
        scene.tweens.add({
            targets: coin,
            y: endY,
            angle: 720,
            alpha: { from: 1, to: 0 },
            duration: 1500 + Math.random() * 500,
            delay: Math.random() * 500,
            ease: 'Cubic.easeIn',
            onComplete: () => coin.destroy()
        });
    }
}

/**
 * Create Lord power activation effect
 */
export function createLordPowerEffect(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number
): void {
    // Large circular wave
    const wave = scene.add.circle(x, y, 30, color, 0.6);
    wave.setBlendMode(Phaser.BlendModes.ADD);
    
    scene.tweens.add({
        targets: wave,
        scale: { from: 1, to: 5 },
        alpha: { from: 0.6, to: 0 },
        duration: 1000,
        onComplete: () => wave.destroy()
    });
    
    // Lightning bolts
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const length = 100;
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        const bolt = scene.add.graphics();
        bolt.lineStyle(3, color, 0.8);
        bolt.lineBetween(x, y, endX, endY);
        bolt.setBlendMode(Phaser.BlendModes.ADD);
        
        scene.tweens.add({
            targets: bolt,
            alpha: { from: 0.8, to: 0 },
            duration: 500,
            onComplete: () => bolt.destroy()
        });
    }
    
    // Sparkles
    createSparkleBurst(scene, x, y, 30);
}

/**
 * Create super bonus effect (all 4 Lords)
 */
export function createSuperBonusEffect(scene: Phaser.Scene): void {
    const { width, height } = scene.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Rainbow explosion
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00];
    colors.forEach((color, index) => {
        scene.time.delayedCall(index * 100, () => {
            createExplosion(scene, centerX, centerY, color, 3);
        });
    });
    
    // Screen flash
    const flash = scene.add.rectangle(0, 0, width, height, 0xFFFFFF, 0.8);
    flash.setOrigin(0, 0);
    flash.setDepth(1000);
    
    scene.tweens.add({
        targets: flash,
        alpha: { from: 0.8, to: 0 },
        duration: 500,
        onComplete: () => flash.destroy()
    });
    
    // Massive shake
    shakeScreen(scene, 5);
    
    // Coin rain
    createCoinRain(scene, centerX, centerY);
}

/**
 * Create win text display
 */
export function createWinText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    amount: number,
    isJackpot: boolean = false
): Phaser.GameObjects.Text {
    const text = scene.add.text(x, y, `£${amount.toFixed(2)}`, {
        fontSize: isJackpot ? '64px' : '36px',
        color: isJackpot ? '#FF00FF' : '#FFD700',
        fontFamily: 'Cinzel',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: {
            offsetX: 3,
            offsetY: 3,
            color: '#000000',
            blur: 5,
            fill: true
        }
    });
    
    text.setOrigin(0.5);
    text.setDepth(500);
    
    scene.tweens.add({
        targets: text,
        scale: { from: 0, to: isJackpot ? 1.5 : 1 },
        duration: 300,
        ease: 'Back.easeOut'
    });
    
    return text;
}

/**
 * Create bomb explosion effect with shockwave
 */
export function createBombExplosion(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bombType: 'small' | 'medium' | 'large' | 'line' | 'color',
    onComplete?: () => void
): void {
    const sizeMap = {
        small: 1,
        medium: 1.5,
        large: 2,
        line: 1.8,
        color: 2.5
    };
    
    const shakeMap = {
        small: 0.005,
        medium: 0.01,
        large: 0.015,
        line: 0.012,
        color: 0.02
    };
    
    const size = sizeMap[bombType];
    const shakeIntensity = shakeMap[bombType];
    
    // Screen shake
    scene.cameras.main.shake(300, shakeIntensity);
    
    // Explosion particles
    const colors = bombType === 'color' 
        ? [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF]
        : [0xFF6600, 0xFF0000, 0xFFFF00];
    
    const explosion = scene.add.particles(x, y, 'particle', {
        speed: { min: 100 * size, max: 300 * size },
        angle: { min: 0, max: 360 },
        scale: { start: 1 * size, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: colors,
        lifespan: 600,
        quantity: 50,
        blendMode: Phaser.BlendModes.ADD
    });
    
    // Shockwave
    const wave = scene.add.circle(x, y, 10, 0xFFFFFF, 0.5);
    wave.setBlendMode(Phaser.BlendModes.ADD);
    
    scene.tweens.add({
        targets: wave,
        radius: 150 * size,
        alpha: 0,
        duration: 400,
        ease: 'Cubic.easeOut',
        onComplete: () => wave.destroy()
    });
    
    // Flash
    const flash = scene.add.circle(x, y, 50 * size, 0xFFFFFF, 0.9);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    
    scene.tweens.add({
        targets: flash,
        scale: 2,
        alpha: 0,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => {
            flash.destroy();
            if (onComplete) onComplete();
        }
    });
    
    // Cleanup particles after animation
    scene.time.delayedCall(700, () => explosion.destroy());
}

/**
 * Create confetti particle effect
 */
export function createConfetti(scene: Phaser.Scene): void {
    const { width, height } = scene.cameras.main;
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
    
    for (let i = 0; i < 50; i++) {
        const x = Phaser.Math.Between(0, width);
        const color = Phaser.Utils.Array.GetRandom(colors);
        const particle = scene.add.rectangle(x, -20, 10, 10, color);
        
        scene.tweens.add({
            targets: particle,
            y: height + 20,
            x: x + Phaser.Math.Between(-100, 100),
            angle: 360 * 3,
            duration: Phaser.Math.Between(2000, 3000),
            ease: 'Linear',
            onComplete: () => particle.destroy()
        });
    }
}

/**
 * Create victory glow effect on gem
 */
export function createVictoryGlow(
    scene: Phaser.Scene,
    gem: Phaser.GameObjects.Container,
    glowColor: number,
    duration: number
): Phaser.GameObjects.Arc {
    const glow = scene.add.circle(gem.x, gem.y, 40, glowColor, 0.6);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setDepth(gem.depth - 1);
    
    scene.tweens.add({
        targets: glow,
        scale: 1.5,
        alpha: 0,
        duration: duration,
        onComplete: () => glow.destroy()
    });
    
    return glow;
}
