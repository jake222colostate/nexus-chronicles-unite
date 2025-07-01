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
      // Create a scattered pattern in front of the player
      const height = i * 6 + 5; // Each upgrade is 6 units higher, starting at y=5 (closer to player)
      
      // Use a wider horizontal spread and ensure all upgrades are in front of player
      const angleOffset = (i % 8) * (Math.PI / 4); // 8 positions around a circle
      const layer = Math.floor(i / 8); // Which "layer" of depth
      
      // Better spacing - start closer and spread out more
      const minZ = 8; // Closer minimum distance in front of player
      const z = minZ + (layer * 5) + Math.random() * 3; // More progressive depth with spacing
      
      // Better horizontal spread
      const radius = 8 + layer * 3 + Math.random() * 4; // Better radius progression
      const x = Math.cos(angleOffset) * radius + (Math.random() - 0.5) * 5; // More spread
      
      const tier = Math.floor(i / 10) + 1; // Tiers 1-5, 10 upgrades per tier
      
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