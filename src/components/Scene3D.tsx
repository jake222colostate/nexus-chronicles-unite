import React, { Suspense, useRef, useMemo, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { FloatingIsland } from './FloatingIsland';
import { UpgradeNode3D } from './UpgradeNode3D';
import { TapEffect3D } from './TapEffect3D';
import { MagicStaffWeaponSystem } from './MagicStaffWeaponSystem';
import { VerticalCameraController } from './VerticalCameraController';
import { FixedScifiController } from './FixedScifiController';
import { ChunkSystem } from './ChunkSystem';
import { FantasyEnvironmentOrchestrator } from './FantasyEnvironmentOrchestrator';
import { Sun } from './Sun';
import { enhancedHybridUpgrades } from '../data/EnhancedHybridUpgrades';
import { Vector3 } from 'three';
import { ImprovedFantasyLighting } from './ImprovedFantasyLighting';
import { ScifiDefenseSystem } from './scifi/ScifiDefenseSystem';

interface Scene3DProps {
  realm: 'fantasy' | 'scifi';
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
  isTransitioning?: boolean;
  showTapEffect?: boolean;
  onTapEffectComplete?: () => void;
  onMeteorDestroyed?: () => void;
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
  onTapEffectComplete,
  onMeteorDestroyed
}) => {
  console.log('Scene3D: Rendering with realm:', realm);
  
  const cameraRef = useRef();
  const [enemyPositions, setEnemyPositions] = useState<Vector3[]>([]);
  const [playerPosition, setPlayerPosition] = useState<Vector3>(new Vector3(0, 2, 10));

  // FIXED: Throttled callback to prevent excessive updates
  const handlePlayerPositionUpdate = useCallback((position: Vector3) => {
    setPlayerPosition(prev => {
      // Only update if position changed significantly
      if (prev.distanceTo(position) > 0.5) {
        console.log('Scene3D: Player position updated to:', position);
        return position.clone();
      }
      return prev;
    });
  }, []);

  // OPTIMIZED: Throttled enemy position updates
  const handleEnemyPositionUpdate = useCallback((positions: Vector3[]) => {
    setEnemyPositions(prev => {
      if (prev.length !== positions.length) {
        console.log('Scene3D: Enemy positions updated, count:', positions.length);
        return positions;
      }
      return prev;
    });
  }, []);

  const handleEnemyHit = useCallback((index: number, damage: number) => {
    console.log(`Scene3D: Enemy ${index} hit for ${damage} damage`);
  }, []);

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
    <div className="w-full h-full relative overflow-hidden">
      <Canvas
        className={`transition-all duration-500 ${isTransitioning ? 'opacity-70 blur-sm' : 'opacity-100'}`}
        dpr={[0.5, 1]}
        performance={{ min: 0.8 }}
        style={{ width: '375px', height: '667px' }}
        gl={{ 
          antialias: false, 
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={[0, 2, 10]}
            fov={60}
            near={0.1}
            far={200}
            aspect={375 / 667}
            onUpdate={(cam) => cam.updateProjectionMatrix()}
          >
            {/* Only show weapon system in fantasy realm */}
            {realm === 'fantasy' && (
              <MagicStaffWeaponSystem 
                upgradeLevel={gameState.weaponUpgradeLevel || 0}
                visible={true}
                enemyPositions={enemyPositions}
                onHitEnemy={handleEnemyHit}
                damage={10 + (gameState.weaponUpgradeLevel || 0) * 5}
                playerPosition={playerPosition}
              />
            )}
          </PerspectiveCamera>

          {/* FIXED: Use different controllers for different realms */}
          {realm === 'fantasy' ? (
            <VerticalCameraController 
              camera={cameraRef.current}
              minY={-5}
              maxY={15}
              sensitivity={0.8}
              onPositionChange={handlePlayerPositionUpdate}
            />
          ) : (
            <FixedScifiController
              position={[0, 2, 10]}
              onPositionChange={handlePlayerPositionUpdate}
              enemyPositions={enemyPositions}
            />
          )}

          {/* OPTIMIZED: Simpler lighting for sci-fi */}
          {realm === 'fantasy' ? (
            <ImprovedFantasyLighting />
          ) : (
            <>
              <ambientLight intensity={0.6} color="#ffffff" />
              <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
            </>
          )}

          <FloatingIsland realm={realm} />
          
          {/* Only render complex systems in their respective realms */}
          {realm === 'scifi' && <ScifiDefenseSystem onMeteorDestroyed={onMeteorDestroyed} />}

          {realm === 'fantasy' && (
            <ChunkSystem
              playerPosition={playerPosition}
              chunkSize={50}
              renderDistance={100}
            >
              {(chunks) => (
                <FantasyEnvironmentOrchestrator
                  chunks={chunks}
                  chunkSize={50}
                  realm={realm}
                  playerPosition={playerPosition}
                  onEnemyPositionUpdate={handleEnemyPositionUpdate}
                />
              )}
            </ChunkSystem>
          )}

          {upgradeNodes}

          {showTapEffect && onTapEffectComplete && (
            <TapEffect3D realm={realm} onComplete={onTapEffectComplete} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
});

Scene3D.displayName = 'Scene3D';
