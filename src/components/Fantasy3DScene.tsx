
import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { FirstPersonController } from './FirstPersonController';
import { FogBasedChunkSystem, FogChunkData } from './FogBasedChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { CasualFog } from './CasualFog';
import { Sun } from './Sun';
import { MagicStaffWeaponSystem } from './MagicStaffWeaponSystem';
// Temporarily disable decorative GLB-based systems
// import { LinearForestCorridor } from './LinearForestCorridor';
// import { InfinitePathSystem } from './InfinitePathSystem';
// import { OptimizedStartingForestBarrier } from './OptimizedStartingForestBarrier';

import { PerformanceOptimizer } from './PerformanceOptimizer';
import { UltimateFantasyOptimizer } from './UltimateFantasyOptimizer';
import { CollisionProvider } from '@/lib/CollisionContext';
import { initializeAllOptimizations } from '../utils/GLBOptimizationUtils';

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
  const showDecorations = false;

  // Initialize optimization systems once
  useEffect(() => {
    initializeAllOptimizations();
  }, []);

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
      <UltimateFantasyOptimizer playerPosition={safeCameraPosition}>
        <Suspense fallback={null}>
          <FirstPersonController
            position={[0, 2, 20]}
            onPositionChange={handlePositionChange}
            canMoveForward={true}
          />

          <color attach="background" args={['#2d1b4e']} />

          {/* Ultra-aggressive performance optimization */}
          <PerformanceOptimizer />
          <CasualFog />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#2d4a2d" />
          </mesh>

          <ambientLight intensity={0.3} />
          <Sun position={[10, 20, 5]} />

          <MagicStaffWeaponSystem
            upgradeLevel={maxUnlockedUpgrade}
            visible={true}
            enemyPositions={enemyPositions}
            onHitEnemy={(index, damage) => {
              onEnemyKilled?.();
            }}
            damage={weaponDamage}
          />

          {/* Decorative GLB systems temporarily disabled */}
          {showDecorations && (
            <>
              <OptimizedStartingForestBarrier playerPosition={safeCameraPosition} />
              <InfinitePathSystem
                playerPosition={safeCameraPosition}
                chunksAhead={6}
                chunksBehind={1}
                renderDistance={25}
              />
              <LinearForestCorridor playerPosition={safeCameraPosition} />
            </>
          )}

          <FogBasedChunkSystem
            playerPosition={safeCameraPosition}
            chunkSize={chunkSize}
            renderDistance={25}  // Ultra-aggressive reduction
            fogNear={5}
            fogFar={20}          // Very close fog for maximum performance
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
                fogDistance={20}     // Ultra-reduced fog distance
              />
            )}
          </FogBasedChunkSystem>

          <ContactShadows 
            position={[0, -1.4, safeCameraPosition.z]} 
            opacity={0.01}     // Reduced shadow opacity
            scale={6}          // Reduced shadow scale
            blur={0.5}         // Reduced blur for performance
            far={1.5}          // Reduced shadow distance
          />
        </Suspense>
      </UltimateFantasyOptimizer>
    </CollisionProvider>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
