import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MapSkillTreeView } from './MapSkillTreeView';
import { RealmTransition } from './RealmTransition';
import { ConvergenceSystem } from './ConvergenceSystem';
import { BottomActionBar } from './BottomActionBar';
import { TopHUD } from './TopHUD';
import { EnhancedTapButton } from './EnhancedTapButton';
import { EnhancedParticleBackground } from './EnhancedParticleBackground';
import { useBuffSystem } from './CrossRealmBuffSystem';
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
        ...parsedState,
        purchasedUpgrades: parsedState.purchasedUpgrades || [],
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
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTapEffect, setShowTapEffect] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(() => {
    return !localStorage.getItem('celestialNexusHelpDismissed');
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stable references to prevent re-renders
  const stableFantasyBuildings = useMemo(() => gameState.fantasyBuildings || {}, [gameState.fantasyBuildings]);
  const stableScifiBuildings = useMemo(() => gameState.scifiBuildings || {}, [gameState.scifiBuildings]);
  const stablePurchasedUpgrades = useMemo(() => gameState.purchasedUpgrades || [], [gameState.purchasedUpgrades]);
  const purchasedUpgradesCount = stablePurchasedUpgrades.length;

  // Initialize buff system with stable dependencies
  const buffSystem = useBuffSystem(stableFantasyBuildings, stableScifiBuildings);

  // Calculate offline progress on mount
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
  }, []); // Only run on mount

  // Game loop
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setGameState(prev => {
        const newState = {
          ...prev,
          mana: prev.mana + prev.manaPerSecond / 10,
          energyCredits: prev.energyCredits + prev.energyPerSecond / 10,
          lastSaveTime: Date.now(),
        };
        
        localStorage.setItem('celestialNexusGame', JSON.stringify(newState));
        return newState;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // Only run on mount

  // Enhanced production calculation with stable dependencies
  useEffect(() => {
    let manaRate = 0;
    let energyRate = 0;

    // Base production from buildings
    fantasyBuildings.forEach(building => {
      const count = stableFantasyBuildings[building.id] || 0;
      const { multiplier, flatBonus } = buffSystem.calculateBuildingMultiplier(building.id, 'fantasy');
      manaRate += (count * building.production * multiplier) + flatBonus;
    });

    scifiBuildings.forEach(building => {
      const count = stableScifiBuildings[building.id] || 0;
      const { multiplier, flatBonus } = buffSystem.calculateBuildingMultiplier(building.id, 'scifi');
      energyRate += (count * building.production * multiplier) + flatBonus;
    });

    // Apply hybrid upgrade bonuses
    let globalMultiplier = 1;
    stablePurchasedUpgrades.forEach(upgradeId => {
      const upgrade = enhancedHybridUpgrades.find(u => u.id === upgradeId);
      if (upgrade) {
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

    setGameState(prev => ({
      ...prev,
      manaPerSecond: manaRate * fantasyBonus * globalMultiplier,
      energyPerSecond: energyRate * scifiBonus * globalMultiplier,
    }));
  }, [stableFantasyBuildings, stableScifiBuildings, purchasedUpgradesCount, buffSystem]); // Use stable dependencies

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
  }, [gameState]);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    const upgrade = enhancedHybridUpgrades.find(u => u.id === upgradeId);
    if (!upgrade || gameState.nexusShards < upgrade.cost) return;

    setGameState(prev => ({
      ...prev,
      nexusShards: prev.nexusShards - upgrade.cost,
      purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId]
    }));
  }, [gameState.nexusShards]);

  // Enhanced realm switching with proper visual feedback
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

  const handleNexusClick = useCallback(() => {
    if (canConverge) {
      setShowConvergence(true);
    }
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowQuickHelp(true);
  }, []);

  // Handle tap resource generation with effect
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

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  }, []);

  const canConverge = gameState.mana + gameState.energyCredits >= 1000;
  const convergenceProgress = Math.min(((gameState.mana + gameState.energyCredits) / 1000) * 100, 100);

  return (
    <div className="h-[667px] w-full relative overflow-hidden bg-black">
      {/* Enhanced background with better layering */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      {/* Enhanced particle background for visual depth */}
      <EnhancedParticleBackground realm={currentRealm} />

      {/* Enhanced TopHUD with unified resource display */}
      <TopHUD
        realm={currentRealm}
        mana={gameState.mana}
        energyCredits={gameState.energyCredits}
        nexusShards={gameState.nexusShards}
        convergenceProgress={convergenceProgress}
        manaPerSecond={gameState.manaPerSecond}
        energyPerSecond={gameState.energyPerSecond}
        onHelpClick={handleShowHelp}
      />

      {/* Main Game Area with proper top/bottom margins */}
      <div className="absolute inset-0 pt-20 pb-20">
        {/* Integrated Map and Skill Tree View - NO overlays or floating elements */}
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
        />

        {/* Realm Transition Effect */}
        <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />

        {/* Clean Progress Bar - positioned above bottom bar */}
        <div className="absolute bottom-20 left-0 right-0 z-25 px-4">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-center">
            <div className="text-xs text-green-400 font-medium">
              Journey Progress: {gameState.purchasedUpgrades.length}/16 Upgrades | Environment: Tier 1
            </div>
          </div>
        </div>

        {/* Convergence Ready Button with proper spacing */}
        {canConverge && (
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-30">
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

      {/* Perfectly centered Bottom Action Bar */}
      <BottomActionBar
        currentRealm={currentRealm}
        onRealmChange={switchRealm}
        onTap={handleTapResource}
        isTransitioning={isTransitioning}
      />

      {/* Quick Help Modal */}
      <QuickHelpModal
        isOpen={showQuickHelp}
        onClose={() => setShowQuickHelp(false)}
      />

      {/* Convergence Modal */}
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
