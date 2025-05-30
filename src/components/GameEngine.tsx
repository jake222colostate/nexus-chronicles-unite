import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MapView } from './MapView';
import { RealmTransition } from './RealmTransition';
import { HybridUpgradesPanel } from './HybridUpgradesPanel';
import { ConvergenceSystem } from './ConvergenceSystem';
import { BottomActionBar } from './BottomActionBar';
import { TopHUD } from './TopHUD';
import { useBuffSystem } from './CrossRealmBuffSystem';
import { hybridUpgrades } from '../data/HybridUpgrades';
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
  const [showHybridUpgrades, setShowHybridUpgrades] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTapEffect, setShowTapEffect] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(() => {
    return !localStorage.getItem('celestialNexusHelpDismissed');
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize buff system
  const buffSystem = useBuffSystem(gameState.fantasyBuildings, gameState.scifiBuildings);

  // Calculate offline progress on mount
  useEffect(() => {
    const now = Date.now();
    const offlineTime = Math.min((now - gameState.lastSaveTime) / 1000, 3600); // Max 1 hour offline
    
    if (offlineTime > 60) { // Only show if offline for more than 1 minute
      const offlineMana = gameState.manaPerSecond * offlineTime;
      const offlineEnergy = gameState.energyPerSecond * offlineTime;
      
      setGameState(prev => ({
        ...prev,
        mana: prev.mana + offlineMana,
        energyCredits: prev.energyCredits + offlineEnergy,
        lastSaveTime: now,
      }));
    }
  }, []);

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
        
        // Auto-save every 10 ticks
        localStorage.setItem('celestialNexusGame', JSON.stringify(newState));
        return newState;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Enhanced production calculation with buffs and upgrades
  useEffect(() => {
    let manaRate = 0;
    let energyRate = 0;

    // Base production from buildings
    fantasyBuildings.forEach(building => {
      const count = gameState.fantasyBuildings[building.id] || 0;
      const { multiplier, flatBonus } = buffSystem.calculateBuildingMultiplier(building.id, 'fantasy');
      manaRate += (count * building.production * multiplier) + flatBonus;
    });

    scifiBuildings.forEach(building => {
      const count = gameState.scifiBuildings[building.id] || 0;
      const { multiplier, flatBonus } = buffSystem.calculateBuildingMultiplier(building.id, 'scifi');
      energyRate += (count * building.production * multiplier) + flatBonus;
    });

    // Apply hybrid upgrade bonuses
    let globalMultiplier = 1;
    gameState.purchasedUpgrades.forEach(upgradeId => {
      const upgrade = hybridUpgrades.find(u => u.id === upgradeId);
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
  }, [gameState.fantasyBuildings, gameState.scifiBuildings, gameState.purchasedUpgrades, buffSystem]);

  const buyBuilding = (buildingId: string, isFantasy: boolean) => {
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
  };

  const performConvergence = () => {
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
        purchasedUpgrades: gameState.purchasedUpgrades, // Keep purchased upgrades
        lastSaveTime: Date.now(),
      });
      setShowConvergence(false);
    }
  };

  const purchaseUpgrade = (upgradeId: string) => {
    const upgrade = hybridUpgrades.find(u => u.id === upgradeId);
    if (!upgrade || gameState.nexusShards < upgrade.cost) return;

    setGameState(prev => ({
      ...prev,
      nexusShards: prev.nexusShards - upgrade.cost,
      purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId]
    }));
  };

  // Enhanced realm switching with proper visual feedback
  const switchRealm = (newRealm: 'fantasy' | 'scifi') => {
    if (newRealm === currentRealm || isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentRealm(newRealm);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 200);
  };

  const handleNexusClick = () => {
    if (canConverge) {
      setShowConvergence(true);
    }
  };

  const handleShowHelp = () => {
    setShowQuickHelp(true);
  };

  // Handle tap resource generation with effect
  const handleTapResource = () => {
    setShowTapEffect(true);
    setGameState(prev => ({
      ...prev,
      mana: currentRealm === 'fantasy' ? prev.mana + 1 : prev.mana,
      energyCredits: currentRealm === 'scifi' ? prev.energyCredits + 1 : prev.energyCredits,
    }));
  };

  const handleTapEffectComplete = () => {
    setShowTapEffect(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const canConverge = gameState.mana + gameState.energyCredits >= 1000;
  const convergenceProgress = Math.min(((gameState.mana + gameState.energyCredits) / 1000) * 100, 100);

  return (
    <div className="h-[667px] w-full relative overflow-hidden bg-black">
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />

      {/* Top HUD - Replaces sidebar */}
      <TopHUD
        realm={currentRealm}
        mana={gameState.mana}
        energyCredits={gameState.energyCredits}
        nexusShards={gameState.nexusShards}
        convergenceProgress={convergenceProgress}
        onHelpClick={handleShowHelp}
      />

      {/* Main Game Area - Full width */}
      <div className="absolute inset-0 pt-16">
        {/* Map View - Takes full available space */}
        <MapView
          realm={currentRealm}
          buildings={currentRealm === 'fantasy' ? gameState.fantasyBuildings : gameState.scifiBuildings}
          manaPerSecond={gameState.manaPerSecond}
          energyPerSecond={gameState.energyPerSecond}
          onBuyBuilding={(buildingId) => buyBuilding(buildingId, currentRealm === 'fantasy')}
          buildingData={currentRealm === 'fantasy' ? fantasyBuildings : scifiBuildings}
          currency={currentRealm === 'fantasy' ? gameState.mana : gameState.energyCredits}
          nexusShards={gameState.nexusShards}
          convergenceProgress={convergenceProgress}
          onNexusClick={handleNexusClick}
          buffSystem={buffSystem}
          onRealmChange={switchRealm}
          isTransitioning={isTransitioning}
          showTapEffect={showTapEffect}
          onTapEffectComplete={handleTapEffectComplete}
          onTapResource={handleTapResource}
        />

        {/* Realm Transition Effect */}
        <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />

        {/* Enhanced Tap to Generate Button - Above bottom bar */}
        <div className="absolute bottom-24 left-0 right-0 z-30 flex justify-center px-4">
          <Button 
            onClick={handleTapResource}
            className={`h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold text-sm backdrop-blur-xl shadow-2xl border-2 relative overflow-hidden ${
              currentRealm === 'fantasy'
                ? 'bg-gradient-to-r from-purple-600/80 to-violet-700/80 hover:from-purple-500/80 hover:to-violet-600/80 border-purple-400/60 text-purple-100 shadow-purple-500/40'
                : 'bg-gradient-to-r from-cyan-600/80 to-blue-700/80 hover:from-cyan-500/80 hover:to-blue-600/80 border-cyan-400/60 text-cyan-100 shadow-cyan-500/40'
            }`}
            style={{
              boxShadow: `0 0 20px ${currentRealm === 'fantasy' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(34, 211, 238, 0.4)'}, 0 8px 32px rgba(0,0,0,0.3)`
            }}
          >
            {/* Enhanced glassmorphism inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none rounded-xl" />
            
            <span className="flex items-center gap-2 relative z-10">
              {currentRealm === 'fantasy' ? '✨' : '⚡'}
              Tap to Generate {currentRealm === 'fantasy' ? 'Mana' : 'Energy'}
            </span>
            
            {/* Animated glow ring */}
            <div className={`absolute inset-0 rounded-xl animate-pulse ${
              currentRealm === 'fantasy' 
                ? 'bg-purple-400/10' 
                : 'bg-cyan-400/10'
            }`} />
          </Button>
        </div>

        {/* Enhanced Bottom Action Bar */}
        <BottomActionBar
          currentRealm={currentRealm}
          onRealmChange={switchRealm}
          onHybridClick={() => setShowHybridUpgrades(true)}
          isTransitioning={isTransitioning}
        />

        {/* Convergence Ready Button - Enhanced positioning */}
        {canConverge && (
          <div className="absolute bottom-36 left-0 right-0 z-30 flex justify-center px-4">
            <Button 
              onClick={() => setShowConvergence(true)}
              className="h-12 px-8 rounded-2xl bg-gradient-to-r from-yellow-500/90 to-orange-500/90 hover:from-yellow-600/90 hover:to-orange-600/90 backdrop-blur-xl border-2 border-yellow-400/60 animate-pulse transition-all duration-300 font-bold shadow-2xl shadow-yellow-500/40"
            >
              <span className="text-sm flex items-center gap-2">
                🔁 Convergence Ready!
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Help Modal */}
      <QuickHelpModal
        isOpen={showQuickHelp}
        onClose={() => setShowQuickHelp(false)}
      />

      {/* Hybrid Upgrades Modal - Enhanced with proper containment */}
      {showHybridUpgrades && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHybridUpgrades(false);
            }
          }}
        >
          <Card className="w-full max-w-[90%] max-h-[70%] overflow-hidden bg-gradient-to-br from-purple-900/95 to-cyan-900/95 border-2 border-purple-400/50 relative flex flex-col backdrop-blur-xl shadow-2xl rounded-2xl">
            {/* Enhanced glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none rounded-2xl" />
            
            <div className="flex justify-between items-center p-4 border-b border-purple-400/30 flex-shrink-0">
              <h2 className="text-lg font-bold text-white">Hybrid Nexus</h2>
              <Button
                onClick={() => setShowHybridUpgrades(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 p-1 h-8 w-8 rounded-full"
              >
                <X size={16} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <HybridUpgradesPanel
                gameState={gameState}
                onPurchaseUpgrade={purchaseUpgrade}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Convergence Modal - Enhanced with proper containment */}
      {showConvergence && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConvergence(false);
            }
          }}
        >
          <div className="max-w-[90%] w-full max-w-xs">
            <ConvergenceSystem
              gameState={gameState}
              onPerformConvergence={performConvergence}
            />
            <div className="mt-4 text-center">
              <Button 
                onClick={() => setShowConvergence(false)}
                variant="outline"
                size="sm"
                className="border-gray-400 text-gray-300 hover:bg-white/10"
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
