
import React, { Suspense, useMemo, useState } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { CasualFog } from './CasualFog';
import { Sun } from './Sun';
import { LeechEnemy } from './LeechEnemy';
import { SwordWeaponSystem } from './SwordWeaponSystem';

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
}

export const Fantasy3DScene: React.FC<Fantasy3DSceneProps> = React.memo(({
  cameraPosition,
  onPositionChange,
  realm,
  chunkSize,
  renderDistance,
  onEnemyCountChange,
  onEnemyKilled,
  maxUnlockedUpgrade,
  weaponDamage
}) => {
  // Track individual enemies
  const [leechAlive, setLeechAlive] = useState(true);
  const [leechHealth, setLeechHealth] = useState(5);
  const [leechPosition, setLeechPosition] = useState(() =>
    new Vector3(0, 0, cameraPosition.z - 60)
  );

  const leechSpawnPosition = useMemo(
    () => new Vector3(0, 0, cameraPosition.z - 60),
    [leechAlive]
  );


  React.useEffect(() => {
    if (onEnemyCountChange) onEnemyCountChange(leechAlive ? 1 : 0);
  }, [leechAlive, onEnemyCountChange]);

  return (
    <Suspense fallback={null}>
      {/* Camera controller with guaranteed safe valley center starting position */}
      <Enhanced360Controller
        position={[0, 2, 20]} // Start far back in the valley center for absolute safety
        onPositionChange={onPositionChange}
        enemyPositions={leechAlive ? [leechPosition] : []}
      />

      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#2d1b4e']} />

      {/* Subtle fog that fades as you progress */}
      <CasualFog />

      {/* Ground plane to ensure there's always a visible floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#2d4a2d" />
      </mesh>

      {/* Basic ambient light plus warm sun */}
      <ambientLight intensity={0.6} />
      <Sun position={[10, 20, 5]} />

      {leechAlive && (
        <LeechEnemy
          playerPosition={cameraPosition}
          startPosition={leechSpawnPosition}
          health={leechHealth}
          onUpdatePosition={(pos) => setLeechPosition(pos.clone())}
          onReachPlayer={() => {
            setLeechAlive(false);
            onEnemyKilled?.();
          }}
        />
      )}

      <SwordWeaponSystem
        damage={weaponDamage}
        enemyPositions={leechAlive ? [leechPosition] : []}
        onHitEnemy={() => {
          if (leechAlive) {
            setLeechHealth((h) => {
              const nh = h - weaponDamage;
              if (nh <= 0) {
                setLeechAlive(false);
                onEnemyKilled?.();
                return 0;
              }
              return nh;
            });
          }
        }}
      />


      {/* Optimized chunk system with performance limits */}
      <ChunkSystem
        playerPosition={cameraPosition}
        chunkSize={chunkSize}
        renderDistance={Math.min(renderDistance, 150)}
      >
        {(chunks: ChunkData[]) => (
          <OptimizedFantasyEnvironment
            chunks={chunks}
            chunkSize={chunkSize}
            realm={realm}
            playerPosition={cameraPosition}
          />
        )}
      </ChunkSystem>

      {/* Simplified contact shadows */}
      <ContactShadows 
        position={[0, -1.4, cameraPosition.z]} 
        opacity={0.05}
        scale={15}
        blur={2} 
        far={4}
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
