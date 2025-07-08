
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { EnhancedCrystalSystem } from './EnhancedCrystalSystem';

interface FloatingIslandProps {
  realm: 'fantasy' | 'scifi';
}

export const FloatingIsland: React.FC<FloatingIslandProps> = ({ realm }) => {
  const islandRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (islandRef.current) {
      // Gentle floating animation
      islandRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      islandRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group position={[0, -3, -2]}>
      {/* Main island base - increased size significantly for cannon platform */}
      <mesh ref={islandRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[8, 7, 1.5, 8]} />
        <meshLambertMaterial
          color={realm === 'fantasy' ? '#6366f1' : '#0891b2'}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Decorative rings - adjusted for larger platform */}
      <mesh position={[0, 0.8, 0]}>
        <ringGeometry args={[7.5, 8.5, 16]} />
        <meshBasicMaterial
          color={realm === 'fantasy' ? '#8b5cf6' : '#06b6d4'}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Glowing core */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={realm === 'fantasy' ? '#a855f7' : '#22d3ee'}
          transparent
          opacity={0.6}
        />
      </mesh>

      {realm === 'fantasy' && (
        <>
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={50}
                array={new Float32Array(
                  Array.from({ length: 50 * 3 }, () => (Math.random() - 0.5) * 10)
                )}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.02}
              color="#c084fc"
              transparent
              opacity={0.6}
            />
          </points>
          <EnhancedCrystalSystem maxUpgradeHeight={60} realm={realm} />
        </>
      )}
    </group>
  );
};
