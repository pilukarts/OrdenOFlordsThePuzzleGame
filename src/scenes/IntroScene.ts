import Phaser, { Scene } from 'phaser';
import { GAME_VERSIONS } from '../config/GameVersions';

const BASE = '/OrdenOFlordsThePuzzleGame';
const LORDS = [
  ['ignis', 'LORD IGNIS', 0xff3b18, 'lordIgnis.png'],
  ['ventus', 'DAMA VENTUS', 0x36df55, 'damaVentus.png'],
  ['aqua', 'LADY AQUA', 0x38a8ff, 'ladyAqua.1.png'],
  ['terra', 'SIR TERRA', 0xffd51a, 'sirTerra.1.png']
] as const;

export default class IntroScene extends Scene {
  private started = false;
  constructor() { super({ key: 'IntroScene' }); }

  preload() {
    this.load.image('intro-cover', '/assets/orden-of-lords.webp');
    this.load.image('intro-logo', `${BASE}/logo.png`);
    LORDS.forEach(([key, , , file]) => this.load.image(`intro-${key}`, `${BASE}/lords/${file}`));
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#030614');

    const cover = this.add.image(width / 2, height / 2, 'intro-cover')
      .setDisplaySize(width, height).setAlpha(0).setTint(0x69769d);
    this.tweens.add({ targets: cover, alpha: 0.48, duration: 1200 });
    this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.48);

    const aura = this.add.ellipse(width / 2, height * 0.3, Math.min(width * 0.68, 720), height * 0.42, 0xffb52e, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: aura, alpha: 0.22, scale: 1.08, duration: 1500, yoyo: true, repeat: -1 });

    const logo = this.add.image(width / 2, height * 0.28, 'intro-logo').setAlpha(0);
    const logoScale = Math.min(Math.min(width * 0.5, 470) / logo.width, (height * 0.34) / logo.height);
    logo.setScale(logoScale).setY(height * 0.28 - 18);
    this.tweens.add({ targets: logo, alpha: 1, y: height * 0.28, duration: 900, ease: 'Cubic.easeOut' });

    const spacing = Math.min(170, width * 0.19);
    const portraitSize = Math.min(104, width * 0.105);
    LORDS.forEach(([key, label, color], index) => {
      const x = width / 2 + (index - 1.5) * spacing;
      const y = height * 0.68;
      const glow = this.add.circle(x, y, portraitSize * 0.61, color, 0.12).setScale(0);
      const ring = this.add.circle(x, y, portraitSize * 0.56, 0x030716, 0.9).setStrokeStyle(5, color).setScale(0);
      const portrait = this.add.image(x, y, `intro-${key}`).setDisplaySize(portraitSize, portraitSize).setAlpha(0);
      const name = this.add.text(x, y + portraitSize * 0.72, label, {
        fontFamily: 'Georgia, serif', fontSize: `${Math.max(12, portraitSize * 0.15)}px`,
        color: `#${color.toString(16).padStart(6, '0')}`, fontStyle: 'bold',
        stroke: '#02040c', strokeThickness: 4
      }).setOrigin(0.5).setAlpha(0);
      const delay = 650 + index * 220;
      this.tweens.add({ targets: [ring, glow], scale: 1, duration: 520, delay, ease: 'Back.easeOut' });
      this.tweens.add({ targets: [portrait, name], alpha: 1, duration: 480, delay: delay + 160 });
      this.tweens.add({ targets: glow, alpha: 0.32, scale: 1.12, duration: 850, delay: delay + 600, yoyo: true, repeat: -1 });
    });

    const start = this.add.text(width / 2, height * 0.91, 'CLICK TO START', {
      fontFamily: 'Arial', fontSize: '19px', color: '#fff4cf', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: start, alpha: 1, duration: 600, delay: 1900 });
    this.tweens.add({ targets: start, alpha: 0.35, duration: 750, delay: 2500, yoyo: true, repeat: -1 });
    this.input.once('pointerdown', () => this.startGame());
    this.time.delayedCall(7000, () => this.startGame());
  }

  private startGame() {
    if (this.started) return;
    this.started = true;
    this.cameras.main.fadeOut(450, 3, 6, 20, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) this.scene.start('GameScene', { gameVersion: GAME_VERSIONS.current });
    });
  }
}
