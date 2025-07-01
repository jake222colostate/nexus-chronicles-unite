import React, { useState, useMemo } from 'react';
import { Vector3 } from 'three';
import { ScifiUpgradeOrb } from './ScifiUpgradeOrb';
import { ScifiUpgradeModal } from './ScifiUpgradeModal';

interface FloatingUpgradeSystemProps {
  energyCredits: number;
  onPurchaseUpgrade: (upgradeId: string) => void;
  purchasedUpgrades: string[];
}

export const FloatingUpgradeSystem: React.FC<FloatingUpgradeSystemProps> = ({
  energyCredits,
  onPurchaseUpgrade,
  purchasedUpgrades
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);

  // Generate 100 upgrade positions in a large area around the player
  const upgradePositions = useMemo(() => {
    const positions: Array<{id: string, position: Vector3}> = [];
    
    for (let i = 0; i < 100; i++) {
      // Distribute upgrades in a large area around the scene
      const angle = (i / 100) * Math.PI * 2;
      const radius = 20 + (i % 3) * 15; // Varying distances
      const height = 2 + Math.sin(i * 0.5) * 3; // Varying heights
      
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 10;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 10;
      const y = height + Math.random() * 2;
      
      positions.push({
        id: `upgrade-${i}`,
        position: new Vector3(x, y, z)
      });
    }
    
    return positions;
  }, []);

  const handleUpgradeClick = (upgradeId: string) => {
    if (!purchasedUpgrades.includes(upgradeId)) {
      setSelectedUpgrade(upgradeId);
    }
  };

  const handlePurchase = (upgradeId: string) => {
    onPurchaseUpgrade(upgradeId);
    setSelectedUpgrade(null);
  };

  return (
    <>
      {upgradePositions.map(({ id, position }) => (
        <ScifiUpgradeOrb
          key={id}
          id={id}
          position={position}
          onClick={() => {}} // No click functionality - just decoration
        />
      ))}
    </>
  );
};