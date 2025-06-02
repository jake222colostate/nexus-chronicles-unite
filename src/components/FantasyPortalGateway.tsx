
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FantasyPortalGateway: React.FC = () => {
  const portalRef = useRef<THREE.Group>(null);
  const energyRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    
    if (energyRef.current) {
      const material = energyRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <group ref={portalRef} position={[0, 0, -40]}>
      {/* Stone archway structure */}
      <group>
        {/* Left pillar */}
        <mesh position={[-3, 2, 0]} castShadow>
          <cylinderGeometry args={[0.8, 1, 4, 8]} />
          <meshStandardMaterial color="#696969" roughness={0.8} />
        </mesh>
        
        {/* Right pillar */}
        <mesh position={[3, 2, 0]} castShadow>
          <cylinderGeometry args={[0.8, 1, 4, 8]} />
          <meshStandardMaterial color="#696969" roughness={0.8} />
        </mesh>
        
        {/* Top arch */}
        <mesh position={[0, 4.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[3.5, 0.7, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#696969" roughness={0.8} />
        </mesh>
      </group>
      
      {/* Magical portal energy */}
      <mesh ref={energyRef} position={[0, 2, 0]}>
        <ringGeometry args={[2.5, 3, 32]} />
        <meshStandardMaterial 
          color="#4169E1"
          emissive="#1E90FF"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Portal light */}
      <pointLight 
        position={[0, 2, 0]}
        color="#4169E1"
        intensity={0.8}
        distance={20}
      />
    </group>
  );
};
