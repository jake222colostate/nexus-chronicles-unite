
import { HybridUpgrade } from '../types/GameTypes';

export const enhancedHybridUpgrades: HybridUpgrade[] = [
  // Tier 1 - Starting upgrade
  {
    id: 'arcane_ai',
    name: 'Arcane AI',
    description: 'Fusion of magic and technology boosts all production',
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
    description: 'Eternal wellspring that amplifies magical energy',
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
    description: 'Harnesses quantum mechanics for energy multiplication',
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

  // Tier 3 - Advanced upgrades
  {
    id: 'arcane_beacon',
    name: 'Arcane Beacon',
    description: 'Mystical tower that guides magical energies across realms',
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
    description: 'Mechanical dragon that generates both mana and energy',
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
    description: 'Microscopic fusion reactors that multiply energy output',
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
    id: 'rift_core',
    name: 'Rift Core',
    description: 'Interdimensional core that bridges fantasy and sci-fi',
    cost: 20,
    costType: 'nexusShards',
    requirements: {
      mana: 3000,
      energy: 3000,
      convergenceCount: 3
    },
    effects: {
      globalProductionBonus: 0.3
    },
    icon: '🌀',
    unlocked: false,
    purchased: false,
    tier: 3
  },

  // Tier 4 - Ultimate upgrade
  {
    id: 'reality_engine',
    name: 'Reality Engine',
    description: 'Rewrite the laws of physics for ultimate power',
    cost: 50,
    costType: 'nexusShards',
    requirements: {
      mana: 50000,
      energy: 50000,
      convergenceCount: 5
    },
    effects: {
      globalProductionBonus: 1.0
    },
    icon: '🌌',
    unlocked: false,
    purchased: false,
    tier: 4
  },

  // Tier 5 - Transcendent upgrades
  {
    id: 'cosmic_nexus',
    name: 'Cosmic Nexus',
    description: 'Connect to the universal energy grid',
    cost: 100,
    costType: 'nexusShards',
    requirements: {
      mana: 100000,
      energy: 100000,
      convergenceCount: 8
    },
    effects: {
      globalProductionBonus: 2.0,
      manaProductionBonus: 100
    },
    icon: '🌟',
    unlocked: false,
    purchased: false,
    tier: 5
  },
  {
    id: 'dimensional_forge',
    name: 'Dimensional Forge',
    description: 'Craft reality itself with pure will',
    cost: 150,
    costType: 'nexusShards',
    requirements: {
      mana: 200000,
      energy: 200000,
      convergenceCount: 10
    },
    effects: {
      globalProductionBonus: 3.0,
      energyProductionBonus: 150
    },
    icon: '🔨',
    unlocked: false,
    purchased: false,
    tier: 5
  },

  // Tier 6 - Godlike powers
  {
    id: 'omnipotent_core',
    name: 'Omnipotent Core',
    description: 'Ascend beyond mortal limitations',
    cost: 250,
    costType: 'nexusShards',
    requirements: {
      mana: 500000,
      energy: 500000,
      convergenceCount: 15
    },
    effects: {
      globalProductionBonus: 5.0,
      specialEffect: 'omnipotence'
    },
    icon: '👁️',
    unlocked: false,
    purchased: false,
    tier: 6
  },
  {
    id: 'universe_creator',
    name: 'Universe Creator',
    description: 'Birth new realities with a thought',
    cost: 500,
    costType: 'nexusShards',
    requirements: {
      mana: 1000000,
      energy: 1000000,
      convergenceCount: 20
    },
    effects: {
      globalProductionBonus: 10.0,
      manaProductionBonus: 500,
      energyProductionBonus: 500
    },
    icon: '🌍',
    unlocked: false,
    purchased: false,
    tier: 6
  }
];
