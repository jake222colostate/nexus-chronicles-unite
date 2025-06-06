
import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { EnemySystem, EnemySystemHandle, EnemyData } from './EnemySystem';
import { WizardStaffWeapon } from './WizardStaffWeapon';
import { Enemy } from './Enemy';
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
  const weaponUpgradeLevel = Math.max(0, Math.min(Math.floor(maxUnlockedUpgrade / 3), 2)); // 0-2 based on upgrade progression

  // Initialize shared damage system
  const damageSystem = useEnemyDamageSystem({
    playerZ: cameraPosition.z,
    upgradeLevel: weaponUpgradeLevel
  });

  const handleEnemiesChange = useCallback(
    (list: EnemyData[]) => {
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
    console.log(`Fantasy3DScene: Initializing enemy ${id} at position:`, position);
    damageSystem.initializeEnemy(id, position);
  }, [damageSystem]);

  // Clean up damage system when enemies are removed from main system
  React.useEffect(() => {
    const currentEnemyIds = new Set(enemies.map(e => e.id));
    damageSystem.enemyHealths.forEach(healthEnemy => {
      if (!currentEnemyIds.has(healthEnemy.id)) {
        console.log(`Cleaning up enemy ${healthEnemy.id} from damage system`);
        damageSystem.removeEnemy(healthEnemy.id);
      }
    });
  }, [enemies, damageSystem]);

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
        renderDistance={Math.min(renderDistance, 150)} // Reduced render distance
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
        maxEnemies={3} // Reduced max enemies
        spawnDistance={80} // Reduced spawn distance
        onEnemiesChange={handleEnemiesChange}
        onEnemyInitialize={handleEnemyInitialize}
      />

      {/* Wizard Staff Weapon */}
      <WizardStaffWeapon 
        enemies={enemies} 
        onEnemyHit={handleEnemyHit}
        upgradeLevel={weaponUpgradeLevel}
        playerPosition={cameraPosition}
        onEnemyKilled={onEnemyKilled}
      />

      {/* Render enemies with health data from damage system */}
      {enemies.map(enemy => {
        const enemyHealth = damageSystem.getEnemyHealth(enemy.id);
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
      })}

      {/* Simplified contact shadows */}
      <ContactShadows 
        position={[0, -1.4, cameraPosition.z]} 
        opacity={0.05} // Very low opacity
        scale={15} // Smaller scale
        blur={2} 
        far={4} // Reduced range
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
