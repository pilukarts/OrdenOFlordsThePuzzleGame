import Phaser from 'phaser';

let currentMusic: Phaser.Sound.BaseSound | undefined;
let currentKey = '';
let wantedKey = '';
let wantedVolume = 0.28;
let musicMuted = false;

export function playMusic(scene: Phaser.Scene, key: string, volume = 0.28): void {
    wantedKey = key;
    wantedVolume = volume;
    if (musicMuted || (currentKey === key && currentMusic?.isPlaying)) return;

    currentMusic?.stop();
    currentMusic?.destroy();
    currentMusic = scene.sound.add(key, { loop: true, volume });
    currentKey = key;
    if (!currentMusic.play()) {
        scene.input.once('pointerdown', () => playMusic(scene, wantedKey, wantedVolume));
    }
}

export function setMusicMuted(scene: Phaser.Scene, muted: boolean): void {
    musicMuted = muted;
    if (muted) {
        currentMusic?.stop();
        currentMusic?.destroy();
        currentMusic = undefined;
        currentKey = '';
    } else if (wantedKey) {
        playMusic(scene, wantedKey, wantedVolume);
    }
}

export function toggleMusic(scene: Phaser.Scene): boolean {
    setMusicMuted(scene, !musicMuted);
    return !musicMuted;
}

export function isMusicEnabled(): boolean {
    return !musicMuted;
}
