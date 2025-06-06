
import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { EnemySystem, EnemySystemHandle, EnemyData } from './EnemySystem';
import { WizardStaffWeapon } from './WizardStaffWeapon';
import { Enemy } from './Enemy';
import { GreatFairy } from './GreatFairy';
import { BatMinion } from './BatMinion';
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

  // Calculate weapon upgrade level based on maxUnlockedUpgrade (ensure non-negative)
  const weaponUpgradeLevel = Math.max(0, Math.min(Math.floor(maxUnlockedUpgrade / 3), 2));

  // Initialize shared damage system with console logging
  const damageSystem = useEnemyDamageSystem({
    playerZ: cameraPosition.z,
    upgradeLevel: weaponUpgradeLevel
  });

  console.log('Fantasy3DScene: Damage system initialized:', !!damageSystem);

  const handleEnemiesChange = useCallback(
    (list: EnemyData[]) => {
      console.log(`Fantasy3DScene: Enemies changed, count: ${list.length}`);
      setEnemies(list);
      if (onEnemyCountChange) onEnemyCountChange(list.length);
    },
    [onEnemyCountChange]
  );

  // Handle enemy hits - only remove from main system if actually dead
  const handleEnemyHit = useCallback(
    (id: string) => {
      // Only remove enemy from main system - damage is handled by weapon
      enemySystemRef.current?.damageEnemy(id, 1);
      console.log(`Enemy ${id} removed from main enemy system`);
    },
    []
  );

  // Initialize enemies in damage system when they spawn
  const handleEnemyInitialize = useCallback((id: string, position: [number, number, number]) => {
    console.log(`Fantasy3DScene: Initializing enemy ${id} in damage system at position:`, position);
    if (damageSystem) {
      damageSystem.initializeEnemy(id, position);
    }
  }, [damageSystem]);

  // Spawn bat minions when fairy spawns them
  const handleSpawnMinions = useCallback((fairyId: string, fairyPosition: [number, number, number]) => {
    console.log(`Fantasy3DScene: Fairy ${fairyId} spawning minions`);
    // The minions will be handled by the EnemySystem automatically
  }, []);

  // Clean up damage system when enemies are removed from main system
  React.useEffect(() => {
    if (!damageSystem) return;
    
    const currentEnemyIds = new Set(enemies.map(e => e.id));
    damageSystem.enemyHealths.forEach(healthEnemy => {
      if (!currentEnemyIds.has(healthEnemy.id)) {
        console.log(`Cleaning up enemy ${healthEnemy.id} from damage system`);
        damageSystem.removeEnemy(healthEnemy.id);
      }
    });
  }, [enemies, damageSystem]);

  // Get fairy position for bat minions
  const getFairyPosition = useCallback((parentId: string): Vector3 | undefined => {
    const fairy = enemies.find(e => e.id === parentId && e.type === 'great_fairy');
    return fairy ? new Vector3(...fairy.position) : undefined;
  }, [enemies]);

  // Don't render weapon system until damage system is ready
  if (!damageSystem) {
    console.log('Fantasy3DScene: Waiting for damage system to initialize...');
  }

  return (
    <Suspense fallback={null}>
      {/* Camera controller with proper character height */}
      <Enhanced360Controller
        position={[0, 1.7, -10]}
        onPositionChange={onPositionChange}
      />

      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#2d1b4e']} />

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

      {/* Enemy System - spawns enemies ahead of player */}
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

      {/* Render enemies with health data from damage system - handling all types */}
      {enemies.map((enemy, index) => {
        const enemyHealth = damageSystem?.getEnemyHealth(enemy.id);
        
        if (enemy.type === 'great_fairy') {
          return (
            <GreatFairy
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={cameraPosition}
              enemyHealth={enemyHealth}
              onReachPlayer={() => handleEnemyHit(enemy.id)}
              onInitialize={handleEnemyInitialize}
              onSpawnMinions={handleSpawnMinions}
            />
          );
        } else if (enemy.type === 'bat_minion') {
          const fairyPosition = enemy.parentId ? getFairyPosition(enemy.parentId) : undefined;
          const orbitalOffset = (index % 3) * (Math.PI * 2 / 3);
          
          return (
            <BatMinion
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={cameraPosition}
              fairyPosition={fairyPosition}
              enemyHealth={enemyHealth}
              onReachPlayer={() => handleEnemyHit(enemy.id)}
              onInitialize={handleEnemyInitialize}
              orbitalOffset={orbitalOffset}
            />
          );
        } else {
          return (
            <Enemy
              key={enemy.id}
              enemyId={enemy.id}
              position={enemy.position}
              playerPosition={cameraPosition}
              enemyHealth={enemyHealth}
              onReachPlayer={() => handleEnemyHit(enemy.id)}
              onInitialize={handleEnemyInitialize}
            />
          );
        }
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
