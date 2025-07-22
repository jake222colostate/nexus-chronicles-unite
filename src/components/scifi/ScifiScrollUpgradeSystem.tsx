import React, { useMemo, useCallback } from 'react';
import { Vector3 } from 'three';
import { Asteroid } from './Asteroid';
import { useThree } from '@react-three/fiber';

interface ScifiScrollUpgradeSystemProps {
  energyCredits: number;
  onUpgradeClick: (upgradeId: string) => void;
  purchasedUpgrades: string[];
  cameraY: number;
}

export const ScifiScrollUpgradeSystem: React.FC<ScifiScrollUpgradeSystemProps> = ({
  energyCredits,
  onUpgradeClick,
  purchasedUpgrades,
  cameraY = 0
}) => {
  const { camera } = useThree();

  // Generate 50 upgrade positions scattered in front of the player
  const upgradePositions = useMemo(() => {
    const positions: Array<{id: string, position: Vector3, tier: number}> = [];
    
    for (let i = 0; i < 50; i++) {
      // Simple grid pattern for debugging - should definitely be visible
      const height = 5 + (i % 5) * 3; // Y between 5-17
      const x = -10 + (i % 10) * 2; // X between -10 and 8  
      const z = -2; // Fixed Z at -2 (should be visible)
      
      const tier = Math.floor(i / 10) + 1;
      
      positions.push({
        id: `scifi-scroll-upgrade-${i}`,
        position: new Vector3(x, height, z),
        tier
      });
    }
    
    return positions;
  }, []);

  // Show all upgrades within view distance (no unlock requirement)
  const visibleUpgrades = useMemo(() => {
    const cameraPos = camera.position;
    const viewDistance = 120; // Much larger view distance to see all upgrades
    
    return upgradePositions.filter(upgrade => {
      const distance = upgrade.position.distanceTo(cameraPos);
      // Also check if upgrade is roughly in front of camera (positive z relative to camera)
      const relativePos = upgrade.position.clone().sub(cameraPos);
      return distance <= viewDistance && relativePos.z > -10; // Allow some behind camera
    });
  }, [upgradePositions, camera.position]);

  // Add console log to debug
  console.log(`ScifiScrollUpgradeSystem: Camera at y=${camera.position.y}, showing ${visibleUpgrades.length} upgrades`);

  return (
    <>
      {visibleUpgrades.map(({ id, position, tier }, index) => (
        !purchasedUpgrades.includes(id) && (
          <Asteroid
            key={id}
            position={position}
            health={5}
            isUpgrade={true}
            upgradeId={id}
            onUpgradeClick={onUpgradeClick}
            upgradeIndex={tier} // Use tier for visual variety
          />
        )
      ))}
    </>
  );
};