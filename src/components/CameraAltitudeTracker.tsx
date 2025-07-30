import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';

interface CameraAltitudeTrackerProps {
  onAltitudeChange: (altitude: number) => void;
  enabled: boolean;
}

export const CameraAltitudeTracker: React.FC<CameraAltitudeTrackerProps> = ({
  onAltitudeChange,
  enabled
}) => {
  const { camera } = useThree();

  useFrame(() => {
    if (enabled && camera) {
      // Convert camera Y position to altitude (multiply by 30 for easier layer progression)
      const altitude = Math.max(0, camera.position.y * 30);
      onAltitudeChange(altitude);
      
      // More frequent debug logging
      if (Math.floor(Date.now() / 100) % 10 === 0) {
        console.log(`📍 Camera Y: ${camera.position.y.toFixed(2)}, Altitude: ${altitude.toFixed(1)}`);
      }
    }
  });

  return null; // This component just tracks, doesn't render anything
};