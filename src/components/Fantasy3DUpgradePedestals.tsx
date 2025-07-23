
import React from 'react';
import { Vector3 } from 'three';
import { EnhancedUpgradePedestal } from './EnhancedUpgradePedestal';

interface Fantasy3DUpgradePedestalsProps {
  upgrades: any[];
  cameraPosition: Vector3;
  currentManaRef: React.MutableRefObject<number>;
  purchasedUpgrades: Set<number>;
  onUpgradeClick: (upgrade: any) => void;
}

export const Fantasy3DUpgradePedestals: React.FC<Fantasy3DUpgradePedestalsProps> = ({
  upgrades,
  cameraPosition,
  currentManaRef,
  purchasedUpgrades,
  onUpgradeClick
}) => {
  return (
    <>
      {upgrades.map((upgrade) => {
        const distance = cameraPosition.distanceTo(new Vector3(...upgrade.position));
        if (distance > 50) return null; // Reduced render distance for performance
        
        // Determine model type based on sections of five
        // Upgrades 1-4, 6-9, 11-14, etc. use podium
        // Upgrades 5, 10, 15, etc. use obelisk
        const modelType = upgrade.id % 5 === 0 ? 'obelisk' : 'podium';
        
        return (
          <EnhancedUpgradePedestal
            key={upgrade.id}
            position={upgrade.position}
            upgrade={upgrade}
            isUnlocked={upgrade.unlocked}
            isPurchased={purchasedUpgrades.has(upgrade.id)}
            canAfford={currentManaRef.current >= upgrade.cost}
            onInteract={() => onUpgradeClick(upgrade)}
            tier={upgrade.tier + 1}
            modelType={modelType}
          />
        );
      })}
    </>
  );
};
