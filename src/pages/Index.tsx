
import React from 'react';
import GameEngine from '../components/GameEngine';

const Index = () => {

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Game Engine - manages its own state internally */}
      <GameEngine />
    </div>
  );
};

export default Index;
