// 🌌 Comprehensive 10-Layer Sci-Fi Progression System
// Each layer features unique themes, visual elements, and scaling

export interface LayerThemeConfig {
  id: number;
  name: string;
  altitudeThreshold: number;
  visual: {
    theme: string;
    primaryColor: string;
    fogColor: string;
    particleColor: string;
    ambientIntensity: number;
  };
  decorations: {
    type: string;
    count: number;
    properties: Record<string, any>;
  }[];
  backgroundFX: {
    type: string;
    properties: Record<string, any>;
  }[];
  meteors: {
    spawnRate: number;
    health: number;
    speed: number;
    shielding: number;
  };
  progression: {
    unlocks: string[];
    difficultyMultiplier: number;
  };
}

export const SCIFI_LAYER_THEMES: Record<number, LayerThemeConfig> = {
  1: {
    id: 1,
    name: "Lower Orbit",
    altitudeThreshold: 0,
    visual: {
      theme: "atmospheric",
      primaryColor: "#3b82f6",
      fogColor: "#1e40af",
      particleColor: "#60a5fa",
      ambientIntensity: 0.3
    },
    decorations: [
      {
        type: "antennas",
        count: 4,
        properties: {
          radius: 6,
          height: 3,
          color: "#60a5fa",
          wireframe: false
        }
      }
    ],
    backgroundFX: [
      {
        type: "atmosphere_glow",
        properties: {
          intensity: 0.5,
          color: "#3b82f6"
        }
      }
    ],
    meteors: {
      spawnRate: 1.0,
      health: 1.0,
      speed: 1.0,
      shielding: 0.0
    },
    progression: {
      unlocks: [],
      difficultyMultiplier: 1.0
    }
  },

  2: {
    id: 2,
    name: "Debris Field",
    altitudeThreshold: 1000,
    visual: {
      theme: "debris",
      primaryColor: "#8b5cf6",
      fogColor: "#7c3aed",
      particleColor: "#a78bfa",
      ambientIntensity: 0.2
    },
    decorations: [
      {
        type: "debris_chunks",
        count: 6,
        properties: {
          radius: 7,
          size: [0.8, 1.2],
          color: "#8b5cf6",
          wireframe: true,
          rotation: "random"
        }
      }
    ],
    backgroundFX: [
      {
        type: "electrical_sparks",
        properties: {
          count: 20,
          color: "#a78bfa",
          flickering: true
        }
      }
    ],
    meteors: {
      spawnRate: 1.2,
      health: 1.25,
      speed: 1.1,
      shielding: 0.05
    },
    progression: {
      unlocks: ["meteorRefractor"],
      difficultyMultiplier: 1.2
    }
  },

  3: {
    id: 3,
    name: "Crystal Belt",
    altitudeThreshold: 2000,
    visual: {
      theme: "crystal",
      primaryColor: "#a855f7",
      fogColor: "#9333ea",
      particleColor: "#c084fc",
      ambientIntensity: 0.4
    },
    decorations: [
      {
        type: "energy_crystals",
        count: 8,
        properties: {
          radius: 8,
          height: 2.5,
          color: "#c084fc",
          wireframe: false,
          glow: true,
          pulsing: true
        }
      }
    ],
    backgroundFX: [
      {
        type: "crystal_resonance",
        properties: {
          rings: 3,
          color: "#a855f7",
          pulsing: 0.5
        }
      }
    ],
    meteors: {
      spawnRate: 1.4,
      health: 1.5,
      speed: 1.2,
      shielding: 0.1
    },
    progression: {
      unlocks: ["crystalHarvester"],
      difficultyMultiplier: 1.4
    }
  },

  4: {
    id: 4,
    name: "Graviton Ring",
    altitudeThreshold: 3000,
    visual: {
      theme: "gravity",
      primaryColor: "#ef4444",
      fogColor: "#dc2626",
      particleColor: "#f87171",
      ambientIntensity: 0.3
    },
    decorations: [
      {
        type: "gravity_rings",
        count: 3,
        properties: {
          radius: [5, 7, 9],
          thickness: 0.3,
          color: "#f87171",
          wireframe: true,
          tilt: 15,
          rotation: "slow"
        }
      }
    ],
    backgroundFX: [
      {
        type: "gravity_waves",
        properties: {
          distortion: 0.3,
          frequency: 0.2
        }
      }
    ],
    meteors: {
      spawnRate: 1.6,
      health: 2.0,
      speed: 1.3,
      shielding: 0.15
    },
    progression: {
      unlocks: ["gravityManipulator"],
      difficultyMultiplier: 1.6
    }
  },

  5: {
    id: 5,
    name: "Blackhole Verge",
    altitudeThreshold: 4000,
    visual: {
      theme: "blackhole",
      primaryColor: "#1f2937",
      fogColor: "#111827",
      particleColor: "#dc2626",
      ambientIntensity: 0.1
    },
    decorations: [
      {
        type: "event_horizon",
        count: 1,
        properties: {
          radius: 10,
          color: "#1f2937",
          innerGlow: "#dc2626",
          distortion: true
        }
      },
      {
        type: "matter_streams",
        count: 4,
        properties: {
          length: 8,
          color: "#dc2626",
          spiraling: true
        }
      }
    ],
    backgroundFX: [
      {
        type: "spacetime_distortion",
        properties: {
          intensity: 0.7,
          center: [0, 0, 0]
        }
      }
    ],
    meteors: {
      spawnRate: 1.8,
      health: 2.5,
      speed: 1.4,
      shielding: 0.2
    },
    progression: {
      unlocks: ["blackholeHarness"],
      difficultyMultiplier: 1.8
    }
  },

  6: {
    id: 6,
    name: "Radiant Grid",
    altitudeThreshold: 5000,
    visual: {
      theme: "grid",
      primaryColor: "#06b6d4",
      fogColor: "#0891b2",
      particleColor: "#67e8f9",
      ambientIntensity: 0.5
    },
    decorations: [
      {
        type: "holo_grid",
        count: 1,
        properties: {
          size: 20,
          divisions: 10,
          color: "#67e8f9",
          opacity: 0.6,
          animated: true
        }
      },
      {
        type: "data_nodes",
        count: 12,
        properties: {
          radius: 9,
          size: 0.4,
          color: "#06b6d4",
          pulsing: true
        }
      }
    ],
    backgroundFX: [
      {
        type: "energy_grid",
        properties: {
          lines: true,
          nodes: true,
          dataFlow: true
        }
      }
    ],
    meteors: {
      spawnRate: 2.0,
      health: 3.0,
      speed: 1.5,
      shielding: 0.25
    },
    progression: {
      unlocks: ["quantumGrid"],
      difficultyMultiplier: 2.0
    }
  },

  7: {
    id: 7,
    name: "Bio-Tech Bloom",
    altitudeThreshold: 6000,
    visual: {
      theme: "biotech",
      primaryColor: "#22c55e",
      fogColor: "#16a34a",
      particleColor: "#4ade80",
      ambientIntensity: 0.4
    },
    decorations: [
      {
        type: "bio_tendrils",
        count: 8,
        properties: {
          length: 6,
          thickness: 0.3,
          color: "#4ade80",
          organic: true,
          growing: true
        }
      },
      {
        type: "bio_nodes",
        count: 6,
        properties: {
          radius: 7,
          size: 1.2,
          color: "#22c55e",
          pulsing: true,
          organic: true
        }
      }
    ],
    backgroundFX: [
      {
        type: "organic_growth",
        properties: {
          spreading: true,
          color: "#22c55e",
          animated: true
        }
      }
    ],
    meteors: {
      spawnRate: 2.2,
      health: 3.5,
      speed: 1.6,
      shielding: 0.3
    },
    progression: {
      unlocks: ["bioHarvester"],
      difficultyMultiplier: 2.2
    }
  },

  8: {
    id: 8,
    name: "Quantum Anomaly Zone",
    altitudeThreshold: 7000,
    visual: {
      theme: "quantum",
      primaryColor: "#ec4899",
      fogColor: "#db2777",
      particleColor: "#f472b6",
      ambientIntensity: 0.6
    },
    decorations: [
      {
        type: "quantum_fragments",
        count: 10,
        properties: {
          radius: 8,
          size: 0.6,
          color: "#f472b6",
          phasing: true,
          unstable: true
        }
      }
    ],
    backgroundFX: [
      {
        type: "quantum_fluctuations",
        properties: {
          instability: 0.8,
          phaseShift: true,
          colorShift: true
        }
      }
    ],
    meteors: {
      spawnRate: 2.5,
      health: 4.0,
      speed: 1.8,
      shielding: 0.35
    },
    progression: {
      unlocks: ["quantumStabilizer"],
      difficultyMultiplier: 2.5
    }
  },

  9: {
    id: 9,
    name: "Nebula Forge",
    altitudeThreshold: 8000,
    visual: {
      theme: "nebula",
      primaryColor: "#f59e0b",
      fogColor: "#d97706",
      particleColor: "#fbbf24",
      ambientIntensity: 0.7
    },
    decorations: [
      {
        type: "plasma_arcs",
        count: 6,
        properties: {
          length: 10,
          thickness: 0.4,
          color: "#fbbf24",
          electrical: true,
          branching: true
        }
      },
      {
        type: "energy_storms",
        count: 3,
        properties: {
          radius: 4,
          intensity: 0.8,
          color: "#f59e0b",
          chaotic: true
        }
      }
    ],
    backgroundFX: [
      {
        type: "plasma_lightning",
        properties: {
          bolts: 15,
          color: "#fbbf24",
          intensity: 0.9,
          randomStrike: true
        }
      }
    ],
    meteors: {
      spawnRate: 2.8,
      health: 4.5,
      speed: 2.0,
      shielding: 0.4
    },
    progression: {
      unlocks: ["plasmaForge"],
      difficultyMultiplier: 2.8
    }
  },

  10: {
    id: 10,
    name: "Singularity Core",
    altitudeThreshold: 9000,
    visual: {
      theme: "singularity",
      primaryColor: "#7c3aed",
      fogColor: "#6d28d9",
      particleColor: "#a78bfa",
      ambientIntensity: 0.8
    },
    decorations: [
      {
        type: "singularity_core",
        count: 1,
        properties: {
          radius: 2,
          color: "#7c3aed",
          distortion: 1.0,
          gravityWells: true
        }
      },
      {
        type: "distortion_rings",
        count: 5,
        properties: {
          radius: [3, 5, 7, 9, 11],
          color: "#a78bfa",
          warping: true,
          recursive: true
        }
      }
    ],
    backgroundFX: [
      {
        type: "spacetime_collapse",
        properties: {
          intensity: 1.0,
          distortionWaves: true,
          realityBend: true
        }
      }
    ],
    meteors: {
      spawnRate: 3.0,
      health: 5.0,
      speed: 2.2,
      shielding: 0.45
    },
    progression: {
      unlocks: ["singularityHarness"],
      difficultyMultiplier: 3.0
    }
  }
};

// Layer transition system
export const getLayerByAltitude = (altitude: number): LayerThemeConfig => {
  const layers = Object.values(SCIFI_LAYER_THEMES);
  let currentLayer = layers[0];
  
  console.log(`🔍 Checking altitude ${altitude} against ${layers.length} layers`);
  
  for (const layer of layers) {
    console.log(`  Layer ${layer.id}: threshold ${layer.altitudeThreshold}, name: ${layer.name}`);
    if (altitude >= layer.altitudeThreshold) {
      currentLayer = layer;
      console.log(`  ✅ Qualifies for Layer ${layer.id}`);
    } else {
      console.log(`  ❌ Does not qualify for Layer ${layer.id}`);
    }
  }
  
  console.log(`🎯 Final layer: ${currentLayer.id} - ${currentLayer.name}`);
  return currentLayer;
};

// Layer progression utilities
export const getNextLayerProgress = (currentAltitude: number, currentLayerId: number): number => {
  const currentLayer = SCIFI_LAYER_THEMES[currentLayerId];
  const nextLayer = SCIFI_LAYER_THEMES[currentLayerId + 1];
  
  if (!nextLayer) return 100; // Max layer reached
  
  const progressInLayer = currentAltitude - currentLayer.altitudeThreshold;
  const layerHeight = nextLayer.altitudeThreshold - currentLayer.altitudeThreshold;
  
  return Math.min(100, (progressInLayer / layerHeight) * 100);
};

export const getLayerNotification = (layerId: number): string => {
  const layer = SCIFI_LAYER_THEMES[layerId];
  return `🌌 Layer ${layerId} Reached: ${layer?.name || 'Unknown Layer'}`;
};