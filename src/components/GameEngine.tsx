import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MapSkillTreeView } from './MapSkillTreeView';
import { RealmTransition } from './RealmTransition';
import { ConvergenceSystem } from './ConvergenceSystem';
import { BottomActionBar } from './BottomActionBar';
import { TopHUD } from './TopHUD';
import { EnhancedTapButton } from './EnhancedTapButton';
import { EnhancedParticleBackground } from './EnhancedParticleBackground';
import { ProductionManager } from './ProductionManager';
import { ConvergenceManager } from './ConvergenceManager';
import { GameErrorBoundary } from './GameErrorBoundary';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { QuickHelpModal } from './QuickHelpModal';
import { initializeGameState, saveGameState } from '../utils/gameStateUtils';
import { useStableGameState } from '../hooks/useStableGameState';

interface GameState {
  mana: number;
  energyCredits: number;
  manaPerSecond: number;
  energyPerSecond: number;
  nexusShards: number;
  convergenceCount: number;
  fantasyBuildings: { [key: string]: number };
  scifiBuildings: { [key: string]: number };
  purchasedUpgrades: string[];
  lastSaveTime: number;
}

interface Building {
  id: string;
  name: string;
  cost: number;
  production: number;
  costMultiplier: number;
  description: string;
  icon: string;
}

const fantasyBuildings: Building[] = [
  { id: 'altar', name: 'Mana Altar', cost: 10, production: 1, costMultiplier: 1.15, description: 'Ancient stones that channel mystical energy', icon: '🔮' },
  { id: 'tower', name: 'Wizard Tower', cost: 100, production: 8, costMultiplier: 1.2, description: 'Towering spires where mages conduct research', icon: '🗼' },
  { id: 'grove', name: 'Enchanted Grove', cost: 1000, production: 47, costMultiplier: 1.25, description: 'Sacred forests pulsing with natural magic', icon: '🌳' },
  { id: 'temple', name: 'Arcane Temple', cost: 11000, production: 260, costMultiplier: 1.3, description: 'Massive structures devoted to magical arts', icon: '🏛️' },
];

const scifiBuildings: Building[] = [
  { id: 'generator', name: 'Solar Panel', cost: 15, production: 1, costMultiplier: 1.15, description: 'Basic renewable energy collection', icon: '☀️' },
  { id: 'reactor', name: 'Fusion Reactor', cost: 150, production: 10, costMultiplier: 1.2, description: 'Advanced nuclear fusion technology', icon: '⚡' },
  { id: 'station', name: 'Space Station', cost: 1500, production: 64, costMultiplier: 1.25, description: 'Orbital platforms generating massive energy', icon: '🛰️' },
  { id: 'megastructure', name: 'Dyson Sphere', cost: 20000, production: 430, costMultiplier: 1.3, description: 'Planet-scale energy harvesting systems', icon: '🌌' },
];

const GameEngine: React.FC = () => {
  // Initialize state only once
  const [gameState, setGameState] = useState<GameState>(() => {
    console.log('GameEngine: Initializing game state');
    return initializeGameState();
  });
  
  const [currentRealm, setCurrentRealm] = useState<'fantasy' | 'scifi'>('fantasy');
  const [showConvergence, setShowConvergence] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTapEffect, setShowTapEffect] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(() => {
    return !localStorage.getItem('celestialNexusHelpDismissed');
  });

  // Use stable game state to prevent re-renders
  const stableState = useStableGameState(gameState);

  // Timer refs
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const productionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const offlineCalculatedRef = useRef(false);

  // Calculate offline progress only once
  useEffect(() => {
    if (offlineCalculatedRef.current) return;
    
    console.log('GameEngine: Calculating offline progress');
    const now = Date.now();
    const offlineTime = Math.min((now - (stableState.lastSaveTime || now)) / 1000, 3600);
    
    if (offlineTime > 60) {
      const offlineMana = (stableState.manaPerSecond || 0) * offlineTime;
      const offlineEnergy = (stableState.energyPerSecond || 0) * offlineTime;
      
      setGameState(prev => ({
        ...prev,
        mana: (prev.mana || 0) + offlineMana,
        energyCredits: (prev.energyCredits || 0) + offlineEnergy,
        lastSaveTime: now,
      }));
    }
    
    offlineCalculatedRef.current = true;
  }, []); // Only run once

  // Stable production update handler
  const handleProductionUpdate = useCallback((manaRate: number, energyRate: number) => {
    console.log('GameEngine: Updating production rates', { manaRate, energyRate });
    setGameState(prev => ({
      ...prev,
      manaPerSecond: manaRate || 0,
      energyPerSecond: energyRate || 0,
    }));
  }, []);

  // Production timer - runs only once
  useEffect(() => {
    console.log('GameEngine: Starting production timer');
    
    if (productionTimerRef.current) {
      clearInterval(productionTimerRef.current);
    }
    
    productionTimerRef.current = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        mana: (prev.mana || 0) + (prev.manaPerSecond || 0) / 10,
        energyCredits: (prev.energyCredits || 0) + (prev.energyPerSecond || 0) / 10,
        lastSaveTime: Date.now(),
      }));
    }, 100);

    return () => {
      console.log('GameEngine: Cleaning up production timer');
      if (productionTimerRef.current) {
        clearInterval(productionTimerRef.current);
      }
    };
  }, []); // Only run once

  // Auto-save with debouncing
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    saveTimerRef.current = setTimeout(() => {
      console.log('GameEngine: Auto-saving game state');
      saveGameState(gameState);
    }, 1000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [gameState.mana, gameState.energyCredits, gameState.nexusShards]); // Only save on important changes

  // Stable callback functions with safe fallbacks
  const buyBuilding = useCallback((buildingId: string, isFantasy: boolean) => {
    console.log('GameEngine: Buying building', { buildingId, isFantasy });
    const buildings = isFantasy ? fantasyBuildings : scifiBuildings;
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const currentCount = isFantasy 
      ? (stableState.fantasyBuildings[buildingId] || 0)
      : (stableState.scifiBuildings[buildingId] || 0);
    
    const cost = Math.floor(building.cost * Math.pow(building.costMultiplier, currentCount));
    const currency = isFantasy ? (stableState.mana || 0) : (stableState.energyCredits || 0);

    if (currency >= cost) {
      setGameState(prev => ({
        ...prev,
        mana: isFantasy ? (prev.mana || 0) - cost : (prev.mana || 0),
        energyCredits: isFantasy ? (prev.energyCredits || 0) : (prev.energyCredits || 0) - cost,
        fantasyBuildings: isFantasy 
          ? { ...(prev.fantasyBuildings || {}), [buildingId]: currentCount + 1 }
          : (prev.fantasyBuildings || {}),
        scifiBuildings: isFantasy 
          ? (prev.scifiBuildings || {})
          : { ...(prev.scifiBuildings || {}), [buildingId]: currentCount + 1 },
      }));
    }
  }, [stableState.mana, stableState.energyCredits, stableState.fantasyBuildings, stableState.scifiBuildings]);

  const performConvergence = useCallback(() => {
    console.log('GameEngine: Performing convergence');
    const totalValue = (stableState.mana || 0) + (stableState.energyCredits || 0);
    const shardsGained = Math.floor(Math.sqrt(totalValue / 1000)) + (stableState.convergenceCount || 0);
    
    if (shardsGained > 0) {
      setGameState({
        mana: 10,
        energyCredits: 10,
        manaPerSecond: 0,
        energyPerSecond: 0,
        nexusShards: (stableState.nexusShards || 0) + shardsGained,
        convergenceCount: (stableState.convergenceCount || 0) + 1,
        fantasyBuildings: {},
        scifiBuildings: {},
        purchasedUpgrades: stableState.purchasedUpgrades || [],
        lastSaveTime: Date.now(),
      });
      setShowConvergence(false);
    }
  }, [stableState.mana, stableState.energyCredits, stableState.convergenceCount, stableState.nexusShards, stableState.purchasedUpgrades]);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    console.log('GameEngine: Purchasing upgrade', upgradeId);
    const upgrade = enhancedHybridUpgrades.find(u => u.id === upgradeId);
    if (!upgrade || (stableState.nexusShards || 0) < upgrade.cost) return;

    setGameState(prev => ({
      ...prev,
      nexusShards: (prev.nexusShards || 0) - upgrade.cost,
      purchasedUpgrades: [...(prev.purchasedUpgrades || []), upgradeId]
    }));
  }, [stableState.nexusShards]);

  const switchRealm = useCallback((newRealm: 'fantasy' | 'scifi') => {
    if (newRealm === currentRealm || isTransitioning) return;
    
    console.log('GameEngine: Switching realm to', newRealm);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentRealm(newRealm);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 200);
  }, [currentRealm, isTransitioning]);

  const handleTapResource = useCallback(() => {
    setShowTapEffect(true);
    setGameState(prev => ({
      ...prev,
      mana: currentRealm === 'fantasy' ? (prev.mana || 0) + 1 : (prev.mana || 0),
      energyCredits: currentRealm === 'scifi' ? (prev.energyCredits || 0) + 1 : (prev.energyCredits || 0),
    }));
  }, [currentRealm]);

  const handleTapEffectComplete = useCallback(() => {
    setShowTapEffect(false);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowQuickHelp(true);
  }, []);

  return (
    <GameErrorBoundary>
      <div className="h-[667px] w-full relative overflow-hidden bg-black">
        <ProductionManager
          gameState={stableState}
          onProductionUpdate={handleProductionUpdate}
          fantasyBuildingData={fantasyBuildings}
          scifiBuildingData={scifiBuildings}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
        
        <EnhancedParticleBackground realm={currentRealm} />

        <TopHUD
          realm={currentRealm}
          mana={stableState.mana || 0}
          energyCredits={stableState.energyCredits || 0}
          nexusShards={stableState.nexusShards || 0}
          convergenceProgress={Math.min(((stableState.mana + stableState.energyCredits) / 1000) * 100, 100)}
          onHelpClick={handleShowHelp}
        />

        <div className="absolute inset-0 pt-16">
          <MapSkillTreeView
            realm={currentRealm}
            buildings={currentRealm === 'fantasy' ? stableState.fantasyBuildings : stableState.scifiBuildings}
            manaPerSecond={stableState.manaPerSecond || 0}
            energyPerSecond={stableState.energyPerSecond || 0}
            onBuyBuilding={(buildingId) => buyBuilding(buildingId, currentRealm === 'fantasy')}
            buildingData={currentRealm === 'fantasy' ? fantasyBuildings : scifiBuildings}
            currency={currentRealm === 'fantasy' ? stableState.mana : stableState.energyCredits}
            gameState={gameState}
            onPurchaseUpgrade={purchaseUpgrade}
            isTransitioning={isTransitioning}
            showTapEffect={showTapEffect}
            onTapEffectComplete={handleTapEffectComplete}
          />

          <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />

          <EnhancedTapButton
            realm={currentRealm}
            onTap={handleTapResource}
          />

          <BottomActionBar
            currentRealm={currentRealm}
            onRealmChange={switchRealm}
            isTransitioning={isTransitioning}
          />

          <ConvergenceManager
            mana={stableState.mana || 0}
            energyCredits={stableState.energyCredits || 0}
            onShowConvergence={() => setShowConvergence(true)}
          />
        </div>

        <QuickHelpModal
          isOpen={showQuickHelp}
          onClose={() => setShowQuickHelp(false)}
        />

        {showConvergence && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowConvergence(false);
              }
            }}
          >
            <div className="max-w-[90%] w-full max-w-sm">
              <ConvergenceSystem
                gameState={gameState}
                onPerformConvergence={performConvergence}
              />
              <div className="mt-3 text-center">
                <Button 
                  onClick={() => setShowConvergence(false)}
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
    </GameErrorBoundary>
  );
};

export default GameEngine;
