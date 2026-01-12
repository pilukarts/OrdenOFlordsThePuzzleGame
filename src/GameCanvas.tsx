
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene'; // Ruta corregida

const GameCanvas: React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current) {
            return;
        }

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 480,
            height: 480,
            parent: 'phaser-container',
            scene: [GameScene], // Carga nuestra nueva escena
        };

        gameRef.current = new Phaser.Game(config);

        return () => {
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, []);

    return <div id="phaser-container" style={{ width: '480px', height: '480px' }} />;
};

export default GameCanvas;
