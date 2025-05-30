import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Menu, X } from 'lucide-react';
import { MapView } from './MapView';
import { RealmTransition } from './RealmTransition';
import { HybridUpgradesPanel } from './HybridUpgradesPanel';
import { ConvergenceSystem } from './ConvergenceSystem';
import { useBuffSystem } from './CrossRealmBuffSystem';
import { hybridUpgrades } from '../data/HybridUpgrades';

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  // Handle tap resource generation
  const handleTapResource = () => {
    setGameState(prev => ({
      ...prev,
      mana: currentRealm === 'fantasy' ? prev.mana + 1 : prev.mana,
      energyCredits: currentRealm === 'scifi' ? prev.energyCredits + 1 : prev.energyCredits,
    }));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const canConverge = gameState.mana + gameState.energyCredits >= 1000;
  const convergenceProgress = Math.min(((gameState.mana + gameState.energyCredits) / 1000) * 100, 100);

  // Enhanced realm switching with proper visual feedback
  const switchRealm = (newRealm: 'fantasy' | 'scifi') => {
    if (newRealm === currentRealm || isTransitioning) return;
    
    setIsTransitioning(true);
    setShowMobileMenu(false);
    
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

  return (
    <div className="h-[667px] w-full relative overflow-hidden">
      {/* Simplified Header - Only title and menu */}
      <div className="absolute top-6 left-0 right-0 z-30 p-3 backdrop-blur-md bg-black/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-white p-1 hover:bg-white/10"
            >
              <Menu size={16} />
            </Button>
            <h1 className="text-sm font-bold text-white drop-shadow-lg truncate">
              Celestial Nexus
            </h1>
          </div>
          {/* Crown icon for convergence status */}
          <div className="flex items-center gap-1 text-yellow-300">
            <Crown size={12} />
            <span className="font-bold text-xs">{gameState.nexusShards}</span>
          </div>
        </div>

        {/* Mobile Menu Overlay - Only resource info */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md p-3 border-t border-white/10">
            {/* Combined Resource Card */}
            <Card className="p-3 backdrop-blur-md bg-gradient-to-r from-purple-800/40 to-cyan-800/40 border-purple-400/40">
              <div className="grid grid-cols-2 gap-3 text-white text-xs">
                <div className="text-center">
                  <div className="text-purple-300 font-medium">Mana</div>
                  <div className="text-lg font-bold">{formatNumber(gameState.mana)}</div>
                  <div className="text-xs opacity-70">+{formatNumber(gameState.manaPerSecond)}/s</div>
                </div>
                <div className="text-center">
                  <div className="text-cyan-300 font-medium">Energy</div>
                  <div className="text-lg font-bold">{formatNumber(gameState.energyCredits)}</div>
                  <div className="text-xs opacity-70">+{formatNumber(gameState.energyPerSecond)}/s</div>
                </div>
              </div>
              {canConverge && (
                <div className="mt-2 pt-2 border-t border-white/20 text-center">
                  <div className="text-yellow-300 text-xs font-medium">
                    Convergence Ready: {convergenceProgress.toFixed(1)}%
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Floating Resource HUD - Positioned under crown */}
      {!showMobileMenu && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="px-4 py-2 backdrop-blur-md bg-gradient-to-r from-purple-800/50 to-cyan-800/50 border-purple-400/50">
            <div className="flex items-center gap-4 text-white text-xs">
              <div className="text-center">
                <div className="text-purple-300">Mana</div>
                <div className="font-bold">{formatNumber(gameState.mana)}</div>
                <div className="text-xs opacity-70">+{formatNumber(gameState.manaPerSecond)}/s</div>
              </div>
              <div className="w-px h-8 bg-white/30"></div>
              <div className="text-center">
                <div className="text-cyan-300">Energy</div>
                <div className="font-bold">{formatNumber(gameState.energyCredits)}</div>
                <div className="text-xs opacity-70">+{formatNumber(gameState.energyPerSecond)}/s</div>
              </div>
              {canConverge && (
                <>
                  <div className="w-px h-8 bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-yellow-300">Conv</div>
                    <div className="font-bold">{convergenceProgress.toFixed(0)}%</div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Map View */}
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
        onTapResource={handleTapResource}
      />

      {/* Realm Transition Effect */}
      <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />

      {/* Enhanced Bottom Button Cluster */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/30">
          {/* Realm Toggle Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => switchRealm('fantasy')}
              disabled={isTransitioning}
              className={`h-12 px-4 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 ${
                currentRealm === 'fantasy'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50 scale-105 border-2 border-purple-400'
                  : 'bg-transparent border-2 border-purple-400/60 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
            >
              <span className="text-xs font-medium">🏰 Fantasy</span>
            </Button>

            <Button
              onClick={() => switchRealm('scifi')}
              disabled={isTransitioning}
              className={`h-12 px-4 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 ${
                currentRealm === 'scifi'
                  ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/50 scale-105 border-2 border-cyan-400'
                  : 'bg-transparent border-2 border-cyan-400/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400'
              } ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
            >
              <span className="text-xs font-medium">🚀 Sci-Fi</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/30"></div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowHybridUpgrades(true)}
              className="h-12 px-4 rounded-full bg-gradient-to-r from-purple-500/80 to-cyan-500/80 hover:from-purple-600/80 hover:to-cyan-600/80 backdrop-blur-sm border-2 border-transparent hover:border-white/30 transition-all duration-300"
            >
              <span className="text-xs font-medium">✨ Hybrid</span>
            </Button>

            {canConverge && (
              <Button 
                onClick={() => setShowConvergence(true)}
                className="h-12 px-4 rounded-full bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-600/80 hover:to-orange-600/80 backdrop-blur-sm border-2 border-yellow-400/60 animate-pulse transition-all duration-300"
              >
                <span className="text-xs font-medium">🔁 Conv</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hybrid Upgrades Modal */}
      {showHybridUpgrades && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full max-h-[400px] overflow-hidden bg-gradient-to-br from-purple-900/95 to-cyan-900/95 border-2 border-purple-400 relative">
            <div className="flex justify-between items-center p-4 border-b border-purple-400">
              <h2 className="text-lg font-bold text-white">Hybrid Nexus</h2>
              <Button
                onClick={() => setShowHybridUpgrades(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 p-1 h-8 w-8"
              >
                <X size={16} />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-80">
              <HybridUpgradesPanel
                gameState={gameState}
                onPurchaseUpgrade={purchaseUpgrade}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Convergence Modal */}
      {showConvergence && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-xs w-full">
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
