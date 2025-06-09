
import React, { useState } from 'react';
import GameEngine from '../components/GameEngine';
import { useGameStateManager } from '../components/GameStateManager';
import { useGameLoopManager } from '../components/GameLoopManager';
import { MobileResourceSidebar } from '../components/MobileResourceSidebar';

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

  // Auto mana upgrade handler
  const handleAutoManaUpgrade = (cost: number) => {
    if (gameState.mana >= cost) {
      setGameState(prev => {
        const newLevel = prev.autoManaLevel + 1;
        const newRate = newLevel * 2; // 2 mana/sec per level
        
        return {
          ...prev,
          mana: prev.mana - cost,
          autoManaLevel: newLevel,
          autoManaRate: newRate
        };
      });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Mobile-Optimized Resource Sidebar */}
      <MobileResourceSidebar
        realm={currentRealm}
        mana={gameState.mana}
        energyCredits={gameState.energyCredits}
        manaPerSecond={gameState.manaPerSecond}
        energyPerSecond={gameState.energyPerSecond}
        nexusShards={gameState.nexusShards}
        autoManaLevel={gameState.autoManaLevel}
        autoManaRate={gameState.autoManaRate}
        onAutoManaUpgrade={handleAutoManaUpgrade}
      />

      {/* Game Engine - manages its own state internally */}
      <GameEngine />
    </div>
  );
};

export default Index;
