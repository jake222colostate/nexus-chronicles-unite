
import { CrossRealmBuff } from '../types/GameTypes';

export const crossRealmBuffs: CrossRealmBuff[] = [
  {
    id: 'fusion_to_altar',
    name: 'Quantum Resonance',
    description: 'Fusion Reactors enhance Mana Altars',
    sourceRealm: 'scifi',
    targetRealm: 'fantasy',
    sourceBuildingId: 'reactor',
    sourceRequirement: 5,
    targetBuildingId: 'altar',
    buffType: 'percentage',
    buffValue: 0.1,
    icon: '⚡'
  },
  {
    id: 'temple_to_generator',
    name: 'Arcane Enhancement',
    description: 'Arcane Temples boost Solar Panel efficiency',
    sourceRealm: 'fantasy',
    targetRealm: 'scifi',
    sourceBuildingId: 'temple',
    sourceRequirement: 1,
    targetBuildingId: 'generator',
    buffType: 'flat',
    buffValue: 0.5,
    icon: '🔮'
  },
  {
    id: 'station_to_grove',
    name: 'Orbital Sync',
    description: 'Space Stations synchronize with Enchanted Groves',
    sourceRealm: 'scifi',
    targetRealm: 'fantasy',
    sourceBuildingId: 'station',
    sourceRequirement: 3,
    targetBuildingId: 'grove',
    buffType: 'percentage',
    buffValue: 0.15,
    icon: '🛰️'
  },
  {
    id: 'tower_to_megastructure',
    name: 'Mystic Amplification',
    description: 'Wizard Towers amplify Dyson Sphere output',
    sourceRealm: 'fantasy',
    targetRealm: 'scifi',
    sourceBuildingId: 'tower',
    sourceRequirement: 10,
    targetBuildingId: 'megastructure',
    buffType: 'percentage',
    buffValue: 0.2,
    icon: '🗼'
  }
];
