export interface NexusUpgradeModule {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'mana' | 'energyCredits' | 'nexusShards';
  realm: 'fantasy' | 'scifi';
  originalUpgradeId: string;
  bonus: string;
  icon: string;
  size: 'small' | 'medium' | 'large';
  color: string;
}

export const nexusUpgradeModules: NexusUpgradeModule[] = [
  // Fantasy Upgrade Modules
  {
    id: 'mini_mana_crystal',
    name: 'Mini Mana Crystal',
    description: 'Small version of the Mana Crystal upgrade',
    cost: 15,
    currency: 'nexusShards',
    realm: 'fantasy',
    originalUpgradeId: 'mana_crystal',
    bonus: '+1 mana/sec',
    icon: '💎',
    size: 'small',
    color: '#9f7aea'
  },
  {
    id: 'mini_arcane_focus',
    name: 'Mini Arcane Focus',
    description: 'Compact version of the Arcane Focus',
    cost: 25,
    currency: 'nexusShards',
    realm: 'fantasy',
    originalUpgradeId: 'arcane_focus',
    bonus: '+3 mana/sec',
    icon: '🔮',
    size: 'small',
    color: '#805ad5'
  },
  {
    id: 'mini_mystic_fountain',
    name: 'Mini Mystic Fountain',
    description: 'Miniature version of the Mystic Fountain',
    cost: 50,
    currency: 'nexusShards',
    realm: 'fantasy',
    originalUpgradeId: 'mystic_fountain',
    bonus: '+8 mana/sec',
    icon: '⛲',
    size: 'medium',
    color: '#6b46c1'
  },
  {
    id: 'mini_elder_artifact',
    name: 'Mini Elder Artifact',
    description: 'Reduced version of the Elder Artifact',
    cost: 100,
    currency: 'nexusShards',
    realm: 'fantasy',
    originalUpgradeId: 'elder_artifact',
    bonus: '+25 mana/sec',
    icon: '🏺',
    size: 'medium',
    color: '#553c9a'
  },

  // Sci-Fi Upgrade Modules
  {
    id: 'mini_quantum_boost',
    name: 'Mini Quantum Boost',
    description: 'Compact quantum field manipulator',
    cost: 20,
    currency: 'nexusShards',
    realm: 'scifi',
    originalUpgradeId: 'quantum_boost',
    bonus: '+2 energy/sec',
    icon: '⚡',
    size: 'small',
    color: '#00bcd4'
  },
  {
    id: 'mini_plasma_conduit',
    name: 'Mini Plasma Conduit',
    description: 'Small plasma energy channel',
    cost: 35,
    currency: 'nexusShards',
    realm: 'scifi',
    originalUpgradeId: 'plasma_conduit',
    bonus: '+6 energy/sec',
    icon: '🔌',
    size: 'small',
    color: '#0891b2'
  },
  {
    id: 'mini_fusion_core',
    name: 'Mini Fusion Core',
    description: 'Miniaturized fusion reactor',
    cost: 75,
    currency: 'nexusShards',
    realm: 'scifi',
    originalUpgradeId: 'fusion_core',
    bonus: '+15 energy/sec',
    icon: '⚛️',
    size: 'medium',
    color: '#0e7490'
  },
  {
    id: 'mini_antimatter_engine',
    name: 'Mini Antimatter Engine',
    description: 'Compact antimatter power source',
    cost: 150,
    currency: 'nexusShards',
    realm: 'scifi',
    originalUpgradeId: 'antimatter_engine',
    bonus: '+50 energy/sec',
    icon: '🌌',
    size: 'medium',
    color: '#155e75'
  }
];