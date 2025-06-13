import React, { useCallback, useMemo, useState } from 'react';
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
import { ScifiWeaponUpgradeSystem } from './ScifiWeaponUpgradeSystem';
import { CrossRealmUpgradeSystem } from './CrossRealmUpgradeSystem';
import { AutoManaUpgradeBox } from './AutoManaUpgradeBox';
import { useGameStateManager, fantasyBuildings, scifiBuildings } from './GameStateManager';
import { useGameLoopManager } from './GameLoopManager';
import { useUpgradeManagers } from './UpgradeManagers';
import { useUIStateManager } from './UIStateManager';
import { AutoClickerUpgradeSystem } from './AutoClickerUpgradeSystem';
import { useAutoClickerEffect } from '@/hooks/useAutoClickerEffect';
import { FantasyAutoClickerUpgradeSystem } from './FantasyAutoClickerUpgradeSystem';
import { useAutoManaSystem } from '@/hooks/useAutoManaSystem';
import { useAutoEnergySystem } from '@/hooks/useAutoEnergySystem';
import { ScifiAutoClickerUpgradeSystem } from './ScifiAutoClickerUpgradeSystem';
import { CollisionProvider } from '@/lib/CollisionContext';

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
    switchRealm
  } = useUIStateManager(gameState);

  const [enemyCount, setEnemyCount] = useState(0);

  // Create stable references to prevent infinite re-renders
  const stablePlayerPosition = useMemo(() => ({
    x: playerPosition.x,
    y: playerPosition.y,
    z: playerPosition.z
  }), [playerPosition.x, playerPosition.y, playerPosition.z]);

  const stableGameState = useMemo(() => gameState, [
    gameState.mana,
    gameState.energyCredits,
    gameState.nexusShards,
    gameState.manaPerSecond,
    gameState.energyPerSecond,
    gameState.fantasyJourneyDistance,
    gameState.scifiJourneyDistance,
    gameState.convergenceCount
  ]);

  useGameLoopManager({
    gameState: stableGameState,
    setGameState,
    stableFantasyBuildings,
    stableScifiBuildings,
    stablePurchasedUpgrades,
    crossRealmUpgradesWithLevels
  });

  const {
    combatUpgrades,
    weaponUpgrades,
    scifiWeaponUpgrades,
    weaponStats,
    scifiWeaponStats,
    buyBuilding,
    performConvergence,
    purchaseUpgrade,
    purchaseCombatUpgrade,
    purchaseWeaponUpgrade,
    purchaseScifiWeaponUpgrade,
    purchaseCrossRealmUpgrade
  } = useUpgradeManagers({
    gameState: stableGameState,
    setGameState,
    currentRealm,
    crossRealmUpgradesWithLevels
  });

  // Auto mana upgrade handler
  const handleAutoManaUpgrade = useCallback((cost: number) => {
    if (stableGameState.mana >= cost) {
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
  }, [stableGameState.mana, setGameState]);

  const handlePlayerPositionUpdate = useCallback((position: { x: number; y: number; z: number }) => {
    console.log('Player position updated:', position);
  }, []);

  const handleEnemyCountChange = useCallback((count: number) => {
    setEnemyCount(count);
  }, []);

  const handleEnemyKilled = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      mana: prev.mana + prev.manaPerKill,
      enemiesKilled: prev.enemiesKilled + 1,
    }));
  }, [setGameState]);

  const handleMeteorDestroyed = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      energyCredits: prev.energyCredits + 5,
    }));
  }, [setGameState]);

  const handleJourneyUpdate = useCallback((distance: number) => {
    const currentDistance = currentRealm === 'fantasy' ? stableGameState.fantasyJourneyDistance : stableGameState.scifiJourneyDistance;
    
    if (Math.abs(distance - currentDistance) > 0.5) {
      setGameState(prev => ({
        ...prev,
        [currentRealm === 'fantasy' ? 'fantasyJourneyDistance' : 'scifiJourneyDistance']: distance
      }));
    }
  }, [currentRealm, stableGameState.fantasyJourneyDistance, stableGameState.scifiJourneyDistance, setGameState]);

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

  const handleAutoManaGeneration = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      mana: prev.mana + amount,
    }));
  }, [setGameState]);

  useAutoManaSystem({ onAddMana: handleAutoManaGeneration });

  const handleFantasyAutoClickerUpgrade = useCallback((cost: number) => {
    setGameState(prev => ({
      ...prev,
      mana: prev.mana - cost,
    }));
  }, [setGameState]);

  const handleAutoEnergyGeneration = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      energyCredits: prev.energyCredits + amount,
    }));
  }, [setGameState]);

  useAutoEnergySystem({ onAddEnergy: handleAutoEnergyGeneration });

  const handleScifiAutoClickerUpgrade = useCallback((cost: number) => {
    setGameState(prev => ({
      ...prev,
      energyCredits: prev.energyCredits - cost,
    }));
  }, [setGameState]);

  return (
    <CollisionProvider>
    <div className="h-[667px] w-full relative overflow-hidden bg-black boundary-constrained iphone-screen-container">
      {/* Enhanced background with better layering */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      {/* Enhanced particle background for visual depth */}
      <EnhancedParticleBackground realm={currentRealm} />

      {/* Journey Tracker - invisible component that tracks real movement */}
      <JourneyTracker 
        playerPosition={stablePlayerPosition}
        onJourneyUpdate={handleJourneyUpdate}
      />

      {/* Top HUD - Fixed at top with proper spacing */}
      <TopHUD
        realm={currentRealm}
        mana={stableGameState.mana}
        energyCredits={stableGameState.energyCredits}
        nexusShards={stableGameState.nexusShards}
        convergenceProgress={convergenceProgress}
        manaPerSecond={stableGameState.manaPerSecond}
        energyPerSecond={stableGameState.energyPerSecond}
        onHelpClick={handleShowHelp}
        onCombatUpgradesClick={handleShowCombatUpgrades}
        enemyCount={enemyCount}
      />

      {/* Auto Mana Upgrade Box - Centered below top bar */}
      <AutoManaUpgradeBox
        autoManaLevel={stableGameState.autoManaLevel}
        autoManaRate={stableGameState.autoManaRate}
        currentMana={stableGameState.mana}
        onUpgrade={handleAutoManaUpgrade}
      />

      {/* Main Game Area - Properly positioned to avoid overlap */}
      <div className="absolute inset-0 pt-24 pb-24" style={{ pointerEvents: 'none' }}>
        <MapSkillTreeView
          realm={currentRealm}
          buildings={currentRealm === 'fantasy' ? stableGameState.fantasyBuildings : stableGameState.scifiBuildings}
          manaPerSecond={stableGameState.manaPerSecond}
          energyPerSecond={stableGameState.energyPerSecond}
          onBuyBuilding={(buildingId) => buyBuilding(buildingId, currentRealm === 'fantasy')}
          buildingData={currentRealm === 'fantasy' ? fantasyBuildings : scifiBuildings}
          currency={currentRealm === 'fantasy' ? stableGameState.mana : stableGameState.energyCredits}
          gameState={stableGameState}
          onPurchaseUpgrade={purchaseUpgrade}
          isTransitioning={isTransitioning}
          showTapEffect={showTapEffect}
          onTapEffectComplete={handleTapEffectComplete}
          onPlayerPositionUpdate={handlePlayerPositionUpdate}
          onEnemyCountChange={handleEnemyCountChange}
          onEnemyKilled={handleEnemyKilled}
          onMeteorDestroyed={handleMeteorDestroyed}
          weaponDamage={currentRealm === 'fantasy' ? weaponStats.damage : scifiWeaponStats.damage}
        />

        {/* Realm Transition Effect */}
        <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />
      </div>

      {/* Bottom Action Bar - Fixed at bottom */}
      <BottomActionBar
        currentRealm={currentRealm}
        onRealmChange={switchRealm}
        onTap={handleTapResource}
        isTransitioning={isTransitioning}
        playerDistance={currentJourneyDistance}
      />

      {/* All modal overlays - properly constrained */}
      {showQuickHelp && (
        <QuickHelpModal
          isOpen={showQuickHelp}
          onClose={() => setShowQuickHelp(false)}
        />
      )}

      {showCombatUpgrades && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 boundary-constrained">
          <div className="w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <CombatUpgradeSystem
              upgrades={combatUpgrades}
              mana={stableGameState.mana}
              onUpgrade={purchaseCombatUpgrade}
              onClose={() => setShowCombatUpgrades(false)}
            />
          </div>
        </div>
      )}

      {showWeaponUpgrades && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 boundary-constrained">
          <div className="w-full max-w-sm max-h-[80vh] overflow-y-auto">
            {currentRealm === 'fantasy' ? (
              <WeaponUpgradeSystem
                upgrades={weaponUpgrades}
                mana={stableGameState.mana}
                onUpgrade={purchaseWeaponUpgrade}
                onClose={() => setShowWeaponUpgrades(false)}
              />
            ) : (
              <ScifiWeaponUpgradeSystem
                upgrades={scifiWeaponUpgrades}
                energyCredits={stableGameState.energyCredits}
                onUpgrade={purchaseScifiWeaponUpgrade}
                onClose={() => setShowWeaponUpgrades(false)}
              />
            )}
          </div>
        </div>
      )}

      {showCrossRealmUpgrades && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 boundary-constrained">
          <div className="w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <CrossRealmUpgradeSystem
              upgrades={crossRealmUpgradesWithLevels}
              currentRealm={currentRealm}
              mana={stableGameState.mana}
              energyCredits={stableGameState.energyCredits}
              fantasyJourneyDistance={stableGameState.fantasyJourneyDistance}
              scifiJourneyDistance={stableGameState.scifiJourneyDistance}
              onUpgrade={purchaseCrossRealmUpgrade}
              onClose={() => setShowCrossRealmUpgrades(false)}
            />
          </div>
        </div>
      )}

      {showConvergence && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 boundary-constrained">
          <div className="w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <ConvergenceSystem
              gameState={stableGameState}
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
    </CollisionProvider>
  );
};

export default GameEngine;
