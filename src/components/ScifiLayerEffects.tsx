import React, { useMemo } from 'react';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { SCIFI_LAYERS } from '@/data/SciFiUpgradeSystem';

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
    const difficultyScale = baseScale.difficultyMultiplier;
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

  // Enhanced layer themes using the new system
  const getLayerTheme = () => {
    const layerData = SCIFI_LAYERS[currentLayer];
    if (layerData) {
      return {
        ...layerData.visual,
        name: layerData.name,
        intensity: 0.8 + (currentLayer - 1) * 0.1
      };
    }
    
    // Fallback for layers beyond defined range
    return {
      color: '#dc2626',
      fogColor: '#991b1b', 
      particleColor: '#ef4444',
      name: `Beyond Layer ${currentLayer}`,
      intensity: 1.8 + (currentLayer - 8) * 0.1
    };
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