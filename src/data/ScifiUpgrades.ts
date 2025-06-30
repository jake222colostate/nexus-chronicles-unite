
import { ScifiUpgrade } from '../components/ScifiUpgradeMenu';

export const scifiUpgrades: ScifiUpgrade[] = [
  {
    id: 'quantum_boost',
    name: 'Quantum Boost',
    cost: 100,
    bonus: '+5 energy/sec',
    description: 'Quantum field manipulation increases energy generation',
    purchased: false
  },
  {
    id: 'plasma_conduit',
    name: 'Plasma Conduit',
    cost: 500,
    bonus: '+20 energy/sec',
    description: 'High-efficiency plasma channels boost power output',
    purchased: false
  },
  {
    id: 'fusion_core',
    name: 'Fusion Core',
    cost: 2000,
    bonus: '+50 energy/sec',
    description: 'Advanced fusion reactor core for massive energy production',
    isSpecial: true,
    purchased: false,
    unlockRequirement: {
      fantasyUpgrades: 6
    }
  },
  {
    id: 'antimatter_engine',
    name: 'Antimatter Engine',
    cost: 10000,
    bonus: '+200 energy/sec',
    description: 'Harnesses antimatter for unprecedented energy output',
    purchased: false
  }
];
