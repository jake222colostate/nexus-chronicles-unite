
import React, { useMemo } from 'react';

interface UpgradeData {
  id: number;
  name: string;
  baseCost: number;
  baseManaPerSecond: number;
  cost: number;
  manaPerSecond: number;
  unlocked: boolean;
  modelUrl: string;
  position: [number, number, number];
  scale: number;
  tier: number;
}

interface InfiniteUpgradeSystemProps {
  maxUnlockedUpgrade: number;
  playerPosition: [number, number, number];
  upgradeSpacing: number;
  renderDistance: number;
}

const baseUpgradeTemplates = [
  { name: 'Mystic Fountain', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb' },
  { name: 'Crystal Grove', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb' },
  { name: 'Arcane Sanctum', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb' },
  { name: 'Nexus Gateway', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb' },
  { name: 'Temporal Altar', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb' },
  { name: 'Phoenix Roost', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_02.glb' },
  { name: 'Ethereal Nexus', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_01.glb' },
  { name: 'Infinity Well', modelUrl: 'https://raw.githubusercontent.com/jake222colostate/fantasy-3d-models/main/fantasy_3d_upgrades_package/fantasy_3d_upgrades_package-2/upgrade_05.glb' },
];

export const useInfiniteUpgrades = ({
  maxUnlockedUpgrade,
  playerPosition,
  upgradeSpacing,
  renderDistance
}: InfiniteUpgradeSystemProps): UpgradeData[] => {
  return useMemo(() => {
    const upgrades: UpgradeData[] = [];
    const playerZ = Math.abs(playerPosition[2]);
    
    // Calculate which upgrades should be visible based on player position
    const startUpgradeIndex = Math.max(0, Math.floor((playerZ - renderDistance) / upgradeSpacing));
    const endUpgradeIndex = Math.floor((playerZ + renderDistance) / upgradeSpacing) + 1;
    
    for (let i = startUpgradeIndex; i <= endUpgradeIndex; i++) {
      const tier = Math.floor(i / baseUpgradeTemplates.length);
      const templateIndex = i % baseUpgradeTemplates.length;
      const template = baseUpgradeTemplates[templateIndex];
      
      // Calculate tier multipliers for exponential scaling
      const tierMultiplier = Math.pow(10, tier); // Each tier is 10x more expensive
      const costMultiplier = Math.pow(2, i); // Base exponential growth
      const manaMultiplier = Math.pow(2, i);

      const isSpecial = (i + 1) % 10 === 0;
      const specialMultiplier = isSpecial ? 5 : 1;
      
      // Position calculation - alternating sides with increasing distance
      const side = i % 2 === 0 ? -1 : 1;
      const offset = 3 + Math.floor(i / 16) * 0.5; // Gradually increase spread
      const x = side * offset;
      const z = -(i * upgradeSpacing);
      const y = 0;
      
      // Scale increases with tier for visual progression
      const baseScale = 1.0 + (i * 0.1);
      const tierScale = 1.0 + (tier * 0.2);
      const finalScale = Math.min(baseScale * tierScale, 3.0); // Cap at 3x scale
      
      // Tier-based name modification
      const tierSuffix = tier > 0 ? ` Tier ${tier + 1}` : '';
      const finalName = `${template.name}${tierSuffix}`;
      
      upgrades.push({
        id: i + 1,
        name: finalName,
        baseCost: 50 * specialMultiplier,
        baseManaPerSecond: 10 * specialMultiplier,
        cost: Math.floor(50 * costMultiplier * tierMultiplier * specialMultiplier),
        manaPerSecond: Math.floor(10 * manaMultiplier * tierMultiplier * specialMultiplier),
        unlocked: i <= maxUnlockedUpgrade + 1,
        modelUrl: template.modelUrl,
        position: [x, y, z] as [number, number, number],
        scale: finalScale,
        tier: tier
      });
    }
    
    return upgrades;
  }, [maxUnlockedUpgrade, playerPosition, upgradeSpacing, renderDistance]);
};
