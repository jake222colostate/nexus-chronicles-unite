import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingParticle: React.FC<{ 
  position: [number, number, number]; 
  seed: number;
  color: string;
}> = ({ position, seed, color }) => {
  const particleRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (particleRef.current) {
      const time = state.clock.elapsedTime + seed;
      
      // Floating movement
      particleRef.current.position.y += Math.sin(time * 0.8) * delta * 0.3;
      particleRef.current.position.x += Math.sin(time * 0.5 + seed) * delta * 0.1;
      particleRef.current.position.z += Math.cos(time * 0.3 + seed) * delta * 0.1;
      
      // Keep particles in bounds
      if (particleRef.current.position.y > position[1] + 5) {
        particleRef.current.position.y = position[1] - 2;
      }
      if (particleRef.current.position.y < position[1] - 2) {
        particleRef.current.position.y = position[1] + 5;
      }
      
      // Pulsing glow
      const material = particleRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.4 + Math.sin(time * 2) * 0.3;
    }
  });

  return (
    <mesh ref={particleRef} position={position}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial 
        color={color}
        transparent
        opacity={0.6}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

export const MagicParticles: React.FC = () => {
  const particles = [];
  
  const colors = ['#88ffff', '#ff88ff', '#ffff88', '#88ff88', '#ff8888'];
  
  for (let i = 0; i < 150; i++) {
    const x = (Math.random() - 0.5) * 120;
    const y = Math.random() * 15 + 2;
    const z = -Math.random() * 200;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particles.push(
      <FloatingParticle
        key={i}
        position={[x, y, z]}
        seed={i * 47.123}
        color={color}
      />
    );
  }
  
  return <group>{particles}</group>;
};
