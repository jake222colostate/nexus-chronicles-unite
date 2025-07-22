import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

interface FrameLimiterProps {
  fps?: number;
}

/**
 * Component that limits render updates to a fixed FPS by
 * invalidating the Three.js canvas at the desired interval.
 */
export const FrameLimiter: React.FC<FrameLimiterProps> = ({ fps = 60 }) => {
  const { invalidate } = useThree();

  useEffect(() => {
    const interval = setInterval(() => invalidate(), 1000 / fps);
    return () => clearInterval(interval);
  }, [fps, invalidate]);

  return null;
};
