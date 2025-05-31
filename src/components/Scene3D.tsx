
import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { FloatingIsland } from './FloatingIsland';
import { UpgradeNode3D } from './UpgradeNode3D';
import { TapEffect3D } from './TapEffect3D';
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
      >
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={[0, 0, 8]}
            fov={60}
            near={0.1}
            far={100}
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

          {/* Clean, simple lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* Floating Island Base */}
          <FloatingIsland realm={realm} />

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
        </Suspense>
      </Canvas>

      {/* Loading fallback */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-sm">Loading 3D Scene...</div>
        </div>
      }>
        <div />
      </Suspense>
    </div>
  );
};
