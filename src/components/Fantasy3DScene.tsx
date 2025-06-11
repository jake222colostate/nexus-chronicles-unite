
import React, { Suspense, useRef, useMemo, useCallback } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { CasualFog } from './CasualFog';
import { Sun } from './Sun';

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
}

export const Fantasy3DScene: React.FC<Fantasy3DSceneProps> = React.memo(({
  cameraPosition,
  onPositionChange,
  realm,
  chunkSize,
  renderDistance,
  onEnemyCountChange,
  onEnemyKilled,
  maxUnlockedUpgrade
}) => {
  // Notify that there are no enemies
  React.useEffect(() => {
    if (onEnemyCountChange) onEnemyCountChange(0);
  }, [onEnemyCountChange]);

  return (
    <Suspense fallback={null}>
      <Enhanced360Controller
        position={[0, 2, 20]}
        onPositionChange={onPositionChange}
      />

      <color attach="background" args={['#2d1b4e']} />

      {/* Simplified fog for 60fps */}
      <fog attach="fog" args={['#2d1b4e', 30, 150]} />

      {/* Simplified ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2d4a2d" />
      </mesh>

      {/* Reduced lighting for 60fps */}
      <ambientLight intensity={0.5} />
      <Sun position={[10, 20, 5]} />

      {/* Optimized chunk system with strict performance limits */}
      <ChunkSystem
        playerPosition={cameraPosition}
        chunkSize={chunkSize}
        renderDistance={Math.min(renderDistance, 100)}
      >
        {(chunks: ChunkData[]) => (
          <OptimizedFantasyEnvironment
            chunks={chunks.slice(0, 50)} // Limit chunks for 60fps
            chunkSize={chunkSize}
            realm={realm}
            playerPosition={cameraPosition}
          />
        )}
      </ChunkSystem>

      {/* Simplified contact shadows */}
      <ContactShadows 
        position={[0, -1.4, cameraPosition.z]} 
        opacity={0.03}
        scale={10}
        blur={1} 
        far={3}
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
