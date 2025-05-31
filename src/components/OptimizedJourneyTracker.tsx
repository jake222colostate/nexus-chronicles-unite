
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface OptimizedJourneyTrackerProps {
  playerPosition: { x: number; y: number; z: number };
  onJourneyUpdate: (distance: number) => void;
}

export const OptimizedJourneyTracker: React.FC<OptimizedJourneyTrackerProps> = ({
  playerPosition,
  onJourneyUpdate
}) => {
  const [maxProgress, setMaxProgress] = useState(0);
  const lastUpdateRef = useRef(0);
  const updateThrottleRef = useRef<NodeJS.Timeout>();

  const throttledUpdate = useCallback((newDistance: number) => {
    if (updateThrottleRef.current) {
      clearTimeout(updateThrottleRef.current);
    }
    
    updateThrottleRef.current = setTimeout(() => {
      if (newDistance > maxProgress) {
        setMaxProgress(newDistance);
        onJourneyUpdate(newDistance);
      }
    }, 100); // Throttle updates to every 100ms
  }, [maxProgress, onJourneyUpdate]);

  useEffect(() => {
    const currentZ = Math.abs(playerPosition.z);
    
    // Only update if significant movement occurred (> 1 unit)
    if (Math.abs(currentZ - lastUpdateRef.current) > 1) {
      throttledUpdate(currentZ);
      lastUpdateRef.current = currentZ;
    }
  }, [playerPosition.z, throttledUpdate]);

  useEffect(() => {
    return () => {
      if (updateThrottleRef.current) {
        clearTimeout(updateThrottleRef.current);
      }
    };
  }, []);

  return null;
};
