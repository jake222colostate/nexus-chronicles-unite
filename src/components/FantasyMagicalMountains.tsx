
import React from 'react';
import * as THREE from 'three';

export const FantasyMagicalMountains: React.FC = () => {
  return (
    <group>
      {/* Left side mountains */}
      {[...Array(3)].map((_, i) => (
        <group key={`left-${i}`} position={[-70 + i * 50, 0, -120]}>
          <mesh castShadow>
            <coneGeometry args={[10, 30, 6]} />
            <meshStandardMaterial color="#5f2c91" flatShading />
          </mesh>
          <mesh position={[0, 18, 0]} castShadow>
            <octahedronGeometry args={[2]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={2}
            />
          </mesh>
          {/* Additional crystal details */}
          <mesh position={[3, 12, 2]} castShadow>
            <octahedronGeometry args={[1]} />
            <meshStandardMaterial
              color="#4fd3ff"
              emissive="#4fd3ff"
              emissiveIntensity={1.5}
            />
          </mesh>
          <mesh position={[-2, 15, -1]} castShadow>
            <octahedronGeometry args={[0.8]} />
            <meshStandardMaterial
              color="#88ffff"
              emissive="#88ffff"
              emissiveIntensity={1.8}
            />
          </mesh>
        </group>
      ))}
      
      {/* Right side mountains */}
      {[...Array(3)].map((_, i) => (
        <group key={`right-${i}`} position={[70 - i * 50, 0, -120]}>
          <mesh castShadow>
            <coneGeometry args={[10, 30, 6]} />
            <meshStandardMaterial color="#5f2c91" flatShading />
          </mesh>
          <mesh position={[0, 18, 0]} castShadow>
            <octahedronGeometry args={[2]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={2}
            />
          </mesh>
          {/* Additional crystal details */}
          <mesh position={[-3, 12, 2]} castShadow>
            <octahedronGeometry args={[1]} />
            <meshStandardMaterial
              color="#4fd3ff"
              emissive="#4fd3ff"
              emissiveIntensity={1.5}
            />
          </mesh>
          <mesh position={[2, 15, -1]} castShadow>
            <octahedronGeometry args={[0.8]} />
            <meshStandardMaterial
              color="#88ffff"
              emissive="#88ffff"
              emissiveIntensity={1.8}
            />
          </mesh>
        </group>
      ))}

      {/* Background distant mountains */}
      {[...Array(4)].map((_, i) => (
        <group key={`bg-${i}`} position={[(Math.random() - 0.5) * 200, 0, -200 - i * 40]} scale={[1.5, 1.5, 1.5]}>
          <mesh castShadow>
            <coneGeometry args={[8, 25, 6]} />
            <meshStandardMaterial color="#4a1f6b" flatShading />
          </mesh>
          <mesh position={[0, 15, 0]} castShadow>
            <octahedronGeometry args={[1.5]} />
            <meshStandardMaterial
              color="#66ddff"
              emissive="#66ddff"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
