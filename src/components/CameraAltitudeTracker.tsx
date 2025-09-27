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
      // Convert camera Y position to altitude (multiply by 10 for better scaling)
      const altitude = Math.max(0, camera.position.y * 10);
      onAltitudeChange(altitude);
      
      // Debug logging every 60 frames (~1 second)
      if (Math.floor(Date.now() / 1000) % 2 === 0) {
        console.log(`📍 Camera Y: ${camera.position.y.toFixed(1)}, Altitude: ${altitude.toFixed(1)}`);
      }
    }
  });

  return null; // This component just tracks, doesn't render anything
};