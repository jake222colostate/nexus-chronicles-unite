export interface NexusUpgradeModule {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'mana' | 'energyCredits' | 'nexusShards';
  realm: 'fantasy' | 'scifi';
  bonus: string;
  icon: string;
  glbModel: string;
  color: string;
}

export const nexusUpgradeModules: NexusUpgradeModule[] = [
  {
    id: 'crystal_tower',
    name: 'Crystal Tower',
    description: 'Ancient power source',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'fantasy',
    bonus: '+5 mana/sec',
    icon: '🗿',
    glbModel: 'crystal_tower', // Use simple geometric shape instead
    color: '#9f7aea'
  },
  {
    id: 'energy_lotus',
    name: 'Energy Lotus',
    description: 'Mystical flowering energy',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'fantasy',
    bonus: '+3 mana/sec',
    icon: '🪷',
    glbModel: 'energy_lotus',
    color: '#805ad5'
  },
  {
    id: 'flame_phoenix',
    name: 'Flame Phoenix',
    description: 'Reborn magical creature',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'fantasy',
    bonus: '+8 mana/sec',
    icon: '🔥',
    glbModel: 'flame_phoenix',
    color: '#6b46c1'
  },
  {
    id: 'energy_spiral',
    name: 'Energy Spiral',
    description: 'Energy focusing structure',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'scifi',
    bonus: '+6 energy/sec',
    icon: '🌀',
    glbModel: 'energy_spiral',
    color: '#00bcd4'
  },
  {
    id: 'plasma_reactor',
    name: 'Plasma Reactor',
    description: 'Advanced energy reactor',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'scifi',
    bonus: '+10 energy/sec',
    icon: '🏗️',
    glbModel: 'plasma_reactor',
    color: '#0891b2'
  },
  {
    id: 'nexus_platform',
    name: 'Nexus Platform',
    description: 'Multi-platform generator',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'scifi',
    bonus: '+4 energy/sec',
    icon: '🏛️',
    glbModel: 'nexus_platform',
    color: '#0e7490'
  }
];