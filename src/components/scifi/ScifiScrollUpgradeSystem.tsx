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

  // Generate 50 upgrade positions in a vertical spiral pattern
  const upgradePositions = useMemo(() => {
    const positions: Array<{id: string, position: Vector3, tier: number}> = [];
    
    for (let i = 0; i < 50; i++) {
      // Create a vertical spiral pattern going upward with closer spacing
      const height = i * 3 + 10; // Each upgrade is 3 units higher (closer together)
      const angle = (i * 0.5) * Math.PI; // Spiral angle
      const radius = 8 + Math.sin(i * 0.3) * 3; // Varying distance from center
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height;
      
      const tier = Math.floor(i / 10) + 1; // Tiers 1-5, 10 upgrades per tier
      
      positions.push({
        id: `scifi-scroll-upgrade-${i}`,
        position: new Vector3(x, y, z),
        tier
      });
    }
    
    return positions;
  }, []);

  // Show all upgrades within view distance (no unlock requirement)
  const visibleUpgrades = useMemo(() => {
    const cameraPos = camera.position;
    const viewDistance = 80; // Larger view distance to see more upgrades
    
    return upgradePositions.filter(upgrade => {
      const distance = upgrade.position.distanceTo(cameraPos);
      return distance <= viewDistance;
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