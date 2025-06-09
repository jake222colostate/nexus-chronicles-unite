
import React, { Suspense, useRef, useState, useCallback, useMemo } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { EnemySystem, EnemySystemHandle, EnemyData } from './EnemySystem';
import { WizardStaffWeapon } from './WizardStaffWeapon';
import { Enemy } from './Enemy';
import { useEnemyDamageSystem } from '../hooks/useEnemyDamageSystem';
import { CasualFog } from './CasualFog';

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

  // Calculate weapon upgrade level based on maxUnlockedUpgrade (ensure non-negative)
  const weaponUpgradeLevel = Math.max(0, Math.min(Math.floor(maxUnlockedUpgrade / 3), 2));

  // Stabilize player Z to prevent infinite updates - only update every 10 units
  const stablePlayerZ = useMemo(() => {
    return Math.floor(cameraPosition.z / 10) * 10;
  }, [Math.floor(cameraPosition.z / 10)]);

  // Initialize shared damage system with stable player Z
  const damageSystem = useEnemyDamageSystem({
    playerZ: stablePlayerZ,
    upgradeLevel: weaponUpgradeLevel
  });

  // Stable enemy change handler
  const handleEnemiesChange = useCallback(
    (list: EnemyData[]) => {
      console.log(`Fantasy3DScene: Enemies changed, count: ${list.length}`);
      setEnemies(list);
      if (onEnemyCountChange) onEnemyCountChange(list.length);
    },
    [onEnemyCountChange]
  );

  // Handle enemy hits - stable reference
  const handleEnemyHit = useCallback(
    (id: string) => {
      enemySystemRef.current?.damageEnemy(id, 1);
      console.log(`Enemy ${id} removed from enemy system`);
    },
    []
  );

  // Initialize enemies in damage system when they spawn - stable reference
  const handleEnemyInitialize = useCallback((id: string, position: [number, number, number]) => {
    console.log(`Fantasy3DScene: Initializing enemy ${id} in damage system at position:`, position);
    if (damageSystem) {
      damageSystem.initializeEnemy(id, position);
    }
  }, [damageSystem]);

  return (
    <Suspense fallback={null}>
      {/* Camera controller with proper character height and fixed initial position */}
      <Enhanced360Controller
        position={[0, 2, 5]} // Fixed starting position
        onPositionChange={onPositionChange}
      />

      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#2d1b4e']} />

      {/* Subtle fog that fades as you progress */}
      <CasualFog />

      {/* Ground plane to ensure there's always a visible floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2d4a2d" />
      </mesh>

      {/* Basic lighting to ensure visibility */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* REMOVED PathsideMountains - this was creating the mirrored mountain walls */}

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

      {/* Enemy System - spawns vampire bat enemies ahead of player */}
      <EnemySystem
        ref={enemySystemRef}
        playerPosition={cameraPosition}
        maxEnemies={3}
        spawnDistance={80}
        onEnemiesChange={handleEnemiesChange}
        onEnemyInitialize={handleEnemyInitialize}
      />

      {/* Wizard Staff Weapon - only render when damage system is ready */}
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

      {/* Render vampire bat enemies with health data from damage system */}
      {enemies.map((enemy) => {
        const enemyHealth = damageSystem?.getEnemyHealth(enemy.id);
        
        return (
          <Enemy
            key={enemy.id}
            enemyId={enemy.id}
            enemyType="vampire_bat"
            position={enemy.position}
            playerPosition={cameraPosition}
            enemyHealth={enemyHealth}
            onReachPlayer={() => handleEnemyHit(enemy.id)}
            onInitialize={handleEnemyInitialize}
          />
        );
      })}

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
