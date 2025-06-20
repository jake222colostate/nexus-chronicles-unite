
import React, { useState } from 'react';
import GameEngine from '../components/GameEngine';
import { useGameStateManager } from '../components/GameStateManager';
import { useGameLoopManager } from '../components/GameLoopManager';

const Index = () => {
  const {
    gameState,
    setGameState,
    stableFantasyBuildings,
    stableScifiBuildings,
    stablePurchasedUpgrades,
    crossRealmUpgradesWithLevels
  } = useGameStateManager();

  const { buffSystem } = useGameLoopManager({
    gameState,
    setGameState,
    stableFantasyBuildings,
    stableScifiBuildings,
    stablePurchasedUpgrades,
    crossRealmUpgradesWithLevels
  });

  const [currentRealm, setCurrentRealm] = useState<'fantasy' | 'scifi'>('fantasy');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Game Engine - manages its own state internally */}
      <GameEngine />
    </div>
  );
};

export default Index;
