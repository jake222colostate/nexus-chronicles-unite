
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';

interface TemporaryMeteorProps {
  position: Vector3;
  health: number;
  onReachTarget?: () => void;
}

export const TemporaryMeteor: React.FC<TemporaryMeteorProps> = ({
  position,
  health,
  onReachTarget
}) => {
  const group = useRef<Group>(null);

  useFrame(() => {
    if (group.current) {
      group.current.position.copy(position);
      group.current.rotation.x += 0.02;
      group.current.rotation.y += 0.01;
      group.current.rotation.z += 0.005;

      if (group.current.position.z >= 0) {
        onReachTarget?.();
      }
    }
  });

  // Create a glowing rock-like meteor shape
  return (
    <group ref={group} position={position}>
      {/* Main meteor body - irregular rocky shape */}
      <mesh>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
          color="#4a4a4a" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Glowing core */}
      <mesh scale={[0.6, 0.6, 0.6]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial 
          color="#ff4500" 
          emissive="#ff4500"
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Outer glow effect */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshBasicMaterial 
          color="#ff6600"
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* Add some dramatic lighting */}
      <pointLight 
        position={[0, 0, 0]} 
        color="#ff4500" 
        intensity={2} 
        distance={5} 
      />
      
      {/* Health indicator - simple scale based on health */}
      <mesh position={[0, 1.2, 0]} scale={[health / 5, 0.1, 0.1]}>
        <boxGeometry args={[1, 0.2, 0.1]} />
        <meshBasicMaterial color={health > 2 ? "#00ff00" : health > 1 ? "#ffff00" : "#ff0000"} />
      </mesh>
    </group>
  );
};
