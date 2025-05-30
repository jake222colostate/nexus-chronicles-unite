
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MapSkillTreeView } from './MapSkillTreeView';
import { RealmTransition } from './RealmTransition';
import { ConvergenceSystem } from './ConvergenceSystem';
import { BottomActionBar } from './BottomActionBar';
import { TopHUD } from './TopHUD';
import { EnhancedTapButton } from './EnhancedTapButton';
import { EnhancedParticleBackground } from './EnhancedParticleBackground';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { QuickHelpModal } from './QuickHelpModal';

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
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('celestialNexusGame');
    if (saved) {
      const parsedState = JSON.parse(saved);
      return {
        mana: parsedState.mana || 10,
        energyCredits: parsedState.energyCredits || 10,
        manaPerSecond: parsedState.manaPerSecond || 0,
        energyPerSecond: parsedState.energyPerSecond || 0,
        nexusShards: parsedState.nexusShards || 0,
        convergenceCount: parsedState.convergenceCount || 0,
        fantasyBuildings: parsedState.fantasyBuildings || {},
        scifiBuildings: parsedState.scifiBuildings || {},
        purchasedUpgrades: Array.isArray(parsedState.purchasedUpgrades) ? parsedState.purchasedUpgrades : [],
        lastSaveTime: parsedState.lastSaveTime || Date.now(),
      };
    }
    return {
      mana: 10,
      energyCredits: 10,
      manaPerSecond: 0,
      energyPerSecond: 0,
      nexusShards: 0,
      convergenceCount: 0,
      fantasyBuildings: {},
      scifiBuildings: {},
      purchasedUpgrades: [],
      lastSaveTime: Date.now(),
    };
  });

  const [currentRealm, setCurrentRealm] = useState<'fantasy' | 'scifi'>('fantasy');
  const [showConvergence, setShowConvergence] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTapEffect, setShowTapEffect] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(() => {
    return !localStorage.getItem('celestialNexusHelpDismissed');
  });

  // Use refs to prevent unnecessary recalculations
  const lastBuildingsRef = useRef<string>('');
  const lastUpgradesRef = useRef<string>('');
  const productionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate convergence state with stable dependencies
  const canConverge = gameState.mana + gameState.energyCredits >= 1000;
  const convergenceProgress = Math.min(((gameState.mana + gameState.energyCredits) / 1000) * 100, 100);

  // Calculate offline progress on mount only
  useEffect(() => {
    const now = Date.now();
    const offlineTime = Math.min((now - gameState.lastSaveTime) / 1000, 3600);
    
    if (offlineTime > 60) {
      const offlineMana = gameState.manaPerSecond * offlineTime;
      const offlineEnergy = gameState.energyPerSecond * offlineTime;
      
      setGameState(prev => ({
        ...prev,
        mana: prev.mana + offlineMana,
        energyCredits: prev.energyCredits + offlineEnergy,
        lastSaveTime: now,
      }));
    }
  }, []); // Only run once on mount

  // Stable production calculation - only run when buildings or upgrades actually change
  useEffect(() => {
    const buildingsKey = JSON.stringify({
      fantasy: gameState.fantasyBuildings,
      scifi: gameState.scifiBuildings
    });
    const upgradesKey = JSON.stringify(gameState.purchasedUpgrades);
    
    // Only recalculate if buildings or upgrades actually changed
    if (buildingsKey === lastBuildingsRef.current && upgradesKey === lastUpgradesRef.current) {
      return;
    }
    
    lastBuildingsRef.current = buildingsKey;
    lastUpgradesRef.current = upgradesKey;
    
    console.log('Recalculating production rates');
    
    let manaRate = 0;
    let energyRate = 0;

    // Calculate base production from buildings
    fantasyBuildings.forEach(building => {
      const count = gameState.fantasyBuildings[building.id] || 0;
      manaRate += count * building.production;
    });

    scifiBuildings.forEach(building => {
      const count = gameState.scifiBuildings[building.id] || 0;
      energyRate += count * building.production;
    });

    // Apply upgrade bonuses
    let globalMultiplier = 1;
    gameState.purchasedUpgrades.forEach(upgradeId => {
      const upgrade = enhancedHybridUpgrades.find(u => u.id === upgradeId);
      if (upgrade?.effects) {
        if (upgrade.effects.globalProductionBonus) {
          globalMultiplier *= (1 + upgrade.effects.globalProductionBonus);
        }
        if (upgrade.effects.manaProductionBonus) {
          manaRate += upgrade.effects.manaProductionBonus;
        }
        if (upgrade.effects.energyProductionBonus) {
          energyRate += upgrade.effects.energyProductionBonus;
        }
      }
    });

    // Cross-realm bonuses
    const fantasyBonus = 1 + (energyRate * 0.01);
    const scifiBonus = 1 + (manaRate * 0.01);

    const finalManaRate = manaRate * fantasyBonus * globalMultiplier;
    const finalEnergyRate = energyRate * scifiBonus * globalMultiplier;

    setGameState(prev => ({
      ...prev,
      manaPerSecond: finalManaRate,
      energyPerSecond: finalEnergyRate,
    }));
  }, [gameState.fantasyBuildings, gameState.scifiBuildings, gameState.purchasedUpgrades]);

  // Stable game loop with cleanup
  useEffect(() => {
    if (productionTimerRef.current) {
      clearInterval(productionTimerRef.current);
    }
    
    productionTimerRef.current = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        mana: prev.mana + prev.manaPerSecond / 10,
        energyCredits: prev.energyCredits + prev.energyPerSecond / 10,
        lastSaveTime: Date.now(),
      }));
    }, 100);

    return () => {
      if (productionTimerRef.current) {
        clearInterval(productionTimerRef.current);
      }
    };
  }, []); // Only run once

  // Separate auto-save effect
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem('celestialNexusGame', JSON.stringify(gameState));
    }, 1000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [gameState]);

  // Stable callback functions
  const buyBuilding = useCallback((buildingId: string, isFantasy: boolean) => {
    const buildings = isFantasy ? fantasyBuildings : scifiBuildings;
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const currentCount = isFantasy 
      ? gameState.fantasyBuildings[buildingId] || 0
      : gameState.scifiBuildings[buildingId] || 0;
    
    const cost = Math.floor(building.cost * Math.pow(building.costMultiplier, currentCount));
    const currency = isFantasy ? gameState.mana : gameState.energyCredits;

    if (currency >= cost) {
      setGameState(prev => ({
        ...prev,
        mana: isFantasy ? prev.mana - cost : prev.mana,
        energyCredits: isFantasy ? prev.energyCredits : prev.energyCredits - cost,
        fantasyBuildings: isFantasy 
          ? { ...prev.fantasyBuildings, [buildingId]: currentCount + 1 }
          : prev.fantasyBuildings,
        scifiBuildings: isFantasy 
          ? prev.scifiBuildings
          : { ...prev.scifiBuildings, [buildingId]: currentCount + 1 },
      }));
    }
  }, [gameState.mana, gameState.energyCredits, gameState.fantasyBuildings, gameState.scifiBuildings]);

  const performConvergence = useCallback(() => {
    const totalValue = gameState.mana + gameState.energyCredits;
    const shardsGained = Math.floor(Math.sqrt(totalValue / 1000)) + gameState.convergenceCount;
    
    if (shardsGained > 0) {
      setGameState({
        mana: 10,
        energyCredits: 10,
        manaPerSecond: 0,
        energyPerSecond: 0,
        nexusShards: gameState.nexusShards + shardsGained,
        convergenceCount: gameState.convergenceCount + 1,
        fantasyBuildings: {},
        scifiBuildings: {},
        purchasedUpgrades: gameState.purchasedUpgrades,
        lastSaveTime: Date.now(),
      });
      setShowConvergence(false);
    }
  }, [gameState.mana, gameState.energyCredits, gameState.convergenceCount, gameState.nexusShards, gameState.purchasedUpgrades]);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    const upgrade = enhancedHybridUpgrades.find(u => u.id === upgradeId);
    if (!upgrade || gameState.nexusShards < upgrade.cost) return;

    setGameState(prev => ({
      ...prev,
      nexusShards: prev.nexusShards - upgrade.cost,
      purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId]
    }));
  }, [gameState.nexusShards]);

  const switchRealm = useCallback((newRealm: 'fantasy' | 'scifi') => {
    if (newRealm === currentRealm || isTransitioning) return;
    
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
      mana: currentRealm === 'fantasy' ? prev.mana + 1 : prev.mana,
      energyCredits: currentRealm === 'scifi' ? prev.energyCredits + 1 : prev.energyCredits,
    }));
  }, [currentRealm]);

  const handleTapEffectComplete = useCallback(() => {
    setShowTapEffect(false);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowQuickHelp(true);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  // Create a stable game state object for child components - FIXED VERSION
  const stableGameState = useMemo(() => {
    // Create a simple hash of the game state to detect real changes
    const buildingsHash = JSON.stringify(gameState.fantasyBuildings) + JSON.stringify(gameState.scifiBuildings);
    const upgradesHash = gameState.purchasedUpgrades.join(',');
    
    return {
      mana: gameState.mana,
      energyCredits: gameState.energyCredits,
      nexusShards: gameState.nexusShards,
      convergenceCount: gameState.convergenceCount,
      purchasedUpgrades: gameState.purchasedUpgrades,
      manaPerSecond: gameState.manaPerSecond,
      energyPerSecond: gameState.energyPerSecond,
      fantasyBuildings: gameState.fantasyBuildings,
      scifiBuildings: gameState.scifiBuildings,
      lastSaveTime: gameState.lastSaveTime,
      // Add a stable hash to prevent unnecessary re-renders
      _hash: buildingsHash + upgradesHash + gameState.nexusShards + gameState.convergenceCount
    };
  }, [
    // Use stable references instead of computed values
    gameState.nexusShards,
    gameState.convergenceCount,
    gameState.purchasedUpgrades,
    gameState.manaPerSecond,
    gameState.energyPerSecond,
    gameState.fantasyBuildings,
    gameState.scifiBuildings,
    // Only include rounded values for display purposes, not for computation
    Math.round(gameState.mana / 10) * 10,
    Math.round(gameState.energyCredits / 10) * 10
  ]);

  return (
    <div className="h-[667px] w-full relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      <EnhancedParticleBackground realm={currentRealm} />

      <TopHUD
        realm={currentRealm}
        mana={gameState.mana}
        energyCredits={gameState.energyCredits}
        nexusShards={gameState.nexusShards}
        convergenceProgress={convergenceProgress}
        onHelpClick={handleShowHelp}
      />

      <div className="absolute inset-0 pt-16">
        <MapSkillTreeView
          realm={currentRealm}
          buildings={currentRealm === 'fantasy' ? gameState.fantasyBuildings : gameState.scifiBuildings}
          manaPerSecond={gameState.manaPerSecond}
          energyPerSecond={gameState.energyPerSecond}
          onBuyBuilding={(buildingId) => buyBuilding(buildingId, currentRealm === 'fantasy')}
          buildingData={currentRealm === 'fantasy' ? fantasyBuildings : scifiBuildings}
          currency={currentRealm === 'fantasy' ? gameState.mana : gameState.energyCredits}
          gameState={stableGameState}
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

        {canConverge && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
            <Button 
              onClick={() => setShowConvergence(true)}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-yellow-500/95 to-orange-500/95 hover:from-yellow-600/95 hover:to-orange-600/95 backdrop-blur-xl border border-yellow-400/70 animate-pulse transition-all duration-300 font-bold shadow-lg shadow-yellow-500/30"
            >
              <span className="text-sm flex items-center gap-2">
                🔁 Convergence Ready!
              </span>
            </Button>
          </div>
        )}
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
  );
};

export default GameEngine;
