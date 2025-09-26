import React from "react";
import GameCanvas from "./GameCanvas";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#181826" }}>
      <h1 style={{ color: "#fff" }}>Orden of Lords: The Puzzle Game</h1>
      <GameCanvas />
    </div>
  );
}

export default App;