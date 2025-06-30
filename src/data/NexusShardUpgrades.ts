
import { NexusShardUpgrade } from '../components/NexusShardShop';

export const nexusShardUpgrades: NexusShardUpgrade[] = [
  {
    id: 'harmonic_resonance',
    name: 'Harmonic Resonance',
    description: 'Synchronizes both worlds for increased production',
    cost: 5,
    icon: '🔮',
    effects: {
      manaBonus: 10,
      energyBonus: 10
    },
    purchased: false
  },
  {
    id: 'dimensional_bridge',
    name: 'Dimensional Bridge',
    description: 'Creates a stable connection between realms',
    cost: 15,
    icon: '🌉',
    effects: {
      globalProductionBonus: 0.25
    },
    purchased: false,
    unlockRequirement: {
      fantasySpecial: true,
      scifiSpecial: true
    }
  },
  {
    id: 'nexus_amplifier',
    name: 'Nexus Amplifier',
    description: 'Amplifies the power of both magical and technological sources',
    cost: 25,
    icon: '⚡',
    effects: {
      manaBonus: 50,
      energyBonus: 50,
      globalProductionBonus: 0.15
    },
    purchased: false,
    unlockRequirement: {
      fantasySpecial: true,
      scifiSpecial: true
    }
  },
  {
    id: 'reality_weaver',
    name: 'Reality Weaver',
    description: 'Bends the fabric of reality to maximize resource generation',
    cost: 50,
    icon: '🌌',
    effects: {
      globalProductionBonus: 1.0
    },
    purchased: false,
    unlockRequirement: {
      fantasySpecial: true,
      scifiSpecial: true
    }
  }
];
