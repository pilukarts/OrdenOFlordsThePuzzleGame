import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  backgroundColor: "#222",
  parent: "phaser-container",
  scene: {
    preload,
    create,
    update
  }
};

function preload(this: Phaser.Scene) {
  // Aquí cargas assets, por ejemplo:
  // this.load.image('logo', 'assets/logo.png');
}

function create(this: Phaser.Scene) {
  const text = this.add.text(240, 320, "¡Hello Lords!", {
    font: "32px Arial",
    color: "#fff"
  });
  text.setOrigin(0.5);
}

function update(this: Phaser.Scene) {
  // Lógica de juego frame a frame
}

const GameCanvas: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(config);
    }
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="phaser-container" />;
};

export default GameCanvas;