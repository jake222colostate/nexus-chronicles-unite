import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';

interface ScifiUpgradeOrbProps {
  position: Vector3;
  id: string;
  onClick: (id: string) => void;
}

export const ScifiUpgradeOrb: React.FC<ScifiUpgradeOrbProps> = ({
  position,
  id,
  onClick
}) => {
  const group = useRef<Group>(null);
  
  // Random colors for variety
  const orbColor = useMemo(() => {
    const colors = ['#00ffff', '#0088ff', '#ff00ff', '#00ff88', '#ffff00'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Random size variation
  const scale = useMemo(() => 0.3 + Math.random() * 0.2, []);

  useFrame((state) => {
    if (group.current) {
      // Floating animation
      group.current.position.copy(position);
      group.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position.x) * 0.1;
      
      // Rotation animation
      group.current.rotation.x += 0.01;
      group.current.rotation.y += 0.015;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick(id);
  };

  return (
    <group ref={group} position={position}>
      {/* Simple diamond shape */}
      <mesh onClick={handleClick} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={orbColor}
          emissive={orbColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};