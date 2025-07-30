
import React from 'react';
import GameEngine from '../components/GameEngine';

const Index = () => {
  console.log('📄 Index: Component rendering');
  
  try {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {/* Game Engine - manages its own state internally */}
        <GameEngine />
      </div>
    );
  } catch (error) {
    console.error('📄 Index: Error caught:', error);
    return (
      <div className="flex items-center justify-center h-full w-full bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl mb-2">Something went wrong</h2>
          <p className="text-gray-400">Check console for details</p>
        </div>
      </div>
    );
  }
};

export default Index;
