import './App.css';
import LordAvatar from './components/LordAvatar';
import GameCanvas from './GameCanvas'; // 1. Importar GameCanvas

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src="/lords/logo.png" className="App-logo" alt="logo" />
        <h1>Orden of Lords</h1>
      </header>
      <div className="lords-container">
        <LordAvatar lordName="Lord Ignis" imagePath="/lords/LordIgnis.png" />
        <LordAvatar lordName="Dama Ventus" imagePath="/lords/dama ventus.png" />
        <LordAvatar lordName="Lady Aqua" imagePath="/lords/ladyaqua.png" />
        <LordAvatar lordName="Sir Terra" imagePath="/lords/sirterra.png" />
      </div>

      {/* 2. Añadir el lienzo del juego */}
      <div className="game-container">
        <GameCanvas />
      </div>
    </div>
  );
}

export default App;
