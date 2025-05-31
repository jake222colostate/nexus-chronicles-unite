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
import { GroundEnemySystem, GroundEnemy } from './GroundEnemySystem';
import { Enemy3DSystem, Enemy3DData } from './Enemy3DSystem';
import { CombatUpgradeSystem, CombatUpgrade } from './CombatUpgradeSystem';
import { MuzzleFlash } from './MuzzleFlash';
import { WaveCompleteMessage } from './WaveCompleteMessage';
import { JourneyTracker } from './JourneyTracker';
import { AutoWeapon } from './AutoWeapon';
import { WeaponUpgradeSystem, WeaponUpgrade } from './WeaponUpgradeSystem';
import { CrossRealmUpgradeSystem, CrossRealmUpgrade } from './CrossRealmUpgradeSystem';
import { crossRealmUpgrades } from '../data/CrossRealmUpgrades';

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
  weaponUpgrades?: { [key: string]: number };
  crossRealmUpgrades?: { [key: string]: number };
  waveNumber: number;
  enemiesKilled: number;
  fantasyJourneyDistance: number;
  scifiJourneyDistance: number;
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

const defaultWeaponUpgrades: WeaponUpgrade[] = [
  {
    id: 'damage',
    name: 'Damage',
    description: 'Increases projectile damage',
    icon: '💥',
    level: 0,
    maxLevel: 20,
    baseCost: 25,
    effect: { damage: 1 }
  },
  {
    id: 'fireRate',
    name: 'Fire Rate',
    description: 'Decreases time between shots',
    icon: '⚡',
    level: 0,
    maxLevel: 15,
    baseCost: 40,
    effect: { fireRate: 200 }
  },
  {
    id: 'range',
    name: 'Range',
    description: 'Increases weapon targeting range',
    icon: '🎯',
    level: 0,
    maxLevel: 10,
    baseCost: 60,
    effect: { range: 5 }
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
        weaponUpgrades: parsedState.weaponUpgrades || {},
        crossRealmUpgrades: parsedState.crossRealmUpgrades || {},
        waveNumber: parsedState.waveNumber || 1,
        enemiesKilled: parsedState.enemiesKilled || 0,
        fantasyJourneyDistance: parsedState.fantasyJourneyDistance || 0,
        scifiJourneyDistance: parsedState.scifiJourneyDistance || 0,
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
      weaponUpgrades: {},
      crossRealmUpgrades: {},
      waveNumber: 1,
      enemiesKilled: 0,
      fantasyJourneyDistance: 0,
      scifiJourneyDistance: 0,
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
  const [showCombatUpgrades, setShowCombatUpgrades] = useState(false);
  const [showWeaponUpgrades, setShowWeaponUpgrades] = useState(false);
  const [showCrossRealmUpgrades, setShowCrossRealmUpgrades] = useState(false);
  const [enemies, setEnemies] = useState<Enemy3DData[]>([]);
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const [showWaveComplete, setShowWaveComplete] = useState(false);
  const [playerTakingDamage, setPlayerTakingDamage] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 1.6, z: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stable references to prevent re-renders
  const stableFantasyBuildings = useMemo(() => gameState.fantasyBuildings || {}, [gameState.fantasyBuildings]);
  const stableScifiBuildings = useMemo(() => gameState.scifiBuildings || {}, [gameState.scifiBuildings]);
  const stablePurchasedUpgrades = useMemo(() => gameState.purchasedUpgrades || [], [gameState.purchasedUpgrades]);
  const purchasedUpgradesCount = stablePurchasedUpgrades.length;

  // Initialize buff system with stable dependencies
  const buffSystem = useBuffSystem(stableFantasyBuildings, stableScifiBuildings);

  // Cross-realm upgrades with current levels
  const crossRealmUpgradesWithLevels = useMemo(() => {
    return crossRealmUpgrades.map(upgrade => ({
      ...upgrade,
      level: gameState.crossRealmUpgrades?.[upgrade.id] || 0
    }));
  }, [gameState.crossRealmUpgrades]);

  // Combat upgrades with current levels
  const combatUpgrades = useMemo(() => {
    return defaultCombatUpgrades.map(upgrade => ({
      ...upgrade,
      level: gameState.combatUpgrades[upgrade.id] || 0
    }));
  }, [gameState.combatUpgrades]);

  // Weapon upgrades with current levels
  const weaponUpgrades = useMemo(() => {
    return defaultWeaponUpgrades.map(upgrade => ({
      ...upgrade,
      level: gameState.weaponUpgrades?.[upgrade.id] || 0
    }));
  }, [gameState.weaponUpgrades]);

  // Combat stats with improved damage calculation
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

  // Weapon stats calculation
  const weaponStats = useMemo(() => {
    const damageLevel = gameState.weaponUpgrades?.damage || 0;
    const fireRateLevel = gameState.weaponUpgrades?.fireRate || 0;
    const rangeLevel = gameState.weaponUpgrades?.range || 0;
    
    return {
      damage: 1 + damageLevel,
      fireRate: Math.max(500, 2000 - (fireRateLevel * 200)),
      range: 10 + (rangeLevel * 5)
    };
  }, [gameState.weaponUpgrades]);

  // Current journey distance calculation
  const currentJourneyDistance = useMemo(() => {
    return currentRealm === 'fantasy' 
      ? gameState.fantasyJourneyDistance 
      : gameState.scifiJourneyDistance;
  }, [currentRealm, gameState.fantasyJourneyDistance, gameState.scifiJourneyDistance]);

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
  }, []);

  // Game loop with proper journey tracking
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
  }, []);

  // Handle player position updates from 3D world
  const handlePlayerPositionUpdate = useCallback((position: { x: number; y: number; z: number }) => {
    setPlayerPosition(position);
  }, []);

  // Handle journey distance updates (only forward progress)
  const handleJourneyUpdate = useCallback((distance: number) => {
    setGameState(prev => ({
      ...prev,
      [currentRealm === 'fantasy' ? 'fantasyJourneyDistance' : 'scifiJourneyDistance']: distance
    }));
  }, [currentRealm]);

  // Enhanced production calculation with cross-realm upgrades
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

    // Apply cross-realm upgrade bonuses
    crossRealmUpgradesWithLevels.forEach(upgrade => {
      if (upgrade.level > 0) {
        if (upgrade.effect.manaPerSecond && upgrade.realm === 'fantasy') {
          manaRate += upgrade.effect.manaPerSecond * upgrade.level;
        }
        if (upgrade.effect.energyPerSecond && upgrade.realm === 'scifi') {
          energyRate += upgrade.effect.energyPerSecond * upgrade.level;
        }
      }
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
  }, [stableFantasyBuildings, stableScifiBuildings, purchasedUpgradesCount, buffSystem, crossRealmUpgradesWithLevels]);

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
        weaponUpgrades: gameState.weaponUpgrades,
        crossRealmUpgrades: gameState.crossRealmUpgrades,
        waveNumber: gameState.waveNumber,
        enemiesKilled: gameState.enemiesKilled,
        fantasyJourneyDistance: gameState.fantasyJourneyDistance,
        scifiJourneyDistance: gameState.scifiJourneyDistance,
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

  const purchaseWeaponUpgrade = useCallback((upgradeId: string) => {
    const upgrade = weaponUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(1.8, upgrade.level));
    if (gameState.mana >= cost && upgrade.level < upgrade.maxLevel) {
      setGameState(prev => ({
        ...prev,
        mana: prev.mana - cost,
        weaponUpgrades: {
          ...prev.weaponUpgrades,
          [upgradeId]: (prev.weaponUpgrades?.[upgradeId] || 0) + 1
        }
      }));
    }
  }, [gameState.mana, weaponUpgrades]);

  const purchaseCrossRealmUpgrade = useCallback((upgradeId: string) => {
    const upgrade = crossRealmUpgradesWithLevels.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(1.6, upgrade.level));
    const currency = currentRealm === 'fantasy' ? gameState.mana : gameState.energyCredits;
    
    if (currency >= cost && upgrade.level < upgrade.maxLevel) {
      setGameState(prev => ({
        ...prev,
        mana: currentRealm === 'fantasy' ? prev.mana - cost : prev.mana,
        energyCredits: currentRealm === 'scifi' ? prev.energyCredits - cost : prev.energyCredits,
        crossRealmUpgrades: {
          ...prev.crossRealmUpgrades,
          [upgradeId]: (prev.crossRealmUpgrades?.[upgradeId] || 0) + 1
        }
      }));
    }
  }, [gameState.mana, gameState.energyCredits, currentRealm, crossRealmUpgradesWithLevels]);

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

  const handleShowCombatUpgrades = useCallback(() => {
    setShowCombatUpgrades(true);
  }, []);

  const handleShowWeaponUpgrades = useCallback(() => {
    setShowWeaponUpgrades(true);
  }, []);

  const handleShowCrossRealmUpgrades = useCallback(() => {
    setShowCrossRealmUpgrades(true);
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
        document.body.removeChild(popup);
      }, 600);
    }
  }, []);

  const handleTapEffectComplete = useCallback(() => {
    setShowTapEffect(false);
  }, []);

  // Combat event handlers with scaling rewards
  const handleEnemyReachPlayer = useCallback((enemy: Enemy3DData) => {
    setPlayerTakingDamage(true);
    setGameState(prev => ({ ...prev, mana: Math.max(0, prev.mana - 3) }));
    setTimeout(() => setPlayerTakingDamage(false), 500);
  }, []);

  const handleEnemyDestroyed = useCallback((enemy: Enemy3DData) => {
    const manaReward = Math.floor(8 + (currentJourneyDistance / 10));
    
    setGameState(prev => ({ 
      ...prev, 
      mana: prev.mana + manaReward,
      enemiesKilled: prev.enemiesKilled + 1
    }));

    // Show floating reward
    const floatingReward = document.createElement('div');
    floatingReward.textContent = `+${manaReward} Mana`;
    floatingReward.className = 'fixed text-yellow-400 font-bold text-lg pointer-events-none z-50 animate-fade-in';
    floatingReward.style.left = '50%';
    floatingReward.style.top = '40%';
    floatingReward.style.transform = 'translateX(-50%)';
    document.body.appendChild(floatingReward);
    
    setTimeout(() => {
      floatingReward.style.transform = 'translateX(-50%) translateY(-30px)';
      floatingReward.style.opacity = '0';
      floatingReward.style.transition = 'all 0.8s ease-out';
    }, 100);
    
    setTimeout(() => {
      if (floatingReward.parentNode) {
        document.body.removeChild(floatingReward);
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
  }, [gameState.enemiesKilled, currentJourneyDistance]);

  const handleEnemyHit = useCallback((enemyId: string, damage: number) => {
    if ((window as any).damageEnemy) {
      (window as any).damageEnemy(enemyId, damage);
    }
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

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  }, []);

  const canConverge = gameState.mana + gameState.energyCredits >= 1000;
  const convergenceProgress = Math.min(((gameState.mana + gameState.energyCredits) / 1000) * 100, 100);

  return (
    <div className={`h-[667px] w-full relative overflow-hidden bg-black ${playerTakingDamage ? 'animate-pulse bg-red-900/20' : ''}`}>
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
        enemyCount={enemies.length}
      />

      {/* Main Game Area */}
      <div className="absolute inset-0 pt-16 pb-40">
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

        {/* 3D Enemy System with realistic models */}
        <Enemy3DSystem
          realm={currentRealm}
          onEnemyReachPlayer={handleEnemyReachPlayer}
          onEnemyDestroyed={handleEnemyDestroyed}
          spawnRate={Math.max(1000, 2500 - (gameState.waveNumber * 100))}
          maxEnemies={Math.min(10, 4 + Math.floor(gameState.waveNumber / 2))}
          journeyDistance={currentJourneyDistance}
          onEnemiesUpdate={setEnemies}
        />

        {/* Auto Weapon System */}
        <AutoWeapon
          enemies={enemies}
          combatStats={weaponStats}
          onEnemyHit={handleEnemyHit}
          onMuzzleFlash={handleMuzzleFlash}
        />

        {/* Muzzle Flash Effect */}
        <MuzzleFlash
          isVisible={showMuzzleFlash}
          onComplete={handleMuzzleFlashComplete}
        />

        {/* Wave Complete Message */}
        <WaveCompleteMessage
          isVisible={showWaveComplete}
          waveNumber={gameState.waveNumber}
          onComplete={handleWaveCompleteComplete}
        />

        {/* Realm Transition Effect */}
        <RealmTransition currentRealm={currentRealm} isTransitioning={isTransitioning} />

        {/* Weapon Upgrade Button */}
        <div className="absolute top-20 right-4 z-30">
          <Button 
            onClick={handleShowWeaponUpgrades}
            className="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500/95 to-red-500/95 hover:from-orange-600/95 hover:to-red-600/95 backdrop-blur-xl border border-orange-400/70 transition-all duration-300 font-bold shadow-lg shadow-orange-500/30 p-0"
          >
            🏹
          </Button>
        </div>

        {/* Cross-Realm Upgrades Button */}
        <div className="absolute top-20 left-4 z-30">
          <Button 
            onClick={handleShowCrossRealmUpgrades}
            className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500/95 to-purple-500/95 hover:from-indigo-600/95 hover:to-purple-600/95 backdrop-blur-xl border border-indigo-400/70 transition-all duration-300 font-bold shadow-lg shadow-indigo-500/30 p-0"
          >
            🏰
          </Button>
        </div>

        {/* Convergence Ready Button */}
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
