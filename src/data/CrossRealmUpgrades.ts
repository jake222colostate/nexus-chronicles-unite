
import { CrossRealmUpgrade } from '../components/CrossRealmUpgradeSystem';

export const crossRealmUpgrades: CrossRealmUpgrade[] = [
  // Fantasy Realm Upgrades
  {
    id: 'fantasy_mana_boost',
    name: 'Mana Boost',
    description: 'Increases base mana generation',
    icon: '🔮',
    realm: 'fantasy',
    level: 0,
    maxLevel: 10,
    baseCost: 50,
    effect: { manaPerSecond: 2 }
  },
  {
    id: 'fantasy_arcane_weapon',
    name: 'Arcane Weapon',
    description: 'Enhances weapon damage with magic',
    icon: '🪄',
    realm: 'fantasy',
    level: 0,
    maxLevel: 8,
    baseCost: 100,
    effect: { damage: 2 },
    unlockRequirement: {
      otherRealm: 'scifi',
      journeyDistance: 100
    }
  },
  {
    id: 'fantasy_rapid_fire',
    name: 'Lightning Cast',
    description: 'Magically enhanced firing speed',
    icon: '⚡',
    realm: 'fantasy',
    level: 0,
    maxLevel: 12,
    baseCost: 150,
    effect: { fireRate: 200 },
    unlockRequirement: {
      otherRealm: 'scifi',
      journeyDistance: 250
    }
  },
  {
    id: 'fantasy_mystic_range',
    name: 'Mystic Range',
    description: 'Extends magical weapon range',
    icon: '🌟',
    realm: 'fantasy',
    level: 0,
    maxLevel: 6,
    baseCost: 200,
    effect: { range: 8 },
    unlockRequirement: {
      otherRealm: 'scifi',
      journeyDistance: 500
    }
  },

  // Sci-Fi Realm Upgrades
  {
    id: 'scifi_energy_boost',
    name: 'Energy Boost',
    description: 'Increases base energy generation',
    icon: '⚡',
    realm: 'scifi',
    level: 0,
    maxLevel: 10,
    baseCost: 50,
    effect: { energyPerSecond: 2 }
  },
  {
    id: 'scifi_plasma_weapon',
    name: 'Plasma Weapon',
    description: 'High-tech weapon enhancement',
    icon: '🔫',
    realm: 'scifi',
    level: 0,
    maxLevel: 8,
    baseCost: 100,
    effect: { damage: 2 },
    unlockRequirement: {
      otherRealm: 'fantasy',
      journeyDistance: 100
    }
  },
  {
    id: 'scifi_auto_fire',
    name: 'Auto-Fire System',
    description: 'Automated rapid firing mechanism',
    icon: '🤖',
    realm: 'scifi',
    level: 0,
    maxLevel: 12,
    baseCost: 150,
    effect: { fireRate: 200 },
    unlockRequirement: {
      otherRealm: 'fantasy',
      journeyDistance: 250
    }
  },
  {
    id: 'scifi_quantum_range',
    name: 'Quantum Range',
    description: 'Quantum-enhanced targeting range',
    icon: '🎯',
    realm: 'scifi',
    level: 0,
    maxLevel: 6,
    baseCost: 200,
    effect: { range: 8 },
    unlockRequirement: {
      otherRealm: 'fantasy',
      journeyDistance: 500
    }
  }
];
