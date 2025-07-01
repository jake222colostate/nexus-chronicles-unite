import React, { useMemo, useState } from 'react';
import { Vector3 } from 'three';
import { Asteroid } from './Asteroid';

interface ScifiUpgradeAsteroidSystemProps {
  energyCredits: number;
  onUpgradeClick: (upgradeId: string) => void;
  purchasedUpgrades: string[];
}

export const ScifiUpgradeAsteroidSystem: React.FC<ScifiUpgradeAsteroidSystemProps> = ({
  energyCredits,
  onUpgradeClick,
  purchasedUpgrades
}) => {
  // Generate upgrade asteroid positions in a circular pattern around the player
  const upgradePositions = useMemo(() => {
    const positions: Array<{id: string, position: Vector3}> = [];
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 15 + (i % 2) * 5; // Varying distances
      const height = 3 + Math.sin(i * 0.8) * 2; // Varying heights
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height;
      
      positions.push({
        id: `upgrade-asteroid-${i}`,
        position: new Vector3(x, y, z)
      });
    }
    
    return positions;
  }, []);

  return (
    <>
      {upgradePositions.map(({ id, position }) => (
        !purchasedUpgrades.includes(id) && (
          <Asteroid
            key={id}
            position={position}
            health={5}
            isUpgrade={true}
            upgradeId={id}
            onUpgradeClick={onUpgradeClick}
          />
        )
      ))}
    </>
  );
};