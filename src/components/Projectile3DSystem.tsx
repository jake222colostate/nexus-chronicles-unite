
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface Projectile3D {
  id: string;
  position: [number, number, number];
  targetPosition: [number, number, number];
  speed: number;
  damage: number;
}

interface Projectile3DSystemProps {
  projectiles: Projectile3D[];
  realm: 'fantasy' | 'scifi';
}

const Projectile3DModel: React.FC<{ projectile: Projectile3D; realm: string }> = ({ projectile, realm }) => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Position the projectile
    groupRef.current.position.set(...projectile.position);
    
    // Rotate based on movement direction
    const dx = projectile.targetPosition[0] - projectile.position[0];
    const dz = projectile.targetPosition[2] - projectile.position[2];
    groupRef.current.rotation.y = Math.atan2(dx, dz);
    
    // Add spinning effect
    groupRef.current.rotation.x += 0.2;
  });

  const getProjectileColor = () => {
    return realm === 'fantasy' ? '#fbbf24' : '#06b6d4';
  };

  return (
    <group ref={groupRef}>
      {/* Main projectile body */}
      <mesh>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial 
          color={getProjectileColor()} 
          emissive={getProjectileColor()}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Trail effect */}
      <mesh position={[0, 0, -0.3]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color={getProjectileColor()} 
          emissive={getProjectileColor()}
          emissiveIntensity={0.1}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

export const Projectile3DSystem: React.FC<Projectile3DSystemProps> = ({ projectiles, realm }) => {
  return (
    <>
      {projectiles.map(projectile => (
        <Projectile3DModel
          key={projectile.id}
          projectile={projectile}
          realm={realm}
        />
      ))}
    </>
  );
};
