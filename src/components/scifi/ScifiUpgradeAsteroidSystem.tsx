import React, { useMemo, useState } from 'react';
import { Vector3 } from 'three';
import { Asteroid } from './Asteroid';
import { ScifiUpgradeModal } from './ScifiUpgradeModal';
import { scifiUpgrades } from '../../data/ScifiUpgrades';

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
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);

  // Generate upgrade asteroid positions using actual sci-fi upgrades
  const upgradePositions = useMemo(() => {
    const positions: Array<{id: string, position: Vector3, upgradeData: any}> = [];
    
    // Create positions for each sci-fi upgrade that hasn't been purchased
    scifiUpgrades.forEach((upgrade, index) => {
      if (purchasedUpgrades.includes(upgrade.id)) return;
      
      const angle = (index / scifiUpgrades.length) * Math.PI * 2;
      const radius = 15 + (index % 2) * 5; // Varying distances
      const height = 3 + Math.sin(index * 0.8) * 2; // Varying heights
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height;
      
      positions.push({
        id: upgrade.id,
        position: new Vector3(x, y, z),
        upgradeData: upgrade
      });
    });
    
    return positions;
  }, [purchasedUpgrades]);

  const handleUpgradeClick = (upgradeId: string) => {
    setSelectedUpgrade(upgradeId);
    onUpgradeClick(upgradeId);
  };

  return (
    <>
      {upgradePositions.map(({ id, position, upgradeData }, index) => (
        <Asteroid
          key={id}
          position={position}
          health={5}
          isUpgrade={true}
          upgradeId={id}
          onUpgradeClick={handleUpgradeClick}
          upgradeIndex={index}
        />
      ))}
      
      {selectedUpgrade && (
        <ScifiUpgradeModal
          upgradeId={selectedUpgrade}
          energyCredits={energyCredits}
          onPurchase={(upgradeId) => {
            // Handle purchase logic would go here
            setSelectedUpgrade(null);
          }}
          onClose={() => setSelectedUpgrade(null)}
        />
      )}
    </>
  );
};