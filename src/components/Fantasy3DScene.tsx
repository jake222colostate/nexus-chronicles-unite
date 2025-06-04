
import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { FantasyScreenshotEnvironment } from './FantasyScreenshotEnvironment';
import { EnemySystem, EnemySystemHandle, EnemyData } from './EnemySystem';
import { WizardStaffWeapon } from './WizardStaffWeapon';
import { MagicStaffWeaponSystem } from './MagicStaffWeaponSystem';

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

  // Calculate weapon upgrade level based on maxUnlockedUpgrade
  const weaponUpgradeLevel = Math.min(Math.floor(maxUnlockedUpgrade / 3), 2); // 0-2 based on upgrade progression

  const handleEnemiesChange = useCallback(
    (list: EnemyData[]) => {
      setEnemies(list);
      if (onEnemyCountChange) onEnemyCountChange(list.length);
    },
    [onEnemyCountChange]
  );

  const handleEnemyHit = useCallback(
    (id: string) => {
      enemySystemRef.current?.damageEnemy(id, 1);
      if (onEnemyKilled) onEnemyKilled();
    },
    [onEnemyKilled]
  );

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
        renderDistance={Math.min(renderDistance, 200)} // Cap render distance for 60fps
      >
        {(chunks: ChunkData[]) => (
          <FantasyScreenshotEnvironment
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
        maxEnemies={5}
        spawnDistance={100}
        onEnemiesChange={handleEnemiesChange}
      />

      {/* Wizard Staff Weapon */}
      <WizardStaffWeapon enemies={enemies} onEnemyHit={handleEnemyHit} />

      {/* Magic Staff Weapon System - New upgraded weapon system */}
      <MagicStaffWeaponSystem
        upgradeLevel={weaponUpgradeLevel}
        visible={true}
      />

      {/* Simplified contact shadows */}
      <ContactShadows 
        position={[0, -1.4, cameraPosition.z]} 
        opacity={0.1} // Reduced opacity
        scale={20} // Reduced scale
        blur={1} 
        far={6} // Reduced range
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
