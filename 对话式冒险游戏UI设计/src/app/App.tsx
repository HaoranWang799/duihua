import React from "react";
import { GameUI } from "./components/game-ui";

function App() {
  return (
    <div className="min-h-screen bg-black overflow-hidden selection:bg-blue-500/20">
      <GameUI />
    </div>
  );
}

export default App;
