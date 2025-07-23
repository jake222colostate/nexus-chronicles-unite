
import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Vector3 } from 'three';

import { FirstPersonController } from './FirstPersonController';




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
  // PERFORMANCE FIX: Simplified camera position validation
  const safeCameraPosition = useMemo(() => {
    if (!cameraPosition || isNaN(cameraPosition.x) || isNaN(cameraPosition.y) || isNaN(cameraPosition.z)) {
      return new Vector3(0, 2, 20);
    }
    return cameraPosition;
  }, [cameraPosition.x, cameraPosition.y, cameraPosition.z]); // Only update on actual position changes

  // No enemies for performance
  useEffect(() => {
    if (onEnemyCountChange) onEnemyCountChange(0);
  }, [onEnemyCountChange]);

  // PERFORMANCE FIX: Simplified position change handler
  const handlePositionChange = (position: Vector3) => {
    if (onPositionChange && position) {
      onPositionChange(position);
    }
  };

  return (
    <Suspense fallback={null}>
      <FirstPersonController
        position={[0, 2, 20]}
        onPositionChange={handlePositionChange}
        canMoveForward={true}
      />

      <color attach="background" args={['#2d1b4e']} />

      {/* Simplified lighting for performance */}
      <ambientLight intensity={0.6} />

      {/* Simple ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#2d4a2d" />
      </mesh>

      {/* All forest elements, weapons, enemies, and complex systems removed for performance */}
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
