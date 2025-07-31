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
    id: 'large_obelisk',
    name: 'Large Obelisk',
    description: 'Ancient power source',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'fantasy',
    bonus: '+5 mana/sec',
    icon: '🗿',
    glbModel: '/assets/upgrades/LargeObelisk.glb',
    color: '#9f7aea'
  },
  {
    id: 'lotus',
    name: 'Lotus',
    description: 'Mystical flowering energy',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'fantasy',
    bonus: '+3 mana/sec',
    icon: '🪷',
    glbModel: '/assets/upgrades/Lotus.glb',
    color: '#805ad5'
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    description: 'Reborn magical creature',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'fantasy',
    bonus: '+8 mana/sec',
    icon: '🔥',
    glbModel: '/assets/upgrades/Phoenix.glb',
    color: '#6b46c1'
  },
  {
    id: 'spiral',
    name: 'Spiral',
    description: 'Energy focusing structure',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'scifi',
    bonus: '+6 energy/sec',
    icon: '🌀',
    glbModel: '/assets/upgrades/Spiral.glb',
    color: '#00bcd4'
  },
  {
    id: 'melting_tower',
    name: 'Melting Tower',
    description: 'Advanced energy reactor',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'scifi',
    bonus: '+10 energy/sec',
    icon: '🏗️',
    glbModel: '/assets/upgrades/Meltingtower.glb',
    color: '#0891b2'
  },
  {
    id: 'podiums',
    name: 'Podiums',
    description: 'Multi-platform generator',
    cost: 0, // Free for now
    currency: 'nexusShards',
    realm: 'scifi',
    bonus: '+4 energy/sec',
    icon: '🏛️',
    glbModel: '/assets/upgrades/Podiums.glb',
    color: '#0e7490'
  }
];