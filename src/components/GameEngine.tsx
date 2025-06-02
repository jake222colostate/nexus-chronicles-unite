
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MapSkillTreeView } from './MapSkillTreeView';
import { RealmTransition } from './RealmTransition';
import { ConvergenceSystem } from './ConvergenceSystem';
import { BottomActionBar } from './BottomActionBar';
import { TopHUD } from './TopHUD';
import { EnhancedParticleBackground } from './EnhancedParticleBackground';
import { QuickHelpModal } from './QuickHelpModal';
import { CombatUpgradeSystem } from './CombatUpgradeSystem';
import { JourneyTracker } from './JourneyTracker';
import { WeaponUpgradeSystem } from './WeaponUpgradeSystem';
import { CrossRealmUpgradeSystem } from './CrossRealmUpgradeSystem';
import { useGameStateManager, fantasyBuildings, scifiBuildings } from './GameStateManager';
import { useGameLoopManager } from './GameLoopManager';
import { useUpgradeManagers } from './UpgradeManagers';
import { useUIStateManager } from './UIStateManager';

const GameEngine: React.FC = () => {
  const {
    gameState,
    setGameState,
    stableFantasyBuildings,
    stableScifiBuildings,
    stablePurchasedUpgrades,
    crossRealmUpgradesWithLevels
  } = useGameStateManager();

  const {
    currentRealm,
    showConvergence,
    isTransitioning,
    showTapEffect,
    showQuickHelp,
    showCombatUpgrades,
    showWeaponUpgrades,
    showCrossRealmUpgrades,
    playerPosition,
    currentJourneyDistance,
    canConverge,
    convergenceProgress,
    setShowConvergence,
    setShowTapEffect,
    setShowQuickHelp,
    setShowCombatUpgrades,
    setShowWeaponUpgrades,
    setShowCrossRealmUpgrades,
    setPlayerPosition,
    switchRealm
  } = useUIStateManager(gameState);

  useGameLoopManager({
    gameState,
    setGameState,
    stableFantasyBuildings,
    stableScifiBuildings,
    stablePurchasedUpgrades,
    crossRealmUpgradesWithLevels
  });

  const {
    combatUpgrades,
    weaponUpgrades,
    buyBuilding,
    performConvergence,
    purchaseUpgrade,
    purchaseCombatUpgrade,
    purchaseWeaponUpgrade,
    purchaseCrossRealmUpgrade
  } = useUpgradeManagers({
    gameState,
    setGameState,
    currentRealm,
    crossRealmUpgradesWithLevels
  });

  // Handle player position updates from 3D world
  const handlePlayerPositionUpdate = useCallback((position: { x: number; y: number; z: number }) => {
    setPlayerPosition(position);
  }, [setPlayerPosition]);

  // Handle journey distance updates (only forward progress)
  const handleJourneyUpdate = useCallback((distance: number) => {
    setGameState(prev => ({
      ...prev,
      [currentRealm === 'fantasy' ? 'fantasyJourneyDistance' : 'scifiJourneyDistance']: distance
    }));
  }, [currentRealm, setGameState]);

  const handleNexusClick = useCallback(() => {
    if (canConverge) {
      setShowConvergence(true);
    }
  }, [canConverge, setShowConvergence]);

  const handleShowHelp = useCallback(() => {
    setShowQuickHelp(true);
  }, [setShowQuickHelp]);

  const handleShowCombatUpgrades = useCallback(() => {
    setShowCombatUpgrades(true);
  }, [setShowCombatUpgrades]);

  const handleShowWeaponUpgrades = useCallback(() => {
    setShowWeaponUpgrades(true);
  }, [setShowWeaponUpgrades]);

  const handleShowCrossRealmUpgrades = useCallback(() => {
    setShowCrossRealmUpgrades(true);
  }, [setShowCrossRealmUpgrades]);

  const handleTapResource = useCallback(() => {
    setShowTapEffect(true);
    setGameState(prev => ({
      ...prev,
      mana: prev.mana + 1,
    }));
    
    // Show +1 mana animation
    const tapButton = document.getElementById('tap-button');
    if (tapButton) {
      const rect = tapButton.getBoundingClientRect();
      const popup = document.createElement('div');
      popup.textContent = '+1 Mana';
      popup.className = 'fixed text-yellow-400 font-bold text-lg pointer-events-none z-50 animate-fade-in';
      popup.style.left = `${rect.left + rect.width / 2}px`;
      popup.style.top = `${rect.top - 20}px`;
      popup.style.transform = 'translateX(-50%)';
      document.body.appendChild(popup);
      
      setTimeout(() => {
        popup.style.transform = 'translateX(-50%) translateY(-20px)';
        popup.style.opacity = '0';
        popup.style.transition = 'all 0.5s ease-out';
      }, 100);
      
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 600);
    }
  }, [setShowTapEffect, setGameState]);

  const handleTapEffectComplete = useCallback(() => {
    setShowTapEffect(false);
  }, [setShowTapEffect]);

  const handleConvergenceClose = useCallback(() => {
    setShowConvergence(false);
  }, [setShowConvergence]);

  const handlePerformConvergence = useCallback(() => {
    performConvergence();
    setShowConvergence(false);
  }, [performConvergence, setShowConvergence]);

  return (
    <div className={`h-[667px] w-full relative overflow-hidden bg-black ${false ? 'animate-pulse bg-red-900/20' : ''}`}>
      {/* Enhanced background with better layering */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      {/* Enhanced particle background for visual depth */}
      <EnhancedParticleBackground realm={currentRealm} />

      {/* Journey Tracker - invisible component that tracks real movement */}
      <JourneyTracker 
        playerPosition={playerPosition}
        onJourneyUpdate={handleJourneyUpdate}
      />

      {/* Clean TopHUD with cross-realm upgrade button */}
      <TopHUD
        realm={currentRealm}
        mana={gameState.mana}
        energyCredits={gameState.energyCredits}
        nexusShards={gameState.nexusShards}
        convergenceProgress={convergenceProgress}
        manaPerSecond={gameState.manaPerSecond}
        energyPerSecond={gameState.energyPerSecond}
        onHelpClick={handleShowHelp}
        onCombatUpgradesClick={handleShowCombatUpgrades}
        enemyCount={0}
      />

      {/* Main Game Area */}
      <div className="absolute inset-0 pt-12 pb-32">
        {/* Main game view without overlays */}
        <MapSkillTreeView
          realm={currentRealm}
          buildings={currentRealm === 'fantasy' ? gameState.fantasyBuildings : gameState.scifiBuildings}
          manaPerSecond={gameState.manaPerSecond}
          energyPerSecond={gameState.energyPerSecond}
          onBuyBuilding={(buildingId) => buyBuilding(buildingId, currentRealm === 'fantasy')}
          buildingData={currentRealm === 'fantasy' ? fantasyBuildings : scifiBuildings}
          currency={currentRealm === 'fantasy' ? gameState.mana : gameState.energyCredits}
          gameState={gameState}
          onPurchaseUpgrade={purchaseUpgrade}
          isTransitioning={isTransitioning}
          showTapEffect={showTapEffect}
          onTapEffectComplete={handleTapEffectComplete}
          onPlayerPositionUpdate={handlePlayerPositionUpdate}
        />

        {/* Realm Transition Effect */}
        <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />

        {/* Weapon Upgrade Button */}
        <div className="absolute top-16 right-4 z-30">
          <Button 
            onClick={handleShowWeaponUpgrades}
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-500/95 to-red-500/95 hover:from-orange-600/95 hover:to-red-600/95 backdrop-blur-xl border border-orange-400/70 transition-all duration-300 font-bold shadow-lg shadow-orange-500/30 p-0"
          >
            🏹
          </Button>
        </div>

        {/* Cross-Realm Upgrades Button */}
        <div className="absolute top-16 left-4 z-30">
          <Button 
            onClick={handleShowCrossRealmUpgrades}
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500/95 to-purple-500/95 hover:from-indigo-600/95 hover:to-purple-600/95 backdrop-blur-xl border border-indigo-400/70 transition-all duration-300 font-bold shadow-lg shadow-indigo-500/30 p-0"
          >
            🏰
          </Button>
        </div>

        {/* Convergence Ready Button */}
        {canConverge && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30">
            <Button 
              onClick={() => setShowConvergence(true)}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-yellow-500/95 to-orange-500/95 hover:from-yellow-600/95 hover:to-orange-600/95 backdrop-blur-xl border border-yellow-400/70 animate-pulse transition-all duration-300 font-bold shadow-lg shadow-yellow-500/30"
            >
              🔁 Convergence Ready!
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Bottom Action Bar with realm-specific journey progress */}
      <BottomActionBar
        currentRealm={currentRealm}
        onRealmChange={switchRealm}
        onTap={handleTapResource}
        isTransitioning={isTransitioning}
        playerDistance={currentJourneyDistance}
      />

      {/* Quick Help Modal */}
      <QuickHelpModal
        isOpen={showQuickHelp}
        onClose={() => setShowQuickHelp(false)}
      />

      {/* Combat Upgrades Modal */}
      {showCombatUpgrades && (
        <CombatUpgradeSystem
          upgrades={combatUpgrades}
          mana={gameState.mana}
          onUpgrade={purchaseCombatUpgrade}
          onClose={() => setShowCombatUpgrades(false)}
        />
      )}

      {/* Weapon Upgrades Modal */}
      {showWeaponUpgrades && (
        <WeaponUpgradeSystem
          upgrades={weaponUpgrades}
          mana={gameState.mana}
          onUpgrade={purchaseWeaponUpgrade}
          onClose={() => setShowWeaponUpgrades(false)}
        />
      )}

      {/* Cross-Realm Upgrades Modal */}
      {showCrossRealmUpgrades && (
        <CrossRealmUpgradeSystem
          upgrades={crossRealmUpgradesWithLevels}
          currentRealm={currentRealm}
          mana={gameState.mana}
          energyCredits={gameState.energyCredits}
          fantasyJourneyDistance={gameState.fantasyJourneyDistance}
          scifiJourneyDistance={gameState.scifiJourneyDistance}
          onUpgrade={purchaseCrossRealmUpgrade}
          onClose={() => setShowCrossRealmUpgrades(false)}
        />
      )}

      {/* Convergence Modal */}
      {showConvergence && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleConvergenceClose();
            }
          }}
        >
          <div className="max-w-[90%] w-full max-w-sm">
            <ConvergenceSystem
              gameState={gameState}
              onPerformConvergence={handlePerformConvergence}
            />
            <div className="mt-3 text-center">
              <Button 
                onClick={handleConvergenceClose}
                variant="outline"
                size="sm"
                className="border-gray-400 text-gray-300 hover:bg-white/10 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
