
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface TapEffect3DProps {
  realm: 'fantasy' | 'scifi';
  onComplete: () => void;
}

export const TapEffect3D: React.FC<TapEffect3DProps> = ({ realm, onComplete }) => {
  const effectRef = useRef<Mesh>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    if (effectRef.current) {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const progress = elapsed / 0.8; // Shorter duration

      if (progress >= 1) {
        onComplete();
        return;
      }

      // Simple expand effect - no complex particles
      const scale = 1 + progress * 1.5;
      const opacity = Math.max(0, 1 - progress);

      effectRef.current.scale.setScalar(scale);
      if (effectRef.current.material) {
        (effectRef.current.material as any).opacity = opacity;
      }
    }
  });

  return (
    <mesh ref={effectRef} position={[0, 0, 2]}>
      <ringGeometry args={[0.3, 0.7, 8]} />
      <meshBasicMaterial
        color={realm === 'fantasy' ? '#a855f7' : '#22d3ee'}
        transparent
        opacity={1}
      />
    </mesh>
  );
};
