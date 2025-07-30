import React, { useMemo } from 'react';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';

interface ScifiLayerEffectsProps {
  onDifficultyScale?: (scale: number) => void;
  onMeteorSpeedScale?: (scale: number) => void;
  onLootDropScale?: (scale: number) => void;
}

export const ScifiLayerEffects: React.FC<ScifiLayerEffectsProps> = ({
  onDifficultyScale,
  onMeteorSpeedScale,
  onLootDropScale
}) => {
  const { currentLayer, unlockedUpgrades } = useScifiLayerStore();

  // Enhanced scaling factors with layer-specific mechanics
  const layerScaling = useMemo(() => {
    // Base scaling gets more aggressive at higher layers
    const baseScale = {
      meteorSpeed: 1 + (currentLayer - 1) * (currentLayer < 5 ? 0.1 : 0.15),
      meteorHealth: 1 + (currentLayer - 1) * (currentLayer < 5 ? 0.25 : 0.35),
      lootDropChance: 1 + (currentLayer - 1) * 0.03,
      difficultyMultiplier: 1 + (currentLayer - 1) * (currentLayer < 5 ? 0.15 : 0.2),
      platformStability: Math.max(0.4, 1 - (currentLayer - 1) * 0.05), // Platforms become less stable
      meteorSize: 1 + (currentLayer - 1) * 0.08, // Larger meteors at higher layers
      meteorCount: 1 + Math.floor((currentLayer - 1) * 0.3), // More meteors spawn
    };

    // Layer-specific mechanics
    const layerMechanics = {
      hasElectricStorms: currentLayer >= 4, // Magnetic Storm and beyond
      hasGravityWaves: currentLayer >= 6, // Void Nexus and beyond  
      hasQuantumFlux: currentLayer >= 8, // Quantum Anomaly and beyond
      hasSingularityPull: currentLayer >= 10, // Singularity Edge
      meteorShielding: currentLayer >= 3 ? 0.1 + (currentLayer - 3) * 0.05 : 0, // Some meteors resist damage
    };

    // Apply upgrade bonuses
    let speedScale = baseScale.meteorSpeed;
    let lootScale = baseScale.lootDropChance;
    let difficultyScale = baseScale.difficultyMultiplier;
    let stabilityScale = baseScale.platformStability;

    // Gravity Anchor Array - Platform stability and slower meteors
    if (unlockedUpgrades.includes('gravityAnchorArray')) {
      speedScale *= 0.85; // 15% slower meteors
      stabilityScale = Math.min(1, stabilityScale * 1.3); // 30% more stable platforms
    }

    // Meteor Refractor - Enhanced loot and meteor interaction
    if (unlockedUpgrades.includes('meteorRefractor')) {
      lootScale *= 1.25; // 25% more loot
    }

    // Ion Stabilizer Core - Platform and cannon improvements  
    if (unlockedUpgrades.includes('ionStabilizerCore')) {
      stabilityScale = Math.min(1, stabilityScale * 1.2); // 20% more stable
    }

    return {
      ...baseScale,
      ...layerMechanics,
      meteorSpeed: speedScale,
      lootDropChance: lootScale,
      difficultyMultiplier: difficultyScale,
      platformStability: stabilityScale
    };
  }, [currentLayer, unlockedUpgrades]);

  // Apply effects through callbacks
  React.useEffect(() => {
    onDifficultyScale?.(layerScaling.difficultyMultiplier);
  }, [layerScaling.difficultyMultiplier, onDifficultyScale]);

  React.useEffect(() => {
    onMeteorSpeedScale?.(layerScaling.meteorSpeed);
  }, [layerScaling.meteorSpeed, onMeteorSpeedScale]);

  React.useEffect(() => {
    onLootDropScale?.(layerScaling.lootDropChance);
  }, [layerScaling.lootDropChance, onLootDropScale]);

  // Enhanced layer themes with unique characteristics
  const getLayerTheme = () => {
    switch (currentLayer) {
      case 1: // Atmospheric Entry
        return { 
          color: '#3b82f6', 
          intensity: 0.8, 
          fogColor: '#1e40af',
          particleColor: '#60a5fa',
          name: 'Atmospheric Entry'
        };
      case 2: // Ionosphere
        return { 
          color: '#8b5cf6', 
          intensity: 0.9, 
          fogColor: '#7c3aed',
          particleColor: '#a78bfa',
          name: 'Ionosphere'
        };
      case 3: // Solar Wind Zone
        return { 
          color: '#f59e0b', 
          intensity: 1.0, 
          fogColor: '#d97706',
          particleColor: '#fbbf24',
          name: 'Solar Wind Zone'
        };
      case 4: // Magnetic Storm
        return { 
          color: '#ef4444', 
          intensity: 1.1, 
          fogColor: '#dc2626',
          particleColor: '#f87171',
          name: 'Magnetic Storm'
        };
      case 5: // Cosmic Radiation
        return { 
          color: '#10b981', 
          intensity: 1.2, 
          fogColor: '#059669',
          particleColor: '#34d399',
          name: 'Cosmic Radiation'
        };
      case 6: // Void Nexus
        return { 
          color: '#6366f1', 
          intensity: 1.3, 
          fogColor: '#4f46e5',
          particleColor: '#818cf8',
          name: 'Void Nexus'
        };
      case 7: // Dark Matter Field
        return { 
          color: '#8b5a3c', 
          intensity: 1.4, 
          fogColor: '#78350f',
          particleColor: '#a16207',
          name: 'Dark Matter Field'
        };
      case 8: // Quantum Anomaly
        return { 
          color: '#ec4899', 
          intensity: 1.5, 
          fogColor: '#db2777',
          particleColor: '#f472b6',
          name: 'Quantum Anomaly'
        };
      case 9: // Stellar Core Proximity
        return { 
          color: '#f97316', 
          intensity: 1.6, 
          fogColor: '#ea580c',
          particleColor: '#fb923c',
          name: 'Stellar Core Proximity'
        };
      case 10: // Singularity Edge
        return { 
          color: '#0f172a', 
          intensity: 1.8, 
          fogColor: '#1e293b',
          particleColor: '#475569',
          name: 'Singularity Edge'
        };
      default: // Beyond Known Space
        const layerDiff = currentLayer - 10;
        return { 
          color: '#dc2626', 
          intensity: 1.8 + layerDiff * 0.1,
          fogColor: '#991b1b',
          particleColor: '#ef4444',
          name: `Beyond Layer ${currentLayer}`
        };
    }
  };

  const theme = getLayerTheme();

  return (
    <>
      {/* Enhanced ambient layer lighting */}
      <ambientLight intensity={theme.intensity * 0.3} color={theme.color} />
      
      {/* Layer-specific directional lighting */}
      <directionalLight 
        intensity={theme.intensity * 0.5} 
        color={theme.particleColor} 
        position={[10, 10, 5]} 
      />
      
      {/* Dynamic fog with layer-specific characteristics */}
      <fog attach="fog" args={[theme.fogColor, 5 + currentLayer * 2, Math.max(50, 200 - currentLayer * 8)]} />
      
      {/* Layer-specific environmental effects */}
      {currentLayer >= 2 && ( // Ionosphere: Electric effects
        <pointLight 
          intensity={0.5} 
          color="#8b5cf6" 
          position={[0, 20, 0]} 
          distance={100}
        />
      )}
      
      {currentLayer >= 4 && ( // Magnetic Storm: Flickering lights
        <spotLight 
          intensity={0.8 + Math.sin(Date.now() * 0.01) * 0.3} 
          color="#ef4444" 
          position={[15, 15, 15]} 
          angle={0.3}
          penumbra={0.5}
        />
      )}
      
      {currentLayer >= 6 && ( // Void Nexus: Pulsing ambient
        <ambientLight 
          intensity={0.2 + Math.sin(Date.now() * 0.005) * 0.1} 
          color="#6366f1" 
        />
      )}
      
      {currentLayer >= 8 && ( // Quantum Anomaly: Shifting lights
        <pointLight 
          intensity={0.6} 
          color={theme.particleColor} 
          position={[
            Math.sin(Date.now() * 0.003) * 20,
            10 + Math.cos(Date.now() * 0.002) * 5,
            Math.cos(Date.now() * 0.004) * 15
          ]} 
        />
      )}
      
      {currentLayer >= 10 && ( // Singularity Edge: Dark distortion
        <>
          <ambientLight intensity={0.1} color="#1e293b" />
          <hemisphereLight 
            args={["#0f172a", "#475569", 0.3]}
          />
        </>
      )}
    </>
  );
};