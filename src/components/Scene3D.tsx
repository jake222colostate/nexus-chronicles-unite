
import React, { Suspense, useRef, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { FloatingIsland } from './FloatingIsland';
import { UpgradeNode3D } from './UpgradeNode3D';
import { TapEffect3D } from './TapEffect3D';
import { WizardStaff } from './WizardStaff';
import { VerticalCameraController } from './VerticalCameraController';
import { ChunkSystem } from './ChunkSystem';
import { GLBMountainSystem } from './GLBMountainSystem';
import { TreeSystem } from './TreeSystem';
import { EnhancedGrassSystem } from './EnhancedGrassSystem';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { Vector3 } from 'three';
import { FantasyRoadSystem } from './FantasyRoadSystem';
import { FantasyMountainSystem } from './FantasyMountainSystem';
import { FantasyPortalSystem } from './FantasyPortalSystem';
import { FantasySkybox } from './FantasySkybox';

interface Scene3DProps {
  realm: 'fantasy' | 'scifi';
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
  isTransitioning?: boolean;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
}

// Memoized upgrade positions - no need to recalculate every render
const UPGRADE_POSITIONS = [
  { id: 'arcane_ai', x: 0, y: 4, z: 0, tier: 1 },
  { id: 'mana_fountain', x: -2, y: 2.5, z: -1, tier: 2 },
  { id: 'quantum_drive', x: 2, y: 2.5, z: -1, tier: 2 },
  { id: 'arcane_beacon', x: -3, y: 1, z: -2, tier: 3 },
  { id: 'cyber_dragon', x: 0, y: 1, z: -2, tier: 3 },
  { id: 'nano_reactor', x: 3, y: 1, z: -2, tier: 3 },
  { id: 'rift_core', x: -1, y: -0.5, z: -3, tier: 3 },
  { id: 'reality_engine', x: 0, y: -2, z: -4, tier: 4 }
];

export const Scene3D: React.FC<Scene3DProps> = React.memo(({
  realm,
  gameState,
  onUpgradeClick,
  isTransitioning = false,
  showTapEffect = false,
  onTapEffectComplete
}) => {
  const cameraRef = useRef();

  // Stable player position for chunk system
  const playerPosition = useMemo(() => new Vector3(0, 0, 0), []);

  // Memoize upgrade unlock checking to prevent recalculation
  const checkUpgradeUnlocked = useCallback((upgrade: any): boolean => {
    const { requirements } = upgrade;
    
    if (requirements.mana && gameState.mana < requirements.mana) return false;
    if (requirements.energy && gameState.energyCredits < requirements.energy) return false;
    if (requirements.nexusShards && gameState.nexusShards < requirements.nexusShards) return false;
    if (requirements.convergenceCount && gameState.convergenceCount < requirements.convergenceCount) return false;
    
    return true;
  }, [gameState.mana, gameState.energyCredits, gameState.nexusShards, gameState.convergenceCount]);

  // Memoize upgrade nodes to prevent unnecessary re-renders
  const upgradeNodes = useMemo(() => {
    return UPGRADE_POSITIONS.map((position) => {
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
    }).filter(Boolean);
  }, [gameState.purchasedUpgrades, gameState.nexusShards, checkUpgradeUnlocked, onUpgradeClick, realm]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        className={`transition-all duration-500 ${isTransitioning ? 'opacity-70 blur-sm' : 'opacity-100'}`}
        dpr={[1, 1.5]}
        performance={{ min: 0.6 }}
        gl={{ antialias: false, alpha: false }}
      >
        <Suspense fallback={null}>
          {/* Camera with attached wizard staff */}
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={[0, 0, 8]}
            fov={60}
            near={0.1}
            far={200}
          >
            <WizardStaff />
          </PerspectiveCamera>

          {/* Vertical Camera Controller for both realms */}
          <VerticalCameraController 
            camera={cameraRef.current}
            minY={-5}
            maxY={15}
            sensitivity={0.8}
          />

          {/* Fantasy skybox or bright blue sky color */}
          {realm === 'fantasy' ? (
            <FantasySkybox realm={realm} />
          ) : (
            <color attach="background" args={['#87CEEB']} />
          )}

          {/* Floating Island Base */}
          <FloatingIsland realm={realm} />

          {/* Enhanced Environment System */}
          <ChunkSystem
            playerPosition={playerPosition}
            chunkSize={50}
            renderDistance={200}
          >
            {(chunks) => (
              <>
                {/* Fantasy Environment - New GLB Models */}
                {realm === 'fantasy' && (
                  <>
                    <FantasyRoadSystem
                      chunks={chunks}
                      chunkSize={50}
                      realm={realm}
                    />
                    
                    <FantasyMountainSystem
                      chunks={chunks}
                      chunkSize={50}
                      realm={realm}
                    />
                    
                    <FantasyPortalSystem
                      chunks={chunks}
                      chunkSize={50}
                      realm={realm}
                    />
                  </>
                )}
                
                {/* Sci-Fi Environment - Original Systems */}
                {realm === 'scifi' && (
                  <>
                    <EnhancedGrassSystem
                      chunks={chunks}
                      chunkSize={50}
                    />
                    
                    <TreeSystem
                      chunks={chunks}
                      chunkSize={50}
                    />
                    
                    <GLBMountainSystem
                      chunks={chunks}
                      chunkSize={50}
                    />
                  </>
                )}
              </>
            )}
          </ChunkSystem>

          {/* Memoized upgrade nodes */}
          {upgradeNodes}

          {/* Tap Effect */}
          {showTapEffect && onTapEffectComplete && (
            <TapEffect3D realm={realm} onComplete={onTapEffectComplete} />
          )}
        </Suspense>
      </Canvas>

      {/* Loading fallback */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-sm">Loading environment...</div>
        </div>
      }>
        <div />
      </Suspense>
    </div>
  );
});

Scene3D.displayName = 'Scene3D';
