import React, { useState, useMemo } from 'react';
import { Vector3 } from 'three';
import { Asteroid } from './Asteroid';
import { ScifiUpgradeModal } from './ScifiUpgradeModal';
import { scifiUpgrades } from '../../data/ScifiUpgrades';

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

  // Generate fewer upgrade positions with actual sci-fi upgrades
  const upgradePositions = useMemo(() => {
    const positions: Array<{id: string, position: Vector3, upgradeData: any}> = [];
    
    // Create positions for each sci-fi upgrade
    scifiUpgrades.forEach((upgrade, index) => {
      // Don't show purchased upgrades
      if (purchasedUpgrades.includes(upgrade.id)) return;
      
      // Position upgrades in a circle around the player at different heights
      const angle = (index / scifiUpgrades.length) * Math.PI * 2;
      const radius = 25 + (index % 2) * 10; // Varying distances
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
          onPurchase={handlePurchase}
          onClose={() => setSelectedUpgrade(null)}
        />
      )}
    </>
  );
};