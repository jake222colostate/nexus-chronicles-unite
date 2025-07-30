export interface NexusModule {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'special';
  realm: 'fantasy' | 'scifi' | 'nexus';
  cost: number;
  currency: 'mana' | 'energyCredits' | 'nexusShards';
  effects: {
    manaBonus?: number;
    energyBonus?: number;
    globalProductionBonus?: number;
    nexusShardGeneration?: number;
    specialEffect?: string;
  };
  size: 'small' | 'medium' | 'large';
  unlockRequirement?: {
    fantasyLevel?: number;
    scifiLevel?: number;
    questComplete?: string;
  };
  visualTheme: {
    crystalColor: string;
    glowColor: string;
    particleColor: string;
  };
}

export const nexusModules: NexusModule[] = [
  // Fantasy Modules
  {
    id: 'mana_crystal_small',
    name: 'Minor Mana Crystal',
    description: '+5 Mana/sec generation',
    type: 'passive',
    realm: 'fantasy',
    cost: 50,
    currency: 'mana',
    effects: {
      manaBonus: 5
    },
    size: 'small',
    visualTheme: {
      crystalColor: '#9333ea',
      glowColor: '#a855f7',
      particleColor: '#c084fc'
    }
  },
  {
    id: 'mana_crystal_medium',
    name: 'Major Mana Crystal',
    description: '+15 Mana/sec generation',
    type: 'passive',
    realm: 'fantasy',
    cost: 200,
    currency: 'mana',
    effects: {
      manaBonus: 15
    },
    size: 'medium',
    visualTheme: {
      crystalColor: '#7c3aed',
      glowColor: '#8b5cf6',
      particleColor: '#a78bfa'
    }
  },
  {
    id: 'arcane_amplifier',
    name: 'Arcane Amplifier',
    description: '+25% Fantasy realm production',
    type: 'passive',
    realm: 'fantasy',
    cost: 75,
    currency: 'nexusShards',
    effects: {
      globalProductionBonus: 0.25
    },
    size: 'large',
    unlockRequirement: {
      fantasyLevel: 10
    },
    visualTheme: {
      crystalColor: '#6366f1',
      glowColor: '#818cf8',
      particleColor: '#a5b4fc'
    }
  },

  // Sci-Fi Modules
  {
    id: 'energy_cell_small',
    name: 'Compact Energy Cell',
    description: '+8 Energy/sec generation',
    type: 'passive',
    realm: 'scifi',
    cost: 100,
    currency: 'energyCredits',
    effects: {
      energyBonus: 8
    },
    size: 'small',
    visualTheme: {
      crystalColor: '#06b6d4',
      glowColor: '#22d3ee',
      particleColor: '#67e8f9'
    }
  },
  {
    id: 'quantum_processor',
    name: 'Quantum Processor',
    description: '+30% Sci-Fi realm production',
    type: 'passive',
    realm: 'scifi',
    cost: 100,
    currency: 'nexusShards',
    effects: {
      globalProductionBonus: 0.30
    },
    size: 'large',
    unlockRequirement: {
      scifiLevel: 8
    },
    visualTheme: {
      crystalColor: '#0891b2',
      glowColor: '#0e7490',
      particleColor: '#22d3ee'
    }
  },

  // Nexus Modules
  {
    id: 'nexus_converter',
    name: 'Nexus Converter',
    description: 'Generates 1 Nexus Shard/min',
    type: 'passive',
    realm: 'nexus',
    cost: 150,
    currency: 'nexusShards',
    effects: {
      nexusShardGeneration: 1
    },
    size: 'medium',
    visualTheme: {
      crystalColor: '#f59e0b',
      glowColor: '#fbbf24',
      particleColor: '#fcd34d'
    }
  },
  {
    id: 'dimensional_anchor',
    name: 'Dimensional Anchor',
    description: '+50% all realm production',
    type: 'special',
    realm: 'nexus',
    cost: 200,
    currency: 'nexusShards',
    effects: {
      globalProductionBonus: 0.50,
      specialEffect: 'Synchronizes all realms'
    },
    size: 'large',
    unlockRequirement: {
      fantasyLevel: 15,
      scifiLevel: 15
    },
    visualTheme: {
      crystalColor: '#ef4444',
      glowColor: '#f87171',
      particleColor: '#fca5a5'
    }
  }
];

export const getModulesByRealm = (realm: string) => {
  return nexusModules.filter(module => module.realm === realm);
};

export const getAvailableModules = (gameState: any) => {
  return nexusModules.filter(module => {
    if (!module.unlockRequirement) return true;
    
    const { fantasyLevel, scifiLevel, questComplete } = module.unlockRequirement;
    
    // Check fantasy level requirement
    if (fantasyLevel && (!gameState.fantasyLevel || gameState.fantasyLevel < fantasyLevel)) {
      return false;
    }
    
    // Check sci-fi level requirement  
    if (scifiLevel && (!gameState.scifiLevel || gameState.scifiLevel < scifiLevel)) {
      return false;
    }
    
    // Check quest completion requirement
    if (questComplete && !gameState.completedQuests?.includes(questComplete)) {
      return false;
    }
    
    return true;
  });
};