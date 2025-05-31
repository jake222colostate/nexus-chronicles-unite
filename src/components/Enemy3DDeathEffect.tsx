
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

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
  const groupRef = useRef<Group>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    if (!groupRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / 1.5; // 1.5 second animation

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Enhanced burst effect with multiple particle types
    groupRef.current.children.forEach((child: any, index: number) => {
      if (child.isMesh) {
        const particleType = index % 3;
        
        if (particleType === 0) {
          // Expanding particles
          const angle = (index / 20) * Math.PI * 2;
          const distance = progress * 4;
          
          child.position.x = Math.cos(angle) * distance;
          child.position.y = progress * 3 + Math.sin(progress * 10) * 0.5;
          child.position.z = Math.sin(angle) * distance;
          
          child.scale.setScalar((1 - progress) * 0.4);
          
        } else if (particleType === 1) {
          // Upward floating particles
          child.position.y = progress * 5;
          child.position.x = Math.sin(progress * 8 + index) * 0.5;
          child.position.z = Math.cos(progress * 8 + index) * 0.5;
          
          child.scale.setScalar((1 - progress) * 0.3);
          
        } else {
          // Spinning fragments
          const angle = (index / 10) * Math.PI * 2 + progress * Math.PI * 4;
          const radius = progress * 2;
          
          child.position.x = Math.cos(angle) * radius;
          child.position.y = progress * 2;
          child.position.z = Math.sin(angle) * radius;
          
          child.rotation.x = progress * Math.PI * 3;
          child.rotation.y = progress * Math.PI * 2;
          child.scale.setScalar((1 - progress) * 0.2);
        }
        
        if (child.material) {
          child.material.opacity = Math.max(0, 1 - progress * 1.5);
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main burst particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`burst-${i}`}>
          <sphereGeometry args={[0.12]} />
          <meshBasicMaterial
            color={realm === 'fantasy' ? '#fbbf24' : '#06b6d4'}
            transparent
          />
        </mesh>
      ))}
      
      {/* Floating sparkles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={`sparkle-${i}`}>
          <octahedronGeometry args={[0.08]} />
          <meshBasicMaterial
            color={realm === 'fantasy' ? '#f59e0b' : '#0ea5e9'}
            transparent
          />
        </mesh>
      ))}
      
      {/* Fragment pieces */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`fragment-${i}`}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial
            color={realm === 'fantasy' ? '#dc2626' : '#8b5cf6'}
            transparent
          />
        </mesh>
      ))}
      
      {/* Central explosion flash */}
      <mesh>
        <sphereGeometry args={[1.0]} />
        <meshBasicMaterial
          color={realm === 'fantasy' ? '#f59e0b' : '#0ea5e9'}
          transparent
        />
      </mesh>
      
      {/* Ground impact ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <ringGeometry args={[0, 3, 16]} />
        <meshBasicMaterial
          color={realm === 'fantasy' ? '#a855f7' : '#06b6d4'}
          transparent
        />
      </mesh>
    </group>
  );
};
