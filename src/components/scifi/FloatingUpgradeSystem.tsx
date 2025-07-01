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

  // Generate 20 upgrade positions in a large area around the player
  const upgradePositions = useMemo(() => {
    const positions: Array<{id: string, position: Vector3}> = [];
    
    for (let i = 0; i < 20; i++) {
      // Distribute upgrades in a large area around the scene
      const angle = (i / 20) * Math.PI * 2;
      const radius = 15 + (i % 3) * 10; // Varying distances
      const height = 2 + Math.sin(i * 0.5) * 3; // Varying heights
      
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 5;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 5;
      const y = height + Math.random() * 2;
      
      positions.push({
        id: `floating-upgrade-${i}`,
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
          onClick={handleUpgradeClick}
        />
      ))}
      
      {selectedUpgrade && (
        <ScifiUpgradeModal
          upgradeId={selectedUpgrade}
          energyCredits={energyCredits}
          onPurchase={handlePurchase}
          onClose={() => setSelectedUpgrade(null)}
        />
      )}
    </>
  );
};