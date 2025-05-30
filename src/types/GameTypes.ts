
export interface CrossRealmBuff {
  id: string;
  name: string;
  description: string;
  sourceRealm: 'fantasy' | 'scifi';
  targetRealm: 'fantasy' | 'scifi';
  sourceBuildingId: string;
  sourceRequirement: number;
  targetBuildingId: string;
  buffType: 'percentage' | 'flat';
  buffValue: number;
  icon: string;
}

export interface HybridUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costType: 'nexusShards' | 'mixed';
  requirements: {
    mana?: number;
    energy?: number;
    nexusShards?: number;
    convergenceCount?: number;
  };
  effects: {
    globalProductionBonus?: number;
    manaProductionBonus?: number;
    energyProductionBonus?: number;
    specialEffect?: string;
  };
  icon: string;
  unlocked: boolean;
  purchased: boolean;
}

export interface ConvergenceData {
  available: boolean;
  threshold: number;
  currentProgress: number;
  shardsToGain: number;
  multiplier: number;
}

export interface BuffIndicator {
  buildingId: string;
  buffName: string;
  buffValue: number;
  icon: string;
}
