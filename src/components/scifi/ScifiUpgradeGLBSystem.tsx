import React, { useMemo, Suspense } from 'react';
import { GLBModel } from '../GLBModelLoader';
import { scifiUpgrades } from '../../data/ScifiUpgrades';

interface ScifiUpgradeGLBSystemProps {
  gameState: any;
  onUpgradeClick: (upgradeId: string) => void;
  checkUpgradeUnlocked: (upgrade: any) => boolean;
}

// Sci-fi upgrade positions arranged around the scene
const SCIFI_UPGRADE_POSITIONS = [
  { id: 'quantum_boost', x: -5, y: 2, z: -5 },
  { id: 'plasma_conduit', x: 5, y: 2, z: -5 },
  { id: 'fusion_core', x: 0, y: 4, z: -8 },
  { id: 'antimatter_engine', x: 0, y: 6, z: -12 }
];

export const ScifiUpgradeGLBSystem: React.FC<ScifiUpgradeGLBSystemProps> = ({
  gameState,
  onUpgradeClick,
  checkUpgradeUnlocked
}) => {
  // Use the same model for all sci-fi upgrades (upgrade_01.glb)
  const modelUrl = 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb';

  const upgradeNodes = useMemo(() => {
    return SCIFI_UPGRADE_POSITIONS.map((position) => {
      const upgrade = scifiUpgrades.find(u => u.id === position.id);
      if (!upgrade) return null;

      // Calculate distance from player (assuming player is at origin)
      const distance = Math.sqrt(position.x * position.x + position.z * position.z);
      const isWithinRange = distance <= 10; // 10 unit interaction range

      return (
        <Suspense key={upgrade.id} fallback={null}>
          <GLBModel
            modelUrl={modelUrl}
            position={[position.x, position.y, position.z]}
            scale={1.5}
            onClick={() => onUpgradeClick(upgrade.id)}
            name={upgrade.name}
            isUnlocked={true} // All upgrades are now unlocked
            isWithinRange={isWithinRange}
            isPurchased={gameState.purchasedUpgrades?.includes(upgrade.id) || false}
            cost={upgrade.cost}
            canAfford={gameState.energyCredits >= upgrade.cost}
          />
        </Suspense>
      );
    }).filter(Boolean);
  }, [gameState.purchasedUpgrades, gameState.energyCredits, onUpgradeClick, modelUrl]);

  return <>{upgradeNodes}</>;
};