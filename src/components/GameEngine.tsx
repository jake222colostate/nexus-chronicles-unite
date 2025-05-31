import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { OptimizedMapSkillTreeView } from './OptimizedMapSkillTreeView';
import { RealmTransition } from './RealmTransition';
import { ConvergenceSystem } from './ConvergenceSystem';
import { BottomActionBar } from './BottomActionBar';
import { TopHUD } from './TopHUD';
import { EnhancedTapButton } from './EnhancedTapButton';
import { EnhancedParticleBackground } from './EnhancedParticleBackground';
import { useBuffSystem } from './CrossRealmBuffSystem';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { QuickHelpModal } from './QuickHelpModal';
import { CombatUpgradeSystem, CombatUpgrade } from './CombatUpgradeSystem';
import { MuzzleFlash } from './MuzzleFlash';
import { WaveCompleteMessage } from './WaveCompleteMessage';
import { OptimizedJourneyTracker } from './OptimizedJourneyTracker';
import { PerformanceTracker } from './PerformanceTracker';

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
  combatUpgrades: { [key: string]: number };
  waveNumber: number;
  enemiesKilled: number;
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

const defaultCombatUpgrades: CombatUpgrade[] = [
  {
    id: 'manaBlaster',
    name: 'Mana Blaster',
    description: 'Basic magical projectile',
    icon: '🧙‍♂️',
    level: 0,
    maxLevel: 10,
    baseCost: 50,
    effect: { damage: 1 }
  },
  {
    id: 'explosionRadius',
    name: 'Explosion Radius',
    description: 'Increases splash damage area',
    icon: '💥',
    level: 0,
    maxLevel: 8,
    baseCost: 100,
    effect: { explosionRadius: 2 }
  },
  {
    id: 'fireRate',
    name: 'Fire Rate',
    description: 'Faster projectile shooting',
    icon: '⚡',
    level: 0,
    maxLevel: 15,
    baseCost: 75,
    effect: { fireRate: 0.8 }
  },
  {
    id: 'accuracy',
    name: 'Accuracy Boost',
    description: 'Better aim and precision',
    icon: '🎯',
    level: 0,
    maxLevel: 5,
    baseCost: 150,
    effect: { accuracy: 0.2 }
  },
  {
    id: 'autoAim',
    name: 'Auto-Aim Range',
    description: 'Automatically targets enemies',
    icon: '🔮',
    level: 0,
    maxLevel: 7,
    baseCost: 200,
    effect: { autoAimRange: 5 }
  }
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
        combatUpgrades: parsedState.combatUpgrades || {},
        waveNumber: parsedState.waveNumber || 1,
        enemiesKilled: parsedState.enemiesKilled || 0,
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
      combatUpgrades: {},
      waveNumber: 1,
      enemiesKilled: 0,
    };
  });

  const [currentRealm, setCurrentRealm] = useState<'fantasy' | 'scifi'>('fantasy');
  const [showConvergence, setShowConvergence] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTapEffect, setShowTapEffect] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(() => {
    return !localStorage.getItem('celestialNexusHelpDismissed');
  });
  const [showCombatUpgrades, setShowCombatUpgrades] = useState(false);
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const [showWaveComplete, setShowWaveComplete] = useState(false);
  const [playerTakingDamage, setPlayerTakingDamage] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1.6, z: 0 });
  const [actualJourneyDistance, setActualJourneyDistance] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stable references to prevent infinite loops
  const stableFantasyBuildings = useMemo(() => gameState.fantasyBuildings || {}, [gameState.fantasyBuildings]);
  const stableScifiBuildings = useMemo(() => gameState.scifiBuildings || {}, [gameState.scifiBuildings]);
  const stablePurchasedUpgrades = useMemo(() => gameState.purchasedUpgrades || [], [gameState.purchasedUpgrades]);
  const purchasedUpgradesCount = stablePurchasedUpgrades.length;

  const buffSystem = useBuffSystem(stableFantasyBuildings, stableScifiBuildings);

  // Combat upgrades calculation
  const combatUpgrades = useMemo(() => {
    return defaultCombatUpgrades.map(upgrade => ({
      ...upgrade,
      level: gameState.combatUpgrades[upgrade.id] || 0
    }));
  }, [gameState.combatUpgrades]);

  const combatStats = useMemo(() => {
    const manaBlasterLevel = gameState.combatUpgrades.manaBlaster || 0;
    const fireRateLevel = gameState.combatUpgrades.fireRate || 0;
    const autoAimLevel = gameState.combatUpgrades.autoAim || 0;
    
    return {
      damage: 1 + manaBlasterLevel * 2,
      fireRate: Math.max(500, 1000 - (fireRateLevel * 80)),
      explosionRadius: 2 + (gameState.combatUpgrades.explosionRadius || 0) * 2,
      accuracy: 1 + (gameState.combatUpgrades.accuracy || 0) * 0.2,
      autoAimRange: autoAimLevel > 0 ? 5 + autoAimLevel * 3 : 0
    };
  }, [gameState.combatUpgrades]);

  // Performance monitoring
  const handlePerformanceUpdate = useCallback((fps: number) => {
    if (fps < 30) {
      console.warn('Low FPS detected:', fps);
    }
  }, []);

  // Offline progress calculation
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

  // Game loop with reduced frequency
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setGameState(prev => {
        const newState = {
          ...prev,
          mana: prev.mana + prev.manaPerSecond / 5,
          energyCredits: prev.energyCredits + prev.energyPerSecond / 5,
          lastSaveTime: Date.now(),
        };
        
        // Save less frequently for better performance
        if (Math.random() < 0.1) {
          localStorage.setItem('celestialNexusGame', JSON.stringify(newState));
        }
        return newState;
      });
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // Empty dependency array to prevent recreation

  const handlePlayerPositionUpdate = useCallback((position: { x: number; y: number; z: number }) => {
    setPlayerPosition(position);
  }, []);

  const handleJourneyUpdate = useCallback((distance: number) => {
    setActualJourneyDistance(distance);
  }, []);

  // Production calculation effect - stabilized
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
  }, [stableFantasyBuildings, stableScifiBuildings, purchasedUpgradesCount, buffSystem]);

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
        combatUpgrades: gameState.combatUpgrades,
        waveNumber: gameState.waveNumber,
        enemiesKilled: gameState.enemiesKilled,
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

  const purchaseCombatUpgrade = useCallback((upgradeId: string) => {
    const upgrade = combatUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
    if (gameState.mana >= cost && upgrade.level < upgrade.maxLevel) {
      setGameState(prev => ({
        ...prev,
        mana: prev.mana - cost,
        combatUpgrades: {
          ...prev.combatUpgrades,
          [upgradeId]: (prev.combatUpgrades[upgradeId] || 0) + 1
        }
      }));
    }
  }, [gameState.mana, combatUpgrades]);

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

  const handleShowCombatUpgrades = useCallback(() => {
    setShowCombatUpgrades(true);
  }, []);

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
        if (document.body.contains(popup)) {
          document.body.removeChild(popup);
        }
      }, 600);
    }
  }, []);

  const handleTapEffectComplete = useCallback(() => {
    setShowTapEffect(false);
  }, []);

  const handleEnemyDestroyed = useCallback(() => {
    // Calculate reward based on distance and upgrades
    const baseReward = 1;
    const distanceBonus = Math.floor(actualJourneyDistance / 50);
    const upgradeBonus = Math.floor(purchasedUpgradesCount / 5);
    const totalReward = baseReward + distanceBonus + upgradeBonus;

    setGameState(prev => ({ 
      ...prev, 
      mana: prev.mana + totalReward,
      enemiesKilled: prev.enemiesKilled + 1
    }));

    // Show reward popup
    const popup = document.createElement('div');
    popup.textContent = `+${totalReward} Mana`;
    popup.className = 'fixed text-green-400 font-bold text-xl pointer-events-none z-50 animate-fade-in';
    popup.style.left = '50%';
    popup.style.top = '40%';
    popup.style.transform = 'translateX(-50%)';
    document.body.appendChild(popup);
    
    setTimeout(() => {
      popup.style.transform = 'translateX(-50%) translateY(-30px)';
      popup.style.opacity = '0';
      popup.style.transition = 'all 0.8s ease-out';
    }, 100);
    
    setTimeout(() => {
      if (document.body.contains(popup)) {
        document.body.removeChild(popup);
      }
    }, 900);

    // Check for wave complete
    if ((gameState.enemiesKilled + 1) % 15 === 0) {
      setShowWaveComplete(true);
      setGameState(prev => ({ 
        ...prev, 
        mana: prev.mana + 150,
        waveNumber: prev.waveNumber + 1
      }));
    }
  }, [actualJourneyDistance, purchasedUpgradesCount, gameState.enemiesKilled]);

  const handleEnemyReachPlayer = useCallback(() => {
    setPlayerTakingDamage(true);
    setGameState(prev => ({ ...prev, mana: Math.max(0, prev.mana - 3) }));
    setTimeout(() => setPlayerTakingDamage(false), 500);
  }, []);

  const handleMuzzleFlash = useCallback(() => {
    setShowMuzzleFlash(true);
  }, []);

  const handleMuzzleFlashComplete = useCallback(() => {
    setShowMuzzleFlash(false);
  }, []);

  const handleWaveCompleteComplete = useCallback(() => {
    setShowWaveComplete(false);
  }, []);

  const canConverge = gameState.mana + gameState.energyCredits >= 1000;
  const convergenceProgress = Math.min(((gameState.mana + gameState.energyCredits) / 1000) * 100, 100);

  return (
    <div className={`h-[667px] w-full relative overflow-hidden bg-black ${playerTakingDamage ? 'animate-pulse bg-red-900/20' : ''}`}>
      <PerformanceTracker onPerformanceUpdate={handlePerformanceUpdate} />
      
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      
      <EnhancedParticleBackground realm={currentRealm} />

      <OptimizedJourneyTracker 
        playerPosition={playerPosition}
        onJourneyUpdate={handleJourneyUpdate}
      />

      <TopHUD
        realm={currentRealm}
        mana={gameState.mana}
        energyCredits={gameState.energyCredits}
        nexusShards={gameState.nexusShards}
        convergenceProgress={convergenceProgress}
        manaPerSecond={gameState.manaPerSecond}
        energyPerSecond={gameState.energyPerSecond}
        onHelpClick={() => setShowQuickHelp(true)}
        onCombatUpgradesClick={() => setShowCombatUpgrades(true)}
      />

      <div className="absolute inset-0 pt-16 pb-40">
        <OptimizedMapSkillTreeView
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
          onJourneyUpdate={handleJourneyUpdate}
        />

        <MuzzleFlash
          isVisible={showMuzzleFlash}
          onComplete={handleMuzzleFlashComplete}
        />

        <WaveCompleteMessage
          isVisible={showWaveComplete}
          waveNumber={gameState.waveNumber}
          onComplete={handleWaveCompleteComplete}
        />

        <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />

        {canConverge && (
          <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 z-30">
            <Button 
              onClick={() => setShowConvergence(true)}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-yellow-500/95 to-orange-500/95 hover:from-yellow-600/95 hover:to-orange-600/95 backdrop-blur-xl border border-yellow-400/70 animate-pulse transition-all duration-300 font-bold shadow-lg shadow-yellow-500/30"
            >
              🔁 Convergence Ready!
            </Button>
          </div>
        )}
      </div>

      <BottomActionBar
        currentRealm={currentRealm}
        onRealmChange={switchRealm}
        onTap={handleTapResource}
        isTransitioning={isTransitioning}
        playerDistance={actualJourneyDistance}
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

      {showQuickHelp && (
        <QuickHelpModal
          isOpen={showQuickHelp}
          onClose={() => setShowQuickHelp(false)}
        />
      )}

      {showCombatUpgrades && (
        <CombatUpgradeSystem
          upgrades={combatUpgrades}
          mana={gameState.mana}
          onUpgrade={purchaseCombatUpgrade}
          onClose={() => setShowCombatUpgrades(false)}
        />
      )}
    </div>
  );
};

export default GameEngine;
