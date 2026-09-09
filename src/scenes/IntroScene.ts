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
    this.load.image('intro-logo', `${BASE}/logo.png`);
    LORDS.forEach(([key, , , file]) => this.load.image(`intro-${key}`, `${BASE}/lords/${file}`));
  }
  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#070b20');
    const logo = this.add.image(width / 2, height * 0.22, 'intro-logo').setAlpha(0);
    logo.setScale(Math.min(0.62, width / logo.width * 0.65));
    this.tweens.add({ targets: logo, alpha: 1, y: '+=12', duration: 900 });
    const spacing = Math.min(170, width / 5);
    LORDS.forEach(([key, label, color], index) => {
      const x = width / 2 + (index - 1.5) * spacing;
      const y = height * 0.62;
      const ring = this.add.circle(x, y, 58, 0x050816).setStrokeStyle(5, color).setScale(0);
      const portrait = this.add.image(x, y, `intro-${key}`).setDisplaySize(104, 104).setAlpha(0);
      const name = this.add.text(x, y + 78, label, { fontFamily: 'Georgia, serif', fontSize: '15px', color: `#${color.toString(16).padStart(6, '0')}` }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: ring, scale: 1, duration: 480, delay: 700 + index * 280, ease: 'Back.easeOut' });
      this.tweens.add({ targets: [portrait, name], alpha: 1, duration: 500, delay: 900 + index * 280 });
      this.tweens.add({ targets: ring, alpha: 0.55, duration: 700, delay: 1500 + index * 180, yoyo: true, repeat: -1 });
    });
    const start = this.add.text(width / 2, height * 0.9, 'CLICK TO START', { fontSize: '18px', color: '#fff' }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: start, alpha: 1, duration: 600, delay: 2100 });
    this.tweens.add({ targets: start, alpha: 0.35, duration: 800, delay: 2700, yoyo: true, repeat: -1 });
    this.input.once('pointerdown', () => this.startGame());
    this.time.delayedCall(6500, () => this.startGame());
  }
  private startGame() {
    if (this.started) return;
    this.started = true;
    this.cameras.main.fadeOut(350, 0, 0, 0, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) this.scene.start('GameScene', { gameVersion: GAME_VERSIONS.current });
    });
  }
}
