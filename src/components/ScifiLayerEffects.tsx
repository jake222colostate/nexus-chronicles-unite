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

  // Calculate scaling factors based on current layer
  const layerScaling = useMemo(() => {
    const baseScale = {
      meteorSpeed: 1 + (currentLayer - 1) * 0.1,
      meteorHealth: 1 + (currentLayer - 1) * 0.25,
      lootDropChance: 1 + (currentLayer - 1) * 0.02,
      difficultyMultiplier: 1 + (currentLayer - 1) * 0.15
    };

    // Apply upgrade bonuses
    let speedScale = baseScale.meteorSpeed;
    let lootScale = baseScale.lootDropChance;
    let difficultyScale = baseScale.difficultyMultiplier;

    // Gravity Anchor Array - Slightly slows scroll/platform decay
    if (unlockedUpgrades.includes('gravityAnchorArray')) {
      speedScale *= 0.85; // 15% slower
    }

    // Meteor Refractor - +Chance for meteors to drop bonus loot
    if (unlockedUpgrades.includes('meteorRefractor')) {
      lootScale *= 1.25; // 25% more loot
    }

    return {
      ...baseScale,
      meteorSpeed: speedScale,
      lootDropChance: lootScale,
      difficultyMultiplier: difficultyScale
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

  // Visual layer effects (optional)
  const getLayerTheme = () => {
    switch (currentLayer) {
      case 1:
        return { color: '#3b82f6', intensity: 0.8 }; // Blue
      case 2:
        return { color: '#8b5cf6', intensity: 0.9 }; // Purple
      case 3:
        return { color: '#f59e0b', intensity: 1.0 }; // Orange
      case 4:
        return { color: '#ef4444', intensity: 1.1 }; // Red
      default:
        return { color: '#dc2626', intensity: 1.2 + (currentLayer - 5) * 0.1 }; // Deep red+
    }
  };

  const theme = getLayerTheme();

  return (
    <>
      {/* Ambient layer lighting effect */}
      <ambientLight intensity={0.3} color={theme.color} />
      
      {/* Dynamic fog based on layer */}
      <fog attach="fog" args={[theme.color, 10, 200 - currentLayer * 10]} />
      
      {/* Layer-specific particle effects could go here */}
      {currentLayer >= 3 && (
        <group>
          {/* Add particle systems or special effects for higher layers */}
        </group>
      )}
    </>
  );
};