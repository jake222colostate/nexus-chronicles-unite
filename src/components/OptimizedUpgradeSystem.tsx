import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { LODGLBSystem } from './LODGLBSystem';
import { FrustumCullingSystem } from './FrustumCullingSystem';
import { assetUrl } from '@/lib/utils';

interface OptimizedUpgradeSystemProps {
  upgradePositions: Array<{
    id: number;
    position: [number, number, number];
    tier: number;
    unlocked: boolean;
  }>;
  playerPosition: Vector3;
  realm: 'fantasy' | 'scifi';
}

export const OptimizedUpgradeSystem: React.FC<OptimizedUpgradeSystemProps> = ({
  upgradePositions,
  playerPosition,
  realm
}) => {
  // Separate upgrades by model type (every 5th is obelisk, others are podium)
  const { podiumUpgrades, obeliskUpgrades } = useMemo(() => {
    const podiums = [];
    const obelisks = [];
    
    upgradePositions.forEach(upgrade => {
      if (upgrade.id % 5 === 0) {
        obelisks.push({
          position: upgrade.position,
          rotation: [0, 0, 0] as [number, number, number],
          scale: 1
        });
      } else {
        podiums.push({
          position: upgrade.position,
          rotation: [0, 0, 0] as [number, number, number],
          scale: 1
        });
      }
    });
    
    return { podiumUpgrades: podiums, obeliskUpgrades: obelisks };
  }, [upgradePositions]);

  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <FrustumCullingSystem cullDistance={150}>
      {/* Podium upgrades with LOD */}
      {podiumUpgrades.map((upgrade, index) => (
        <LODGLBSystem
          key={`podium-${index}`}
          modelUrl={assetUrl('assets/upgrades/Podiums.glb')}
          position={upgrade.position}
          rotation={upgrade.rotation}
          scale={upgrade.scale}
          lodDistances={[50, 100, 150]}
          cameraPosition={playerPosition}
        />
      ))}
      
      {/* Obelisk upgrades with LOD */}
      {obeliskUpgrades.map((upgrade, index) => (
        <LODGLBSystem
          key={`obelisk-${index}`}
          modelUrl={assetUrl('assets/upgrades/LargeObelisk.glb')}
          position={upgrade.position}
          rotation={upgrade.rotation}
          scale={upgrade.scale}
          lodDistances={[60, 120, 180]}
          cameraPosition={playerPosition}
        />
      ))}
    </FrustumCullingSystem>
  );
};