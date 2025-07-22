
import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { FirstPersonController } from './FirstPersonController';
import { FogBasedChunkSystem, FogChunkData } from './FogBasedChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { CasualFog } from './CasualFog';
import { Sun } from './Sun';
import { MagicStaffWeaponSystem } from './MagicStaffWeaponSystem';
import { LinearForestCorridor } from './LinearForestCorridor';
import { InfinitePathSystem } from './InfinitePathSystem';
import { StartingForestBarrier } from './StartingForestBarrier';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { Performance60FPSManager } from './Performance60FPSManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import { CPUUsageOptimizer } from './CPUUsageOptimizer';
import { CollisionProvider } from '@/lib/CollisionContext';

interface Fantasy3DSceneProps {
  cameraPosition: Vector3;
  onPositionChange: (position: Vector3) => void;
  realm: 'fantasy' | 'scifi';
  maxUnlockedUpgrade: number;
  upgradeSpacing: number;
  onTierProgression: () => void;
  chunkSize: number;
  renderDistance: number;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
  upgradesPurchased?: number;
}

// Simplified enemy system without leech dependency

export const Fantasy3DScene: React.FC<Fantasy3DSceneProps> = React.memo(({
  cameraPosition,
  onPositionChange,
  realm,
  chunkSize,
  renderDistance,
  onEnemyCountChange,
  onEnemyKilled,
  maxUnlockedUpgrade,
  weaponDamage,
  upgradesPurchased = 0
}) => {
  const [enemyCount, setEnemyCount] = useState(0);

  // PERFORMANCE FIX: Simplified camera position validation
  const safeCameraPosition = useMemo(() => {
    if (!cameraPosition || isNaN(cameraPosition.x) || isNaN(cameraPosition.y) || isNaN(cameraPosition.z)) {
      return new Vector3(0, 2, 20);
    }
    return cameraPosition;
  }, [cameraPosition.x, cameraPosition.y, cameraPosition.z]); // Only update on actual position changes

  // Update enemy count for UI
  useEffect(() => {
    if (onEnemyCountChange) onEnemyCountChange(enemyCount);
  }, [enemyCount, onEnemyCountChange]);

  // Enemy positions for weapon system
  const enemyPositions = useMemo(() => {
    // This will be populated by the skeleton system
    return [];
  }, []);

  // PERFORMANCE FIX: Simplified position change handler
  const handlePositionChange = (position: Vector3) => {
    if (onPositionChange && position) {
      onPositionChange(position);
    }
  };

  return (
    <CollisionProvider>
      <Suspense fallback={null}>
        <FirstPersonController
          position={[0, 2, 20]}
          onPositionChange={handlePositionChange}
          canMoveForward={true}
        />

        <color attach="background" args={['#2d1b4e']} />

        {/* CPU and performance optimization */}
        <CPUUsageOptimizer enabled={true} />
        <Performance60FPSManager targetFPS={60} adaptiveQuality={true} />
        <PerformanceMonitor targetFPS={60} />
        <PerformanceOptimizer />
        <CasualFog />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#2d4a2d" />
        </mesh>

        <ambientLight intensity={0.4} />
        <Sun position={[10, 20, 5]} />

        <MagicStaffWeaponSystem
          upgradeLevel={maxUnlockedUpgrade}
          visible={true}
          enemyPositions={enemyPositions}
          onHitEnemy={(index, damage) => {
            // console.log(`Hit enemy ${index} for ${damage} damage`);
            onEnemyKilled?.();
          }}
          damage={weaponDamage}
        />

        {/* Dense forest barrier behind starting point for direction clarity */}
        <StartingForestBarrier playerPosition={safeCameraPosition} />

        {/* Infinite Path System - The walking surface */}
        <InfinitePathSystem
          playerPosition={safeCameraPosition}
          chunksAhead={6}            // Reduced for 60 FPS
          chunksBehind={2}
          renderDistance={20}        // Further reduced for performance
        />

        {/* Re-enable Linear Forest Corridor but only ahead of player */}
        <LinearForestCorridor playerPosition={safeCameraPosition} />

        <FogBasedChunkSystem
          playerPosition={safeCameraPosition}
          chunkSize={chunkSize}
          renderDistance={20}  // Further reduced for 60 FPS
          fogNear={3}          // Even closer fog for performance
          fogFar={18}          // Tighter fog range
        >
          {(chunks: FogChunkData[], fogDistance: number) => (
            <OptimizedFantasyEnvironment
              chunks={chunks}
              chunkSize={chunkSize}
              realm={realm}
              playerPosition={safeCameraPosition}
              onEnemyCountChange={onEnemyCountChange}
              onEnemyKilled={onEnemyKilled}
              weaponDamage={weaponDamage}
              upgradesPurchased={upgradesPurchased}
              fogDistance={18}           // Optimized for 60 FPS
            />
          )}
        </FogBasedChunkSystem>

        <ContactShadows 
          position={[0, -1.4, safeCameraPosition.z]} 
          opacity={0.02}
          scale={8}
          blur={1} 
          far={2}
        />
      </Suspense>
    </CollisionProvider>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
