
import { HybridUpgrade } from '../types/GameTypes';

export const sciFiUpgrades: HybridUpgrade[] = [
  // Tier 1 - Core Systems
  {
    id: 'quantum_core',
    name: 'Quantum Core',
    description: 'Advanced quantum processing unit that amplifies all energy generation',
    icon: '⚛️',
    tier: 1,
    cost: 100,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 500
    },
    effects: {
      globalProductionBonus: 0.25,
      energyProductionBonus: 50
    }
  },

  // Tier 2 - Energy Systems
  {
    id: 'fusion_reactor',
    name: 'Fusion Reactor',
    description: 'Clean fusion energy provides massive power generation boost',
    icon: '⚡',
    tier: 2,
    cost: 250,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 1500,
      nexusShards: 25
    },
    effects: {
      energyProductionBonus: 150,
      globalProductionBonus: 0.15
    }
  },
  {
    id: 'antimatter_engine',
    name: 'Antimatter Engine',
    description: 'Harness the power of antimatter for exponential energy output',
    icon: '💫',
    tier: 2,
    cost: 400,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 2500,
      nexusShards: 40
    },
    effects: {
      energyProductionBonus: 300,
      globalProductionBonus: 0.20
    }
  },

  // Tier 3 - Advanced Technology
  {
    id: 'neural_network',
    name: 'Neural Network',
    description: 'AI-driven optimization of all systems and processes',
    icon: '🧠',
    tier: 3,
    cost: 800,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 5000,
      nexusShards: 75,
      convergenceCount: 1
    },
    effects: {
      globalProductionBonus: 0.40,
      energyProductionBonus: 200
    }
  },
  {
    id: 'cyber_matrix',
    name: 'Cyber Matrix',
    description: 'Digital realm enhancement that bridges realities',
    icon: '🌐',
    tier: 3,
    cost: 1200,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 8000,
      nexusShards: 100,
      convergenceCount: 2
    },
    effects: {
      globalProductionBonus: 0.35,
      energyProductionBonus: 400
    }
  },
  {
    id: 'plasma_conduits',
    name: 'Plasma Conduits',
    description: 'Super-heated plasma channels for energy distribution',
    icon: '🔥',
    tier: 3,
    cost: 1000,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 6500,
      nexusShards: 85,
      convergenceCount: 1
    },
    effects: {
      energyProductionBonus: 350,
      globalProductionBonus: 0.25
    }
  },
  {
    id: 'time_dilator',
    name: 'Time Dilator',
    description: 'Manipulate time flow to accelerate production cycles',
    icon: '⏰',
    tier: 3,
    cost: 1500,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 10000,
      nexusShards: 120,
      convergenceCount: 2
    },
    effects: {
      globalProductionBonus: 0.50,
      energyProductionBonus: 250
    }
  },

  // Tier 4 - Ultimate Technology
  {
    id: 'singularity_engine',
    name: 'Singularity Engine',
    description: 'Harness black hole energy for ultimate power generation',
    icon: '🕳️',
    tier: 4,
    cost: 3000,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 25000,
      nexusShards: 250,
      convergenceCount: 5
    },
    effects: {
      globalProductionBonus: 1.0,
      energyProductionBonus: 1000
    }
  },
  {
    id: 'dimensional_gateway',
    name: 'Dimensional Gateway',
    description: 'Open portals to other dimensions for infinite resources',
    icon: '🌌',
    tier: 4,
    cost: 5000,
    costType: 'nexusShards',
    unlocked: false,
    purchased: false,
    requirements: {
      energy: 50000,
      nexusShards: 400,
      convergenceCount: 8
    },
    effects: {
      globalProductionBonus: 1.5,
      energyProductionBonus: 2000
    }
  }
];
