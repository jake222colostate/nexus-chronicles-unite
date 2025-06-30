
export interface FantasyUpgrade {
  id: string;
  name: string;
  cost: number;
  bonus: string;
  description: string;
  isSpecial?: boolean;
  purchased?: boolean;
}

export const fantasyUpgrades: FantasyUpgrade[] = [
  {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    cost: 50,
    bonus: '+3 mana/sec',
    description: 'A crystallized form of pure magical energy'
  },
  {
    id: 'arcane_focus',
    name: 'Arcane Focus',
    cost: 250,
    bonus: '+12 mana/sec',
    description: 'Concentrates magical energies for greater efficiency'
  },
  {
    id: 'mystic_fountain',
    name: 'Mystic Fountain',
    cost: 1000,
    bonus: '+30 mana/sec',
    description: 'An eternal wellspring of magical power',
    isSpecial: true
  },
  {
    id: 'elder_artifact',
    name: 'Elder Artifact',
    cost: 5000,
    bonus: '+100 mana/sec',
    description: 'Ancient relic of immense magical power'
  }
];
