
import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { UpgradeNode3D } from '../UpgradeNode3D';
import { enhancedHybridUpgrades } from '../../data/EnhancedHybridUpgrades';

interface ScifiSpatialUpgradeSystemProps {
  playerPosition: Vector3;
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
}

export const ScifiSpatialUpgradeSystem: React.FC<ScifiSpatialUpgradeSystemProps> = ({
  playerPosition,
  gameState,
  onUpgradeClick
}) => {
  // Generate random positions for upgrades throughout the space
  const upgradePositions = useMemo(() => {
    const positions: Array<{
      id: string;
      position: [number, number, number];
      upgrade: any;
    }> = [];

    enhancedHybridUpgrades.forEach((upgrade, index) => {
      // Distribute upgrades in a 3D grid with some randomness
      const gridSize = 25;
      const x = (Math.random() - 0.5) * gridSize * 2;
      const y = Math.random() * 15; // Keep upgrades above ground level
      const z = (Math.random() - 0.5) * gridSize * 2;

      positions.push({
        id: upgrade.id,
        position: [x, y, z],
        upgrade
      });
    });

    return positions;
  }, []);

  // Only render upgrades within reasonable distance to maintain performance
  const visibleUpgrades = useMemo(() => {
    const renderDistance = 50;
    return upgradePositions.filter(({ position }) => {
      const distance = playerPosition.distanceTo(new Vector3(...position));
      return distance < renderDistance;
    });
  }, [upgradePositions, playerPosition]);

  const checkUpgradeUnlocked = (upgrade: any): boolean => {
    const { requirements } = upgrade;
    
    if (requirements.mana && gameState.mana < requirements.mana) return false;
    if (requirements.energy && gameState.energyCredits < requirements.energy) return false;
    if (requirements.nexusShards && gameState.nexusShards < requirements.nexusShards) return false;
    if (requirements.convergenceCount && gameState.convergenceCount < requirements.convergenceCount) return false;
    
    return true;
  };

  return (
    <group>
      {visibleUpgrades.map(({ id, position, upgrade }) => (
        <UpgradeNode3D
          key={id}
          upgrade={upgrade}
          position={position}
          isUnlocked={checkUpgradeUnlocked(upgrade)}
          isPurchased={gameState.purchasedUpgrades?.includes(upgrade.id) || false}
          canAfford={gameState.nexusShards >= upgrade.cost}
          onClick={() => onUpgradeClick(upgrade.id)}
          realm="scifi"
        />
      ))}
      
      {/* Add some navigation beacons */}
      {visibleUpgrades.map(({ id, position }, index) => (
        <mesh key={`beacon-${id}`} position={[position[0], position[1] + 2, position[2]]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      ))}
    </group>
  );
};
