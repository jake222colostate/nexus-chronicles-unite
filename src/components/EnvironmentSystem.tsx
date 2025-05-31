
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DynamicSkybox } from './DynamicSkybox';
import { PixelTerrainSystem } from './PixelTerrainSystem';

interface EnvironmentSystemProps {
  upgradeCount: number;
  onEnvironmentChange?: (tier: number) => void;
  excludeTrees?: boolean;
  realm?: 'fantasy' | 'scifi';
}

export const EnvironmentSystem: React.FC<EnvironmentSystemProps> = ({
  upgradeCount,
  onEnvironmentChange,
  excludeTrees = false,
  realm = 'fantasy'
}) => {
  const [currentTier, setCurrentTier] = useState(1);
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastNotifiedTier = useRef(1);

  // Calculate environment tier based on upgrade count - memoized to prevent recalculation
  const environmentTier = useMemo(() => {
    if (upgradeCount < 3) return 1;
    if (upgradeCount < 6) return 2;
    if (upgradeCount < 9) return 3;
    if (upgradeCount < 12) return 4;
    return 5;
  }, [upgradeCount]);

  // Handle environment transitions - fixed to prevent infinite loops
  useEffect(() => {
    if (environmentTier !== currentTier && !isTransitioning) {
      setIsTransitioning(true);
      
      // Quick fade transition
      setTransitionOpacity(0.3);
      
      const transitionTimeout = setTimeout(() => {
        setCurrentTier(environmentTier);
        setTransitionOpacity(1);
        setIsTransitioning(false);
        
        // Only call onEnvironmentChange if tier actually changed and we haven't notified about this tier
        if (lastNotifiedTier.current !== environmentTier && onEnvironmentChange) {
          lastNotifiedTier.current = environmentTier;
          onEnvironmentChange(environmentTier);
        }
      }, 300);

      return () => clearTimeout(transitionTimeout);
    }
  }, [environmentTier, currentTier, isTransitioning, onEnvironmentChange]);

  return (
    <>
      {/* Dynamic Skybox with natural mountain transitions */}
      <DynamicSkybox tier={currentTier} opacity={transitionOpacity} />
      
      {/* Clean Pixel-style Terrain with stone path */}
      <PixelTerrainSystem 
        tier={currentTier} 
        opacity={transitionOpacity} 
        excludeTrees={excludeTrees}
        excludeMountains={realm === 'fantasy'}
      />
      
      {/* Clean atmospheric fog only */}
      <fog 
        attach="fog" 
        args={[
          currentTier <= 2 ? '#87CEEB' : currentTier <= 3 ? '#8B5CF6' : '#1E1B4B', 
          30, 
          120
        ]} 
      />
    </>
  );
};
