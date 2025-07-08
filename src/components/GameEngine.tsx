import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MinecraftHotbar } from './MinecraftHotbar';
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
import { useUpgradeSystem } from '../hooks/useUpgradeSystem';
import { useGameStateManager, fantasyBuildings, scifiBuildings } from './GameStateManager';
import { useGameLoopManager } from './GameLoopManager';
import { useUpgradeManagers } from './UpgradeManagers';
import { useUIStateManager } from './UIStateManager';

import { FantasyAutoClickerUpgradeSystem } from './FantasyAutoClickerUpgradeSystem';
import { useAutoManaSystem } from '@/hooks/useAutoManaSystem';
import { useAutoEnergySystem } from '@/hooks/useAutoEnergySystem';
import { ScifiAutoClickerUpgradeSystem } from './ScifiAutoClickerUpgradeSystem';
import { CollisionProvider } from '@/lib/CollisionContext';
import { MapEditorToolbar } from './MapEditor/MapEditorToolbar';
import { useMapEditorStore } from '../stores/useMapEditorStore';

const GameEngine: React.FC = () => {
  const location = useLocation();
  const { isEditorActive } = useMapEditorStore();
  
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

  // Handle navigation from Nexus World - force realm switch
  useEffect(() => {
    const state = location.state as { selectedRealm?: 'fantasy' | 'scifi' };
    if (state?.selectedRealm) {
      // Always switch to the selected realm, even if it's the same as current
      switchRealm(state.selectedRealm);
      // Clear the navigation state to prevent repeated switches
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location.state, switchRealm]);

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

  const {
    purchaseScifiUpgrade,
    purchaseFantasyUpgrade,
    getFantasyUpgradeCount
  } = useUpgradeSystem({ gameState: stableGameState, setGameState });

  // Memoize all handlers to prevent re-renders
  const handlePlayerPositionUpdate = useCallback((position: { x: number; y: number; z: number }) => {
    // Position tracking handled elsewhere to prevent infinite loops
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
    
    // Only update if distance changed significantly
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

  // Add AutoClicker effect
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

  // Add AutoEnergy effect for sci-fi realm
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
    <div className="h-full w-full relative overflow-hidden bg-black">
      {/* Enhanced background with better layering */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      {/* Enhanced particle background for visual depth */}
      <EnhancedParticleBackground realm={currentRealm} />

      {/* Journey Tracker - invisible component that tracks real movement */}
      <JourneyTracker 
        playerPosition={stablePlayerPosition}
        onJourneyUpdate={handleJourneyUpdate}
      />

      {/* Clean TopHUD with cross-realm upgrade button - disabled in map editor */}
      {!isEditorActive && (
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
      )}

      {/* Main Game Area - also used for map editor */}
      <div className="absolute inset-0 pt-12 pb-32">
        {/* Main game view without overlays */}
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
          onPurchaseScifiUpgrade={purchaseScifiUpgrade}
          onPurchaseFantasyUpgrade={purchaseFantasyUpgrade}
          isTransitioning={isTransitioning}
          showTapEffect={showTapEffect}
          onTapEffectComplete={handleTapEffectComplete}
          onPlayerPositionUpdate={handlePlayerPositionUpdate}
          onEnemyCountChange={handleEnemyCountChange}
          onEnemyKilled={handleEnemyKilled}
          onMeteorDestroyed={handleMeteorDestroyed}
          weaponDamage={currentRealm === 'fantasy' ? weaponStats.damage : scifiWeaponStats.damage}
          upgradesPurchased={stableGameState.purchasedUpgrades.length}
        />
      </div>

        {/* UI Elements disabled in map editor */}
        {!isEditorActive && (
          <>
            {/* Realm Transition Effect */}
            <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />

            {/* Fantasy AutoClicker Upgrade System - positioned top-center, only in fantasy realm */}
            {currentRealm === 'fantasy' && (
              <FantasyAutoClickerUpgradeSystem
                currentMana={stableGameState.mana}
                onUpgrade={handleFantasyAutoClickerUpgrade}
              />
            )}

            {/* Sci-Fi AutoClicker Upgrade System - positioned top-center, only in sci-fi realm */}
            {currentRealm === 'scifi' && (
              <ScifiAutoClickerUpgradeSystem
                currentEnergy={stableGameState.energyCredits}
                onUpgrade={handleScifiAutoClickerUpgrade}
              />
            )}

            {/* Weapon Upgrade Button */}
            <div className="absolute top-14 right-2 z-30">
              <Button 
                onClick={handleShowWeaponUpgrades}
                className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500/95 to-red-500/95 hover:from-orange-600/95 hover:to-red-600/95 backdrop-blur-xl border border-orange-400/70 transition-all duration-300 font-bold shadow-lg shadow-orange-500/30 p-0 text-sm"
              >
                🏹
              </Button>
            </div>

            {/* Cross-Realm Upgrades Button */}
            <div className="absolute top-14 left-2 z-30">
              <Button 
                onClick={handleShowCrossRealmUpgrades}
                className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500/95 to-purple-500/95 hover:from-indigo-600/95 hover:to-purple-600/95 backdrop-blur-xl border border-indigo-400/70 transition-all duration-300 font-bold shadow-lg shadow-indigo-500/30 p-0 text-sm"
              >
                🏰
              </Button>
            </div>
          </>
        )}

      {/* Minecraft Hotbar - disabled in map editor */}
      {!isEditorActive && (
        <MinecraftHotbar />
      )}

      {/* Enhanced Bottom Action Bar with realm-specific journey progress - disabled in map editor */}
      {!isEditorActive && (
        <BottomActionBar
          currentRealm={currentRealm}
          onRealmChange={switchRealm}
          isTransitioning={isTransitioning}
          playerDistance={currentJourneyDistance}
        />
      )}

      {/* Modals disabled in map editor */}
      {!isEditorActive && (
        <>
          {/* Quick Help Modal */}
          <QuickHelpModal
            isOpen={showQuickHelp}
            onClose={() => setShowQuickHelp(false)}
          />

          {/* Combat Upgrades Modal */}
          {showCombatUpgrades && (
            <CombatUpgradeSystem
              upgrades={combatUpgrades}
              mana={stableGameState.mana}
              onUpgrade={purchaseCombatUpgrade}
              onClose={() => setShowCombatUpgrades(false)}
            />
          )}

          {/* Weapon Upgrades Modal */}
          {showWeaponUpgrades && (
            currentRealm === 'fantasy' ? (
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
            )
          )}

          {/* Cross-Realm Upgrades Modal */}
          {showCrossRealmUpgrades && (
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
          )}

          {/* Convergence Modal - only show when manually triggered */}
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
        </>
      )}

      {/* Map Editor UI Components */}
      <MapEditorToolbar />
    </div>
    </CollisionProvider>
  );
};

export default GameEngine;
