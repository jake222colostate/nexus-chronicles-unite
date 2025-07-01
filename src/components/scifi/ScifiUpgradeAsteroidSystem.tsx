import React, { useMemo, useRef } from 'react';
import { Vector3, Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { ScifiUpgradeOrb } from './ScifiUpgradeOrb';

interface ScifiUpgradeAsteroidSystemProps {
  onUpgradeClick: (upgradeId: string) => void;
  purchasedUpgrades: string[];
}

export const ScifiUpgradeAsteroidSystem: React.FC<ScifiUpgradeAsteroidSystemProps> = ({
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

  const groupRef = useRef<Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = camera.position.y * 2;
    }
  });

  return (
    <group ref={groupRef}>
      {upgradePositions.map(({ id, position }) => (
        !purchasedUpgrades.includes(id) && (
          <ScifiUpgradeOrb
            key={id}
            id={id}
            position={position}
            onClick={() => onUpgradeClick(id)}
          />
        )
      ))}
    </group>
  );
};