
import React, { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { FloatingIsland } from './FloatingIsland';
import { UpgradeNode3D } from './UpgradeNode3D';
import { ResourceParticles } from './ResourceParticles';
import { TapEffect3D } from './TapEffect3D';
import EnvironmentLoader from './EnvironmentLoader';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';

interface Scene3DProps {
  realm: 'fantasy' | 'scifi';
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
  isTransitioning?: boolean;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

// 3D positioning for upgrade nodes in vertical tree layout
const upgradePositions = [
  { id: 'arcane_ai', x: 0, y: 4, z: 0, tier: 1 },
  { id: 'mana_fountain', x: -2, y: 2.5, z: -1, tier: 2 },
  { id: 'quantum_drive', x: 2, y: 2.5, z: -1, tier: 2 },
  { id: 'arcane_beacon', x: -3, y: 1, z: -2, tier: 3 },
  { id: 'cyber_dragon', x: 0, y: 1, z: -2, tier: 3 },
  { id: 'nano_reactor', x: 3, y: 1, z: -2, tier: 3 },
  { id: 'rift_core', x: -1, y: -0.5, z: -3, tier: 3 },
  { id: 'reality_engine', x: 0, y: -2, z: -4, tier: 4 }
];

export const Scene3D: React.FC<Scene3DProps> = ({
  realm,
  gameState,
  onUpgradeClick,
  isTransitioning = false,
  showTapEffect = false,
  onTapEffectComplete
}) => {
  const cameraRef = useRef();

  // Stabilize the purchased upgrades length to prevent unnecessary recalculations
  const purchasedUpgradesLength = useMemo(() => {
    return gameState.purchasedUpgrades?.length || 0;
  }, [gameState.purchasedUpgrades?.length]);

  // Memoize environment tier calculation with stable dependency
  const environmentTier = useMemo(() => {
    if (purchasedUpgradesLength >= 8) return 5;
    if (purchasedUpgradesLength >= 6) return 4;
    if (purchasedUpgradesLength >= 4) return 3;
    if (purchasedUpgradesLength >= 2) return 2;
    return 1;
  }, [purchasedUpgradesLength]);

  // Stabilize gameState values to prevent unnecessary callback recreations
  const stableGameValues = useMemo(() => ({
    mana: gameState.mana,
    energyCredits: gameState.energyCredits,
    nexusShards: gameState.nexusShards,
    convergenceCount: gameState.convergenceCount,
    purchasedUpgrades: gameState.purchasedUpgrades || []
  }), [
    gameState.mana,
    gameState.energyCredits, 
    gameState.nexusShards,
    gameState.convergenceCount,
    gameState.purchasedUpgrades
  ]);

  const checkUpgradeUnlocked = useCallback((upgrade: any): boolean => {
    const { requirements } = upgrade;
    
    if (requirements.mana && stableGameValues.mana < requirements.mana) return false;
    if (requirements.energy && stableGameValues.energyCredits < requirements.energy) return false;
    if (requirements.nexusShards && stableGameValues.nexusShards < requirements.nexusShards) return false;
    if (requirements.convergenceCount && stableGameValues.convergenceCount < requirements.convergenceCount) return false;
    
    return true;
  }, [stableGameValues]);

  // Memoize upgrade nodes with stable dependencies
  const upgradeNodes = useMemo(() => {
    return upgradePositions.map((position) => {
      const upgrade = enhancedHybridUpgrades.find(u => u.id === position.id);
      if (!upgrade) return null;

      return (
        <UpgradeNode3D
          key={upgrade.id}
          upgrade={upgrade}
          position={[position.x, position.y, position.z]}
          isUnlocked={checkUpgradeUnlocked(upgrade)}
          isPurchased={stableGameValues.purchasedUpgrades.includes(upgrade.id)}
          canAfford={stableGameValues.nexusShards >= upgrade.cost}
          onClick={() => onUpgradeClick(upgrade.id)}
          realm={realm}
        />
      );
    }).filter(Boolean);
  }, [checkUpgradeUnlocked, stableGameValues.purchasedUpgrades, stableGameValues.nexusShards, onUpgradeClick, realm]);

  console.log(`Scene3D: Rendering with environment tier ${environmentTier}, realm: ${realm}`);

  return (
    <div className="w-full h-full relative">
      <Canvas
        className={`transition-all duration-500 ${isTransitioning ? 'opacity-70 blur-sm' : 'opacity-100'}`}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Camera positioned for first-person-like view */}
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={[0, 2, 8]}
            fov={65}
            near={0.1}
            far={200}
          />

          {/* Controls - limited to vertical movement */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={false}
            panSpeed={0.5}
            zoomSpeed={0.5}
            minDistance={4}
            maxDistance={15}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={3 * Math.PI / 4}
          />

          {/* Environment Loader with tier-based models */}
          <EnvironmentLoader tier={environmentTier} />

          {/* Enhanced animated starfield background */}
          <Stars
            radius={80}
            depth={60}
            count={3000}
            factor={6}
            saturation={0.2}
            fade
            speed={0.3}
          />

          {/* Floating Island Base */}
          <FloatingIsland realm={realm} />

          {/* Resource Particles */}
          <ResourceParticles
            realm={realm}
            manaPerSecond={gameState.manaPerSecond}
            energyPerSecond={gameState.energyPerSecond}
          />

          {/* 3D Upgrade Nodes - Memoized */}
          {upgradeNodes}

          {/* Tap Effect */}
          {showTapEffect && onTapEffectComplete && (
            <TapEffect3D realm={realm} onComplete={onTapEffectComplete} />
          )}

          {/* Additional atmospheric fog for depth */}
          <fog attach="fog" args={['#1a0b2e', 30, 100]} />
        </Suspense>
      </Canvas>

      {/* Loading fallback */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-sm">Loading 3D Environment...</div>
        </div>
      }>
        <div />
      </Suspense>
    </div>
  );
};
