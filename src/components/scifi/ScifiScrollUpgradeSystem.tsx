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
      const height = i * 4 + 15; // Each upgrade is 4 units higher, starting at y=15
      
      // Use a wider horizontal spread and ensure all upgrades are in front of player
      const angleOffset = (i % 8) * (Math.PI / 4); // 8 positions around a circle
      const layer = Math.floor(i / 8); // Which "layer" of depth
      
      // Ensure all upgrades are in front of player (positive z)
      const minZ = 5; // Minimum distance in front of player
      const maxZ = 25; // Maximum distance in front of player
      const z = minZ + (layer * 3) + Math.random() * 2; // Progressive depth with randomness
      
      // Wider horizontal spread
      const radius = 6 + layer * 2 + Math.random() * 3; // Increase radius with layer
      const x = Math.cos(angleOffset) * radius + (Math.random() - 0.5) * 4; // Add randomness
      
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