
import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { Enhanced360Controller } from './Enhanced360Controller';
import { MagicStaffWeaponSystem } from './MagicStaffWeaponSystem';
import { OptimizedProjectileSystem } from './OptimizedProjectileSystem';
import { LeechEnemy } from './LeechEnemy';
import { ChunkSystem } from './ChunkSystem';

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

export const Fantasy3DScene: React.FC<Fantasy3DSceneProps> = ({
  cameraPosition,
  onPositionChange,
  realm,
  maxUnlockedUpgrade,
  upgradeSpacing,
  onTierProgression,
  chunkSize,
  renderDistance,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage
}) => {
  const [staffTipPosition, setStaffTipPosition] = useState(new Vector3());
  const [enemies, setEnemies] = useState<Array<{ id: string; position: Vector3 }>>([]);
  const weaponUpgradeLevel = Math.min(Math.floor(maxUnlockedUpgrade / 5), 2);

  // Generate some test enemies near the player
  React.useEffect(() => {
    const testEnemies = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const distance = 10 + i * 5;
      testEnemies.push({
        id: `enemy_${i}`,
        position: new Vector3(
          cameraPosition.x + Math.cos(angle) * distance,
          cameraPosition.y,
          cameraPosition.z + Math.sin(angle) * distance
        )
      });
    }
    setEnemies(testEnemies);
  }, [cameraPosition.x, cameraPosition.z]);

  const handleStaffTipUpdate = useCallback((position: Vector3) => {
    setStaffTipPosition(position.clone());
  }, []);

  const handleEnemyHit = useCallback((enemyIndex: number, damage: number) => {
    console.log(`Enemy ${enemyIndex} hit for ${damage} damage`);
    if (onEnemyKilled) {
      onEnemyKilled();
    }
    // Remove the hit enemy for now (later we can add health system)
    setEnemies(prev => prev.filter((_, index) => index !== enemyIndex));
  }, [onEnemyKilled]);

  // Update enemy count
  React.useEffect(() => {
    if (onEnemyCountChange) {
      onEnemyCountChange(enemies.length);
    }
  }, [enemies.length, onEnemyCountChange]);

  return (
    <>
      {/* Simple, consistent lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        castShadow 
      />

      {/* Environment with chunk system */}
      <ChunkSystem
        playerPosition={cameraPosition}
        chunkSize={chunkSize}
        renderDistance={renderDistance}
      >
        {(chunks) => (
          <OptimizedFantasyEnvironment
            chunks={chunks}
            chunkSize={chunkSize}
            realm={realm}
            playerPosition={cameraPosition}
          />
        )}
      </ChunkSystem>

      {/* Camera Controller */}
      <Enhanced360Controller
        position={cameraPosition}
        onPositionChange={onPositionChange}
        movementSpeed={8}
        mouseSensitivity={0.002}
        enableFly={true}
        groundHeight={1.6}
      />

      {/* Magic Staff Weapon System */}
      <MagicStaffWeaponSystem
        upgradeLevel={weaponUpgradeLevel}
        visible={true}
        onStaffTipPositionUpdate={handleStaffTipUpdate}
      />

      {/* Projectile System */}
      <OptimizedProjectileSystem
        staffTipPosition={staffTipPosition}
        targetPositions={enemies.map(enemy => enemy.position)}
        damage={weaponDamage}
        fireRate={1000}
        onHitEnemy={handleEnemyHit}
      />

      {/* Test Enemies */}
      {enemies.map((enemy, index) => (
        <LeechEnemy
          key={enemy.id}
          playerPosition={cameraPosition}
          startPosition={enemy.position}
          onReachPlayer={() => handleEnemyHit(index, weaponDamage)}
          health={5}
          visible={true}
        />
      ))}

      {/* Debug: Show staff tip position */}
      <mesh position={staffTipPosition}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
    </>
  );
};
