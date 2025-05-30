
import { HybridUpgrade } from '../types/GameTypes';

export const hybridUpgrades: HybridUpgrade[] = [
  {
    id: 'arcane_ai',
    name: 'Arcane AI',
    description: 'Fusion of magic and technology boosts all production',
    cost: 5,
    costType: 'nexusShards',
    requirements: {
      mana: 1000,
      energy: 1000
    },
    effects: {
      globalProductionBonus: 0.1
    },
    icon: '🤖',
    unlocked: false,
    purchased: false
  },
  {
    id: 'cyber_dragon',
    name: 'Cyber Dragon',
    description: 'Mechanical dragon that generates both mana and energy',
    cost: 10,
    costType: 'nexusShards',
    requirements: {
      nexusShards: 10
    },
    effects: {
      manaProductionBonus: 25,
      energyProductionBonus: 25,
      specialEffect: 'cyber_dragon'
    },
    icon: '🐲',
    unlocked: false,
    purchased: false
  },
  {
    id: 'temporal_nexus',
    name: 'Temporal Nexus',
    description: 'Time manipulation accelerates all processes',
    cost: 25,
    costType: 'nexusShards',
    requirements: {
      convergenceCount: 3,
      nexusShards: 25
    },
    effects: {
      globalProductionBonus: 0.5
    },
    icon: '⏰',
    unlocked: false,
    purchased: false
  },
  {
    id: 'reality_engine',
    name: 'Reality Engine',
    description: 'Rewrite the laws of physics for ultimate power',
    cost: 100,
    costType: 'nexusShards',
    requirements: {
      mana: 100000,
      energy: 100000,
      convergenceCount: 10
    },
    effects: {
      globalProductionBonus: 2.0
    },
    icon: '🌌',
    unlocked: false,
    purchased: false
  }
];
