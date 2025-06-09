
import React, { Suspense, useRef, useState, useCallback, useMemo } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { InfiniteChunkLoader } from './InfiniteChunkLoader';
import { InfiniteTerrainSystem } from './InfiniteTerrainSystem';
import { EnemySystem, EnemySystemHandle, EnemyData } from './EnemySystem';
import { WizardStaffWeapon } from './WizardStaffWeapon';
import { VampireBat } from './VampireBat';
import { useEnemyDamageSystem } from '../hooks/useEnemyDamageSystem';

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
  const enemySystemRef = useRef<EnemySystemHandle>(null);
  const [enemies, setEnemies] = useState<EnemyData[]>([]);

  // Calculate weapon upgrade level
  const weaponUpgradeLevel = Math.max(0, Math.min(Math.floor(maxUnlockedUpgrade / 3), 2));

  // Stabilize player Z
  const stablePlayerZ = useMemo(() => {
    return Math.floor(cameraPosition.z / 10) * 10;
  }, [Math.floor(cameraPosition.z / 10)]);

  // Initialize damage system
  const damageSystem = useEnemyDamageSystem({
    playerZ: stablePlayerZ,
    upgradeLevel: weaponUpgradeLevel
  });

  // Enemy change handler
  const handleEnemiesChange = useCallback(
    (list: EnemyData[]) => {
      console.log(`Fantasy3DScene: Enemies changed, count: ${list.length}`);
      setEnemies(list);
      if (onEnemyCountChange) onEnemyCountChange(list.length);
    },
    [onEnemyCountChange]
  );

  // Enemy hit handler
  const handleEnemyHit = useCallback(
    (id: string) => {
      enemySystemRef.current?.damageEnemy(id, 1);
      console.log(`Enemy ${id} removed from enemy system`);
    },
    []
  );

  // Enemy initialize handler
  const handleEnemyInitialize = useCallback((id: string, position: [number, number, number]) => {
    console.log(`Fantasy3DScene: Initializing enemy ${id} in damage system at position:`, position);
    if (damageSystem) {
      damageSystem.initializeEnemy(id, position);
    }
  }, [damageSystem]);

  return (
    <Suspense fallback={null}>
      {/* Camera controller */}
      <Enhanced360Controller
        position={[0, 2, 5]}
        onPositionChange={onPositionChange}
      />

      {/* Background color */}
      <color attach="background" args={['#2d1b4e']} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* New infinite chunk-based terrain system */}
      <InfiniteChunkLoader
        playerPosition={cameraPosition}
        chunkSize={chunkSize}
        renderDistance={Math.min(renderDistance, 200)}
      >
        {(chunks) => (
          <InfiniteTerrainSystem
            chunks={chunks}
            chunkSize={chunkSize}
          />
        )}
      </InfiniteChunkLoader>

      {/* Enemy System */}
      <EnemySystem
        ref={enemySystemRef}
        playerPosition={cameraPosition}
        maxEnemies={3}
        spawnDistance={80}
        onEnemiesChange={handleEnemiesChange}
        onEnemyInitialize={handleEnemyInitialize}
      />

      {/* Wizard Staff Weapon */}
      {damageSystem && (
        <WizardStaffWeapon 
          enemies={enemies} 
          onEnemyHit={handleEnemyHit}
          upgradeLevel={weaponUpgradeLevel}
          playerPosition={cameraPosition}
          onEnemyKilled={onEnemyKilled}
          damageSystem={damageSystem}
        />
      )}

      {/* Render vampire bat enemies with proper models */}
      {enemies.map((enemy) => {
        const enemyHealth = damageSystem?.getEnemyHealth(enemy.id);
        
        return (
          <VampireBat
            key={enemy.id}
            enemyId={enemy.id}
            position={enemy.position}
            playerPosition={cameraPosition}
            enemyHealth={enemyHealth}
            onReachPlayer={() => handleEnemyHit(enemy.id)}
            onInitialize={handleEnemyInitialize}
          />
        );
      })}

      {/* Contact shadows */}
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
