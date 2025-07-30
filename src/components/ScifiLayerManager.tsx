import React, { useEffect, useRef } from 'react';
import { useScifiLayerStore } from '@/stores/useScifiLayerStore';
import { useFrame } from '@react-three/fiber';

interface ScifiLayerManagerProps {
  playerAltitude: number;
  onLayerChange?: (layerNumber: number) => void;
  onUnlockUpgrade?: (upgradeId: string) => void;
}

export const ScifiLayerManager: React.FC<ScifiLayerManagerProps> = ({
  playerAltitude,
  onLayerChange,
  onUnlockUpgrade
}) => {
  const {
    updateAltitude,
    updateTimeInLayer,
    currentLayer,
    highestLayer,
    timeInCurrentLayer,
    unlockedUpgrades
  } = useScifiLayerStore();

  const lastUpdateTime = useRef(Date.now());
  const previousLayer = useRef(currentLayer);
  const previousUnlockCount = useRef(unlockedUpgrades.length);

  // Update altitude continuously
  useEffect(() => {
    updateAltitude(playerAltitude);
  }, [playerAltitude, updateAltitude]);

  // Track layer changes
  useEffect(() => {
    if (currentLayer !== previousLayer.current) {
      onLayerChange?.(currentLayer);
      previousLayer.current = currentLayer;
    }
  }, [currentLayer, onLayerChange]);

  // Track unlock changes
  useEffect(() => {
    if (unlockedUpgrades.length > previousUnlockCount.current) {
      const newUpgrade = unlockedUpgrades[unlockedUpgrades.length - 1];
      onUnlockUpgrade?.(newUpgrade);
      previousUnlockCount.current = unlockedUpgrades.length;
    }
  }, [unlockedUpgrades, onUnlockUpgrade]);

  // Update time in layer every frame
  useFrame(() => {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime.current;
    updateTimeInLayer(deltaTime);
    lastUpdateTime.current = now;
  });

  return null; // This is a logic-only component
};