import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface PerformanceMonitorProps {
  targetFPS?: number;
  onPerformanceChange?: (fps: number, isLowPerformance: boolean) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  targetFPS = 60,
  onPerformanceChange 
}) => {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  
  useFrame(() => {
    frameCountRef.current++;
    
    // Calculate FPS every second
    const now = performance.now();
    if (now >= lastTimeRef.current + 1000) {
      const fps = (frameCountRef.current * 1000) / (now - lastTimeRef.current);
      
      // Track FPS history
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift();
      }
      
      // Calculate average FPS
      const avgFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
      const isLowPerformance = avgFPS < targetFPS - 10;
      
      // Callback to parent component
      if (onPerformanceChange) {
        onPerformanceChange(avgFPS, isLowPerformance);
      }
      
      // Reset counters
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  useEffect(() => {
    console.log('PerformanceMonitor: Initialized with target FPS:', targetFPS);
  }, [targetFPS]);

  return null; // This component only monitors, no visual elements
};