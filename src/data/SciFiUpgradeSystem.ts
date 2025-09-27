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