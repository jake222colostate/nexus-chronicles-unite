
import React, { useState, useEffect, useRef } from 'react';

interface JourneyTrackerProps {
  playerPosition: { x: number; y: number; z: number };
  onJourneyUpdate: (distance: number) => void;
}

export const JourneyTracker: React.FC<JourneyTrackerProps> = ({
  playerPosition,
  onJourneyUpdate
}) => {
  const [maxProgress, setMaxProgress] = useState(0);
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const currentZ = Math.abs(playerPosition.z);
    
    // Only update if player moved forward (greater distance from start)
    if (currentZ > maxProgress) {
      setMaxProgress(currentZ);
      onJourneyUpdate(currentZ);
    }
    
    lastPositionRef.current = playerPosition;
  }, [playerPosition, maxProgress, onJourneyUpdate]);

  return null; // This is a tracking component with no visual output
};
