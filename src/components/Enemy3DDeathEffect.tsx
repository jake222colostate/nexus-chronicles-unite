
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface Enemy3DDeathEffectProps {
  position: [number, number, number];
  realm: 'fantasy' | 'scifi';
  onComplete: () => void;
}

export const Enemy3DDeathEffect: React.FC<Enemy3DDeathEffectProps> = ({
  position,
  realm,
  onComplete
}) => {
  const groupRef = useRef<any>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    if (!groupRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / 1.2; // 1.2 second animation

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Burst effect - particles expanding outward
    groupRef.current.children.forEach((child: any, index: number) => {
      if (child.isMesh) {
        const angle = (index / 12) * Math.PI * 2;
        const distance = progress * 3;
        
        child.position.x = Math.cos(angle) * distance;
        child.position.y = progress * 2;
        child.position.z = Math.sin(angle) * distance;
        
        child.scale.setScalar((1 - progress) * 0.3);
        
        if (child.material) {
          child.material.opacity = 1 - progress;
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Burst particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial
            color={realm === 'fantasy' ? '#fbbf24' : '#06b6d4'}
            transparent
          />
        </mesh>
      ))}
      
      {/* Central flash */}
      <mesh>
        <sphereGeometry args={[0.5]} />
        <meshBasicMaterial
          color={realm === 'fantasy' ? '#f59e0b' : '#0ea5e9'}
          transparent
        />
      </mesh>
    </group>
  );
};
