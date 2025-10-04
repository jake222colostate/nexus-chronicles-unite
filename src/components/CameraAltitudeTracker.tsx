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
      // Convert camera Y position to altitude (multiply by 50)
      const altitude = Math.max(0, camera.position.y * 50);
      onAltitudeChange(altitude);
      
      // Frequent debug logging to verify this is running
      console.log(`📍 ALTITUDE TRACKER: Camera Y: ${camera.position.y.toFixed(2)}, Altitude: ${altitude.toFixed(1)}`);
    }
  });

  return null; // This component just tracks, doesn't render anything
};