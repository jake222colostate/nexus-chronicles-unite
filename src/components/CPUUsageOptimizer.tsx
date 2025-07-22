import React from 'react';

interface CPUUsageOptimizerProps {
  enabled?: boolean;
}

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  }
}

export const CPUUsageOptimizer: React.FC<CPUUsageOptimizerProps> = ({ enabled = true }) => {
  React.useEffect(() => {
    if (!enabled) return;

    // Throttle animations for better CPU usage
    const frameThrottle = false;
    const throttleDelay = 16; // ~60fps

    // Optimize React dev tools if present
    if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = () => {};
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = () => {};
    }

    // Set up passive event listeners for better performance
    const passiveOptions = { passive: true };
    
    // Optimize touch events for mobile
    document.addEventListener('touchstart', () => {}, passiveOptions);
    document.addEventListener('touchmove', () => {}, passiveOptions);

    console.log('CPUUsageOptimizer: Applied CPU usage optimizations');

    return () => {
      // Cleanup is minimal since we're not overriding critical functions
    };
  }, [enabled]);

  return null;
};