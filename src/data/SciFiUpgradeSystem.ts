export interface SciFiUpgrade {
  id: string;
  name: string;
  description: string;
  type: "cannon" | "tech" | "relic";
  tier?: number;
  unlocked: boolean;
  glbPath?: string; // For relic types
  unlockCondition: {
    type: "meteors" | "layer" | "time" | "cannon" | "boss";
    requirement: number | string;
    layer?: number;
    description: string;
  };
  effect: {
    type: string;
    value: number;
    target?: string; // For cannon-specific upgrades
    global?: boolean; // For tech upgrades
  };
  cost?: number;
}

export interface LayerDefinition {
  id: number;
  name: string;
  altitudeThreshold: number;
  visual: {
    theme: string;
    color: string;
    fogColor: string;
    particleColor: string;
  };
  meteors: {
    types: string[];
    spawnRate: number;
    health: number;
    speed: number;
    shielding?: number;
  };
  effects?: string[];
  unlocks: string[];
  hazards?: {
    type: string;
    intensity: number;
  }[];
  boss?: {
    id: string;
    name: string;
    health: number;
  };
}

// Ultra-close Layer System - Layers stacked right above each other (every 30 units)
export const SCIFI_LAYERS: Record<number, LayerDefinition> = {
  1: {
    id: 1,
    name: "Lower Orbit",
    altitudeThreshold: 0,
    visual: {
      theme: "atmospheric",
      color: "#3b82f6",
      fogColor: "#1e40af", 
      particleColor: "#60a5fa"
    },
    meteors: {
      types: ["basic"],
      spawnRate: 1.0,
      health: 1.0,
      speed: 1.0
    },
    unlocks: [],
    effects: ["minimal_turbulence"]
  },
  2: {
    id: 2,
    name: "Debris Field",
    altitudeThreshold: 30, // Just 30 units up
    visual: {
      theme: "debris",
      color: "#8b5cf6",
      fogColor: "#7c3aed",
      particleColor: "#a78bfa"
    },
    meteors: {
      types: ["basic", "clustered"],
      spawnRate: 1.2,
      health: 1.25,
      speed: 1.1
    },
    unlocks: ["meteorRefractor"],
    effects: ["electrical_interference"]
  },
  3: {
    id: 3,
    name: "Solar Wind Zone", 
    altitudeThreshold: 60, // Another 30 units
    visual: {
      theme: "solar",
      color: "#f59e0b",
      fogColor: "#d97706",
      particleColor: "#fbbf24"
    },
    meteors: {
      types: ["basic", "solar"],
      spawnRate: 1.4,
      health: 1.5,
      speed: 1.2
    },
    unlocks: ["gravityAnchorArray"],
    effects: ["solar_buffeting"],
    hazards: [{ type: "solar_flare", intensity: 0.3 }]
  },
  4: {
    id: 4,
    name: "Gravity Warped Zone",
    altitudeThreshold: 90, // Another 30 units
    visual: {
      theme: "gravity",
      color: "#ef4444",
      fogColor: "#dc2626",
      particleColor: "#f87171"
    },
    meteors: {
      types: ["basic", "gravity_warped"],
      spawnRate: 1.6,
      health: 2.0,
      speed: 1.3
    },
    unlocks: ["warpConduitRelay"],
    effects: ["gravity_waves"],
    hazards: [{ type: "gravity_distortion", intensity: 0.5 }],
    boss: {
      id: "gravity_nexus",
      name: "Gravity Nexus",
      health: 1000
    }
  },
  5: {
    id: 5,
    name: "Cosmic Radiation Belt",
    altitudeThreshold: 120, // Another 30 units
    visual: {
      theme: "radiation",
      color: "#10b981",
      fogColor: "#059669", 
      particleColor: "#34d399"
    },
    meteors: {
      types: ["basic", "radioactive"],
      spawnRate: 1.8,
      health: 2.5,
      speed: 1.4,
      shielding: 0.1
    },
    unlocks: ["naniteBloom"],
    effects: ["radiation_interference"],
    hazards: [{ type: "cosmic_radiation", intensity: 0.7 }]
  },
  6: {
    id: 6,
    name: "Void Nexus",
    altitudeThreshold: 150, // Another 30 units
    visual: {
      theme: "void",
      color: "#6366f1",
      fogColor: "#4f46e5",
      particleColor: "#818cf8"
    },
    meteors: {
      types: ["basic", "void_touched"],
      spawnRate: 2.0,
      health: 3.0,
      speed: 1.5,
      shielding: 0.15
    },
    unlocks: ["voidManipulator"],
    effects: ["reality_distortion"],
    hazards: [{ type: "void_tears", intensity: 0.8 }]
  },
  7: {
    id: 7,
    name: "Dark Matter Field",
    altitudeThreshold: 180, // Another 30 units
    visual: {
      theme: "dark_matter",
      color: "#8b5a3c",
      fogColor: "#78350f",
      particleColor: "#a16207"
    },
    meteors: {
      types: ["basic", "dark_matter"],
      spawnRate: 2.2,
      health: 3.5,
      speed: 1.6,
      shielding: 0.2
    },
    unlocks: ["darkMatterCore"],
    effects: ["gravitational_lensing"],
    hazards: [{ type: "dark_matter_storm", intensity: 0.9 }]
  },
  8: {
    id: 8,
    name: "Quantum Anomaly Zone",
    altitudeThreshold: 210, // Another 30 units
    visual: {
      theme: "quantum",
      color: "#ec4899",
      fogColor: "#db2777",
      particleColor: "#f472b6"
    },
    meteors: {
      types: ["basic", "quantum_phased"],
      spawnRate: 2.5,
      health: 4.0,
      speed: 1.8,
      shielding: 0.25
    },
    unlocks: ["quantumStabilizer"],
    effects: ["quantum_fluctuations"],
    hazards: [{ type: "quantum_instability", intensity: 1.0 }]
  },
  9: {
    id: 9,
    name: "Temporal Rift Zone",
    altitudeThreshold: 240,
    visual: {
      theme: "temporal",
      color: "#06b6d4",
      fogColor: "#0891b2",
      particleColor: "#67e8f9"
    },
    meteors: {
      types: ["basic", "temporal_shifted"],
      spawnRate: 2.8,
      health: 4.5,
      speed: 2.0,
      shielding: 0.3
    },
    unlocks: ["temporalResonator"],
    effects: ["time_dilation"],
    hazards: [{ type: "temporal_instability", intensity: 1.1 }]
  },
  10: {
    id: 10,
    name: "Hyperdimensional Gate",
    altitudeThreshold: 270,
    visual: {
      theme: "hyperdimensional",
      color: "#a855f7",
      fogColor: "#9333ea",
      particleColor: "#c084fc"
    },
    meteors: {
      types: ["basic", "dimensional"],
      spawnRate: 3.0,
      health: 5.0,
      speed: 2.2,
      shielding: 0.35
    },
    unlocks: ["dimensionalHarmonizer"],
    effects: ["dimensional_shift"],
    hazards: [{ type: "dimensional_breach", intensity: 1.2 }]
  },
  11: {
    id: 11,
    name: "Stellar Forge",
    altitudeThreshold: 300,
    visual: {
      theme: "stellar",
      color: "#f97316",
      fogColor: "#ea580c",
      particleColor: "#fb923c"
    },
    meteors: {
      types: ["basic", "stellar_matter"],
      spawnRate: 3.2,
      health: 5.5,
      speed: 2.4,
      shielding: 0.4
    },
    unlocks: ["stellarCatalyst"],
    effects: ["stellar_fusion"],
    hazards: [{ type: "stellar_flare", intensity: 1.3 }]
  },
  12: {
    id: 12,
    name: "Galactic Nexus",
    altitudeThreshold: 330,
    visual: {
      theme: "galactic",
      color: "#eab308",
      fogColor: "#ca8a04",
      particleColor: "#facc15"
    },
    meteors: {
      types: ["basic", "galactic_dust"],
      spawnRate: 3.5,
      health: 6.0,
      speed: 2.6,
      shielding: 0.45
    },
    unlocks: ["galacticHarvester"],
    effects: ["galactic_alignment"],
    hazards: [{ type: "galactic_storm", intensity: 1.4 }]
  },
  13: {
    id: 13,
    name: "Cosmic Web Node",
    altitudeThreshold: 360,
    visual: {
      theme: "cosmic_web",
      color: "#14b8a6",
      fogColor: "#0f766e",
      particleColor: "#5eead4"
    },
    meteors: {
      types: ["basic", "cosmic_thread"],
      spawnRate: 3.8,
      health: 6.5,
      speed: 2.8,
      shielding: 0.5
    },
    unlocks: ["cosmicWebWeaver"],
    effects: ["cosmic_entanglement"],
    hazards: [{ type: "web_resonance", intensity: 1.5 }]
  },
  14: {
    id: 14,
    name: "Universal Threshold",
    altitudeThreshold: 390,
    visual: {
      theme: "universal",
      color: "#e11d48",
      fogColor: "#be123c",
      particleColor: "#fb7185"
    },
    meteors: {
      types: ["basic", "universal_fragment"],
      spawnRate: 4.0,
      health: 7.0,
      speed: 3.0,
      shielding: 0.55
    },
    unlocks: ["universalCodex"],
    effects: ["reality_convergence"],
    hazards: [{ type: "universal_fracture", intensity: 1.6 }]
  },
  15: {
    id: 15,
    name: "Infinity Engine",
    altitudeThreshold: 420,
    visual: {
      theme: "infinity",
      color: "#7c3aed",
      fogColor: "#6d28d9",
      particleColor: "#a78bfa"
    },
    meteors: {
      types: ["basic", "infinity_shard"],
      spawnRate: 4.5,
      health: 8.0,
      speed: 3.2,
      shielding: 0.6
    },
    unlocks: ["infinityCore"],
    effects: ["infinite_potential"],
    hazards: [{ type: "infinity_paradox", intensity: 1.8 }],
    boss: {
      id: "infinity_guardian",
      name: "Infinity Guardian",
      health: 10000
    }
  }
};

// Comprehensive Upgrade Database
export const SCIFI_UPGRADES: Record<string, SciFiUpgrade> = {
  // Cannon Upgrades (Tier-based)
  ionStabilizerCore: {
    id: "ionStabilizerCore",
    name: "Ion Stabilizer Core", 
    description: "Increases cannon fire rate and reduces energy drain",
    type: "cannon",
    tier: 1,
    unlocked: false,
    unlockCondition: {
      type: "meteors",
      requirement: 100,
      description: "Destroy 100 meteors"
    },
    effect: {
      type: "fireRate",
      value: 0.25,
      global: false
    }
  },
  
  quantumCapacitor: {
    id: "quantumCapacitor",
    name: "Quantum Capacitor",
    description: "Global energy generation boost across all realms",
    type: "tech",
    tier: 1,
    unlocked: false,
    unlockCondition: {
      type: "cannon",
      requirement: 3,
      description: "Upgrade 3 different cannons"
    },
    effect: {
      type: "energyGeneration",
      value: 0.1,
      global: true
    }
  },

  meteorRefractor: {
    id: "meteorRefractor", 
    name: "Meteor Refractor",
    description: "Increases loot drop chance from destroyed meteors",
    type: "tech",
    tier: 1,
    unlocked: false,
    unlockCondition: {
      type: "layer",
      requirement: 2,
      description: "Reach the Debris Field (Layer 2)"
    },
    effect: {
      type: "lootDropChance",
      value: 0.25,
      global: false
    }
  },

  gravityAnchorArray: {
    id: "gravityAnchorArray",
    name: "Gravity Anchor Array",
    description: "Reduces platform instability and scroll speed fluctuations",
    type: "tech",
    tier: 2,
    unlocked: false,
    unlockCondition: {
      type: "time",
      requirement: 120000, // 2 minutes
      layer: 3,
      description: "Survive 2 minutes in Solar Wind Zone"
    },
    effect: {
      type: "platformStability",
      value: 0.3,
      global: false
    }
  },

  arcLensProjector: {
    id: "arcLensProjector",
    name: "Arc Lens Projector",
    description: "Increases damage output for long-range cannons",
    type: "cannon",
    tier: 2,
    unlocked: false,
    unlockCondition: {
      type: "cannon",
      requirement: "maxUpgrade",
      description: "Fully upgrade any long-range cannon"
    },
    effect: {
      type: "damage",
      value: 0.4,
      target: "longRange"
    }
  },

  naniteBloom: {
    id: "naniteBloom",
    name: "Nanite Bloom",
    description: "Accelerates upgrade cooldowns and repair systems",
    type: "tech",
    tier: 3,
    unlocked: false,
    unlockCondition: {
      type: "cannon",
      requirement: "maxAbilities",
      description: "Max out any cannon's ability tree"
    },
    effect: {
      type: "upgradeSpeed",
      value: 0.3,
      global: true
    }
  },

  warpConduitRelay: {
    id: "warpConduitRelay",
    name: "Warp Conduit Relay",
    description: "Accelerates idle progression across all realms",
    type: "relic",
    tier: 3,
    unlocked: false,
    glbPath: "/assets/upgrades/WarpConduit.glb",
    unlockCondition: {
      type: "boss",
      requirement: "gravity_nexus",
      layer: 4,
      description: "Defeat the Gravity Nexus boss"
    },
    effect: {
      type: "idleAcceleration",
      value: 0.2,
      global: true
    }
  },

  // Higher Tier Relics
  voidManipulator: {
    id: "voidManipulator",
    name: "Void Manipulator",
    description: "Harnesses void energy for massive power generation",
    type: "relic",
    tier: 4,
    unlocked: false,
    glbPath: "/assets/upgrades/VoidCore.glb",
    unlockCondition: {
      type: "layer",
      requirement: 6,
      description: "Reach the Void Nexus"
    },
    effect: {
      type: "voidPower",
      value: 0.5,
      global: true
    }
  },

  darkMatterCore: {
    id: "darkMatterCore",
    name: "Dark Matter Core",
    description: "Manipulates spacetime for reality-bending effects",
    type: "relic",
    tier: 5,
    unlocked: false,
    glbPath: "/assets/upgrades/DarkMatterCore.glb",
    unlockCondition: {
      type: "layer",
      requirement: 7,
      description: "Survive the Dark Matter Field"
    },
    effect: {
      type: "spacetimeManipulation",
      value: 0.75,
      global: true
    }
  },

  quantumStabilizer: {
    id: "quantumStabilizer", 
    name: "Quantum Stabilizer",
    description: "Ultimate quantum technology upgrade",
    type: "relic",
    tier: 6,
    unlocked: false,
    glbPath: "/assets/upgrades/QuantumStabilizer.glb",
    unlockCondition: {
      type: "layer",
      requirement: 8,
      description: "Master the Quantum Anomaly Zone"
    },
    effect: {
      type: "quantumMastery",
      value: 1.0,
      global: true
    }
  },

  // New layer upgrades
  temporalResonator: {
    id: "temporalResonator",
    name: "Temporal Resonator",
    description: "Manipulates time flow for enhanced progression",
    type: "relic",
    tier: 7,
    unlocked: false,
    glbPath: "/assets/upgrades/TemporalResonator.glb",
    unlockCondition: {
      type: "layer",
      requirement: 9,
      description: "Enter the Temporal Rift Zone"
    },
    effect: {
      type: "timeAcceleration",
      value: 0.3,
      global: true
    }
  },

  dimensionalHarmonizer: {
    id: "dimensionalHarmonizer",
    name: "Dimensional Harmonizer",
    description: "Synchronizes with parallel dimensions for power multiplication",
    type: "relic",
    tier: 8,
    unlocked: false,
    glbPath: "/assets/upgrades/DimensionalHarmonizer.glb",
    unlockCondition: {
      type: "layer",
      requirement: 10,
      description: "Breach the Hyperdimensional Gate"
    },
    effect: {
      type: "dimensionalSync",
      value: 0.5,
      global: true
    }
  },

  stellarCatalyst: {
    id: "stellarCatalyst",
    name: "Stellar Catalyst",
    description: "Harnesses stellar energy for massive power generation",
    type: "relic",
    tier: 9,
    unlocked: false,
    glbPath: "/assets/upgrades/StellarCatalyst.glb",
    unlockCondition: {
      type: "layer",
      requirement: 11,
      description: "Ignite the Stellar Forge"
    },
    effect: {
      type: "stellarPower",
      value: 0.8,
      global: true
    }
  },

  galacticHarvester: {
    id: "galacticHarvester",
    name: "Galactic Harvester",
    description: "Collects energy from galactic phenomena",
    type: "relic",
    tier: 10,
    unlocked: false,
    glbPath: "/assets/upgrades/GalacticHarvester.glb",
    unlockCondition: {
      type: "layer",
      requirement: 12,
      description: "Connect to the Galactic Nexus"
    },
    effect: {
      type: "galacticCollection",
      value: 1.0,
      global: true
    }
  },

  cosmicWebWeaver: {
    id: "cosmicWebWeaver",
    name: "Cosmic Web Weaver",
    description: "Weaves the cosmic web for infinite connectivity",
    type: "relic",
    tier: 11,
    unlocked: false,
    glbPath: "/assets/upgrades/CosmicWebWeaver.glb",
    unlockCondition: {
      type: "layer",
      requirement: 13,
      description: "Link to the Cosmic Web Node"
    },
    effect: {
      type: "cosmicEntanglement",
      value: 1.25,
      global: true
    }
  },

  universalCodex: {
    id: "universalCodex",
    name: "Universal Codex",
    description: "Contains the knowledge of all realities",
    type: "relic",
    tier: 12,
    unlocked: false,
    glbPath: "/assets/upgrades/UniversalCodex.glb",
    unlockCondition: {
      type: "layer",
      requirement: 14,
      description: "Cross the Universal Threshold"
    },
    effect: {
      type: "universalKnowledge",
      value: 1.5,
      global: true
    }
  },

  infinityCore: {
    id: "infinityCore",
    name: "Infinity Core",
    description: "The ultimate source of infinite power",
    type: "relic",
    tier: 13,
    unlocked: false,
    glbPath: "/assets/upgrades/InfinityCore.glb",
    unlockCondition: {
      type: "layer",
      requirement: 15,
      description: "Reach the Infinity Engine"
    },
    effect: {
      type: "infinitePower",
      value: 2.0,
      global: true
    }
  }
};

// Utility Functions
export const getUpgradesByType = (type: SciFiUpgrade['type']): SciFiUpgrade[] => {
  return Object.values(SCIFI_UPGRADES).filter(upgrade => upgrade.type === type);
};

export const getRelicUpgrades = (): SciFiUpgrade[] => {
  return getUpgradesByType('relic');
};

export const getLayerByAltitude = (altitude: number): LayerDefinition => {
  const layers = Object.values(SCIFI_LAYERS);
  let currentLayer = layers[0];
  
  for (const layer of layers) {
    if (altitude >= layer.altitudeThreshold) {
      currentLayer = layer;
    } else {
      break;
    }
  }
  
  return currentLayer;
};

export const checkUnlockCondition = (
  upgrade: SciFiUpgrade,
  gameState: {
    meteorsDestroyed: number;
    currentLayer: number;
    timeInCurrentLayer: number;
    cannonProgress: Record<string, { tier: number; abilities: string[] }>;
    defeatedBosses: string[];
  }
): boolean => {
  const { unlockCondition } = upgrade;
  
  switch (unlockCondition.type) {
    case "meteors":
      return gameState.meteorsDestroyed >= (unlockCondition.requirement as number);
    
    case "layer":
      return gameState.currentLayer >= (unlockCondition.requirement as number);
    
    case "time":
      return unlockCondition.layer 
        ? gameState.currentLayer >= unlockCondition.layer && gameState.timeInCurrentLayer >= (unlockCondition.requirement as number)
        : gameState.timeInCurrentLayer >= (unlockCondition.requirement as number);
    
    case "cannon":
      const cannons = Object.values(gameState.cannonProgress);
      if (unlockCondition.requirement === "maxUpgrade") {
        return cannons.some(cannon => cannon.tier >= 5);
      }
      if (unlockCondition.requirement === "maxAbilities") {
        return cannons.some(cannon => cannon.abilities.length >= 5);
      }
      return cannons.length >= (unlockCondition.requirement as number);
    
    case "boss":
      return gameState.defeatedBosses.includes(unlockCondition.requirement as string);
    
    default:
      return false;
  }
};