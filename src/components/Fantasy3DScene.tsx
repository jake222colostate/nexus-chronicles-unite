
import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { FantasyScreenshotEnvironment } from './FantasyScreenshotEnvironment';
import { EnemySystem, EnemySystemHandle, EnemyData } from './EnemySystem';
import { WizardStaffWeapon } from './WizardStaffWeapon';
import { MagicStaffWeaponSystem } from './MagicStaffWeaponSystem';
import { AutomaticWeaponSystem } from './AutomaticWeaponSystem';
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
  onEnemyKilled?: (reward: number) => void;
  weaponStats: { damage: number; fireRate: number; range: number };
  combatStats?: {
    damage: number;
    fireRate: number;
    autoAimRange: number;
  };
}

export const Fantasy3DScene: React.FC<Fantasy3DSceneProps> = React.memo(({
  cameraPosition,
  onPositionChange,
  realm,
  chunkSize,
  renderDistance,
  onEnemyCountChange,
  onEnemyKilled,
  weaponStats,
  combatStats,
  maxUnlockedUpgrade
}) => {
  const enemySystemRef = useRef<EnemySystemHandle>(null);
  const [enemies, setEnemies] = useState<EnemyData[]>([]);
  const { damageEnemy } = useEnemyDamageSystem();

  // Calculate weapon upgrade level based on maxUnlockedUpgrade (ensure non-negative)
  const weaponUpgradeLevel = Math.max(0, Math.min(Math.floor(maxUnlockedUpgrade / 3), 2));

  const handleEnemiesChange = useCallback(
    (list: EnemyData[]) => {
      setEnemies(list);
      if (onEnemyCountChange) onEnemyCountChange(list.length);
    },
    [onEnemyCountChange]
  );

  const handleEnemyHit = useCallback(
    (id: string, damage: number) => {
      // First try the damage system hook
      const damageResult = damageEnemy(id, damage);
      
      // If that fails, fall back to the enemy system
      if (!damageResult) {
        const result = enemySystemRef.current?.damageEnemy(id, damage);
        if (result?.killed && onEnemyKilled) onEnemyKilled(result.reward);
      } else if (damageResult.killed && onEnemyKilled) {
        onEnemyKilled(damageResult.reward);
      }
    },
    [damageEnemy, onEnemyKilled]
  );

  // Default combat stats if not provided
  const defaultCombatStats = {
    damage: 2,
    fireRate: 800,
    autoAimRange: 20
  };

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
        renderDistance={Math.min(renderDistance, 200)}
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

      {/* Automatic Weapon System - primary weapon */}
      <AutomaticWeaponSystem
        enemies={enemies}
        combatStats={combatStats || defaultCombatStats}
        onEnemyHit={handleEnemyHit}
      />

      {/* Wizard Staff Weapon - enhanced with combat upgrades */}
      <WizardStaffWeapon
        enemies={enemies}
        weaponStats={weaponStats}
        onEnemyHit={handleEnemyHit}
        combatUpgradeDamage={combatStats?.damage || 0}
      />

      {/* Magic Staff Weapon System - visual weapon display */}
      <MagicStaffWeaponSystem
        upgradeLevel={weaponUpgradeLevel}
        visible={true}
      />

      {/* Simplified contact shadows */}
      <ContactShadows 
        position={[0, -1.4, cameraPosition.z]} 
        opacity={0.1}
        scale={20}
        blur={1} 
        far={6}
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
