
import React, { Suspense, useRef, useState, useEffect } from 'react';
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
  const [environmentTier, setEnvironmentTier] = useState(1);

  // Calculate environment tier based on purchased upgrades - fix re-render issue
  useEffect(() => {
    const upgradeCount = gameState.purchasedUpgrades?.length || 0;
    let newTier = 1;
    
    if (upgradeCount >= 8) newTier = 5;
    else if (upgradeCount >= 6) newTier = 4;
    else if (upgradeCount >= 4) newTier = 3;
    else if (upgradeCount >= 2) newTier = 2;
    
    setEnvironmentTier(newTier);
  }, [gameState.purchasedUpgrades?.length]);

  const checkUpgradeUnlocked = (upgrade: any): boolean => {
    const { requirements } = upgrade;
    
    if (requirements.mana && gameState.mana < requirements.mana) return false;
    if (requirements.energy && gameState.energyCredits < requirements.energy) return false;
    if (requirements.nexusShards && gameState.nexusShards < requirements.nexusShards) return false;
    if (requirements.convergenceCount && gameState.convergenceCount < requirements.convergenceCount) return false;
    
    return true;
  };

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

          {/* 3D Upgrade Nodes */}
          {upgradePositions.map((position) => {
            const upgrade = enhancedHybridUpgrades.find(u => u.id === position.id);
            if (!upgrade) return null;

            return (
              <UpgradeNode3D
                key={upgrade.id}
                upgrade={upgrade}
                position={[position.x, position.y, position.z]}
                isUnlocked={checkUpgradeUnlocked(upgrade)}
                isPurchased={gameState.purchasedUpgrades?.includes(upgrade.id) || false}
                canAfford={gameState.nexusShards >= upgrade.cost}
                onClick={() => onUpgradeClick(upgrade.id)}
                realm={realm}
              />
            );
          })}

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
