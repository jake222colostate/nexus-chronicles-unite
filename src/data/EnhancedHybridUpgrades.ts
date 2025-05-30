
import { HybridUpgrade } from '../types/GameTypes';

export const enhancedHybridUpgrades: HybridUpgrade[] = [
  // Tier 1 - Starting upgrade
  {
    id: 'arcane_ai',
    name: 'Arcane AI',
    description: 'Fusion of magic and technology boosts all production by 10%',
    cost: 5,
    costType: 'nexusShards',
    requirements: {
      mana: 500,
      energy: 500
    },
    effects: {
      globalProductionBonus: 0.1
    },
    icon: '🤖',
    unlocked: false,
    purchased: false,
    tier: 1
  },

  // Tier 2 - Fantasy and Sci-Fi branches
  {
    id: 'mana_fountain',
    name: 'Mana Fountain',
    description: 'Eternal wellspring that amplifies magical energy generation by 15/sec',
    cost: 8,
    costType: 'nexusShards',
    requirements: {
      mana: 1500,
      convergenceCount: 1
    },
    effects: {
      manaProductionBonus: 15,
      globalProductionBonus: 0.05
    },
    icon: '⛲',
    unlocked: false,
    purchased: false,
    tier: 2
  },
  {
    id: 'quantum_drive',
    name: 'Quantum Drive',
    description: 'Harnesses quantum mechanics for energy multiplication by 15/sec',
    cost: 8,
    costType: 'nexusShards',
    requirements: {
      energy: 1500,
      convergenceCount: 1
    },
    effects: {
      energyProductionBonus: 15,
      globalProductionBonus: 0.05
    },
    icon: '⚛️',
    unlocked: false,
    purchased: false,
    tier: 2
  },

  // Tier 3 - Advanced upgrades with more nodes
  {
    id: 'arcane_beacon',
    name: 'Arcane Beacon',
    description: 'Mystical tower that guides magical energies across realms, +35 Mana/sec and +10 Energy/sec',
    cost: 15,
    costType: 'nexusShards',
    requirements: {
      mana: 5000,
      convergenceCount: 2
    },
    effects: {
      manaProductionBonus: 35,
      energyProductionBonus: 10
    },
    icon: '🗼',
    unlocked: false,
    purchased: false,
    tier: 3
  },
  {
    id: 'cyber_dragon',
    name: 'Cyber Dragon',
    description: 'Mechanical dragon that generates both mana and energy, +25 each per second',
    cost: 15,
    costType: 'nexusShards',
    requirements: {
      nexusShards: 10,
      convergenceCount: 2
    },
    effects: {
      manaProductionBonus: 25,
      energyProductionBonus: 25,
      specialEffect: 'cyber_dragon'
    },
    icon: '🐲',
    unlocked: false,
    purchased: false,
    tier: 3
  },
  {
    id: 'nano_reactor',
    name: 'Nano Reactor',
    description: 'Microscopic fusion reactors multiply energy output, +35 Energy/sec and +10 Mana/sec',
    cost: 15,
    costType: 'nexusShards',
    requirements: {
      energy: 5000,
      convergenceCount: 2
    },
    effects: {
      energyProductionBonus: 35,
      manaProductionBonus: 10
    },
    icon: '🔬',
    unlocked: false,
    purchased: false,
    tier: 3
  },
  {
    id: 'crystal_matrix',
    name: 'Crystal Matrix',
    description: 'Living crystal network that amplifies all magical structures by 20%',
    cost: 18,
    costType: 'nexusShards',
    requirements: {
      mana: 8000,
      convergenceCount: 2
    },
    effects: {
      globalProductionBonus: 0.2,
      manaProductionBonus: 20
    },
    icon: '💎',
    unlocked: false,
    purchased: false,
    tier: 3
  },
  {
    id: 'void_engine',
    name: 'Void Engine',
    description: 'Harnesses dark energy to boost technological efficiency by 20%',
    cost: 18,
    costType: 'nexusShards',
    requirements: {
      energy: 8000,
      convergenceCount: 2
    },
    effects: {
      globalProductionBonus: 0.2,
      energyProductionBonus: 20
    },
    icon: '🌑',
    unlocked: false,
    purchased: false,
    tier: 3
  },

  // Tier 4 - Elite upgrades
  {
    id: 'rift_core',
    name: 'Rift Core',
    description: 'Interdimensional core that bridges fantasy and sci-fi realms, massive 30% global boost',
    cost: 25,
    costType: 'nexusShards',
    requirements: {
      mana: 15000,
      energy: 15000,
      convergenceCount: 3
    },
    effects: {
      globalProductionBonus: 0.3
    },
    icon: '🌀',
    unlocked: false,
    purchased: false,
    tier: 4
  },
  {
    id: 'time_nexus',
    name: 'Time Nexus',
    description: 'Manipulates temporal flow to accelerate all production processes by 25%',
    cost: 30,
    costType: 'nexusShards',
    requirements: {
      mana: 20000,
      energy: 20000,
      convergenceCount: 4
    },
    effects: {
      globalProductionBonus: 0.25,
      manaProductionBonus: 40,
      energyProductionBonus: 40
    },
    icon: '⏰',
    unlocked: false,
    purchased: false,
    tier: 4
  },

  // Tier 5 - Ultimate upgrade
  {
    id: 'reality_engine',
    name: 'Reality Engine',
    description: 'Rewrite the laws of physics for ultimate power generation, doubles all production!',
    cost: 75,
    costType: 'nexusShards',
    requirements: {
      mana: 100000,
      energy: 100000,
      convergenceCount: 5
    },
    effects: {
      globalProductionBonus: 1.0
    },
    icon: '🌌',
    unlocked: false,
    purchased: false,
    tier: 5
  }
];
