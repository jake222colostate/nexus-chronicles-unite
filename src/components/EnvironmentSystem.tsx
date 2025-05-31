
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DynamicSkybox } from './DynamicSkybox';
import { PixelTerrainSystem } from './PixelTerrainSystem';

interface EnvironmentSystemProps {
  upgradeCount: number;
  onEnvironmentChange?: (tier: number) => void;
  playerPosition?: [number, number, number];
}

export const EnvironmentSystem: React.FC<EnvironmentSystemProps> = ({
  upgradeCount,
  onEnvironmentChange,
  playerPosition = [0, 0, 0]
}) => {
  const [currentTier, setCurrentTier] = useState(1);
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastNotifiedTier = useRef(1);

  // Calculate environment tier based on upgrade count
  const environmentTier = useMemo(() => {
    if (upgradeCount < 3) return 1;
    if (upgradeCount < 6) return 2;
    if (upgradeCount < 9) return 3;
    if (upgradeCount < 12) return 4;
    return 5;
  }, [upgradeCount]);

  // Handle environment transitions
  useEffect(() => {
    if (environmentTier !== currentTier && !isTransitioning) {
      setIsTransitioning(true);
      
      // Smooth fade transition
      setTransitionOpacity(0.5);
      
      const transitionTimeout = setTimeout(() => {
        setCurrentTier(environmentTier);
        setTransitionOpacity(1);
        setIsTransitioning(false);
        
        // Notify of tier change
        if (lastNotifiedTier.current !== environmentTier && onEnvironmentChange) {
          lastNotifiedTier.current = environmentTier;
          onEnvironmentChange(environmentTier);
        }
      }, 400);

      return () => clearTimeout(transitionTimeout);
    }
  }, [environmentTier, currentTier, isTransitioning, onEnvironmentChange]);

  return (
    <>
      {/* Enhanced Dynamic Skybox */}
      <DynamicSkybox tier={currentTier} opacity={transitionOpacity} />
      
      {/* Seamless Pixel Terrain with Parallax */}
      <PixelTerrainSystem 
        tier={currentTier} 
        opacity={transitionOpacity}
        playerPosition={playerPosition}
      />
      
      {/* Enhanced atmospheric fog */}
      <fog 
        attach="fog" 
        args={[
          currentTier <= 2 ? '#E0F6FF' : currentTier <= 3 ? '#8B008B' : currentTier <= 4 ? '#191970' : '#0C0C0C', 
          40, 
          150
        ]} 
      />
    </>
  );
};
