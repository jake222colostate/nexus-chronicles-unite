
import React, { useState, useEffect, useRef } from 'react';

interface PerformanceTrackerProps {
  onPerformanceUpdate?: (fps: number, frameTime: number) => void;
}

export const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({ 
  onPerformanceUpdate 
}) => {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime.current;
      frameCount.current++;
      
      if (delta >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / delta);
        setFps(currentFps);
        onPerformanceUpdate?.(currentFps, delta / frameCount.current);
        
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
    
    return () => {
      if (fpsInterval.current) {
        clearInterval(fpsInterval.current);
      }
    };
  }, [onPerformanceUpdate]);

  return null;
};
