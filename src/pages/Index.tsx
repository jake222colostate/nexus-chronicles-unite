
import React from 'react';
import GameEngine from '../components/GameEngine';

const Index = () => {

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Game Engine - manages its own state internally */}
      <GameEngine />
    </div>
  );
};

export default Index;
